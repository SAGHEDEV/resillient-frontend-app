import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_FILE = path.join(__dirname, 'data.json')
const PORT = process.env.PORT || 4000

const VALID_STATUSES = ['backlog', 'in_progress', 'pending', 'done']

// Initial Seed Data
export const initialData = {
  users: [
    {
      id: 'user-demo-1',
      name: 'Demo User',
      email: 'demo@example.com',
      password: 'password123',
    },
  ],
  tokens: {
    'demo-token-12345': 'user-demo-1',
  },
  tasks: [
    {
      id: 'task-1',
      userId: 'user-demo-1',
      title: 'Design presentation slides',
      description: 'Outline key architectural differences between resilient and unresilient apps.',
      status: 'backlog',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    },
    {
      id: 'task-2',
      userId: 'user-demo-1',
      title: 'Prepare demo scenarios',
      description: 'Plan live offline switch test to show how an unresilient app fails without internet.',
      status: 'in_progress',
      createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'task-3',
      userId: 'user-demo-1',
      title: 'Test Kanban column transitions',
      description: 'Verify drag and drop works between To Do, In Progress, Pending, and Completed.',
      status: 'pending',
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    },
    {
      id: 'task-4',
      userId: 'user-demo-1',
      title: 'Initialize repository structure',
      description: 'Vite, React 19, TypeScript, and shadcn/ui components configured.',
      status: 'done',
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    },
  ],
}

// Load data from disk or initialize
export function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8')
      const parsed = JSON.parse(content)
      if (parsed && Array.isArray(parsed.users) && Array.isArray(parsed.tasks)) {
        return parsed
      }
    }
  } catch (err) {
    console.error('Error reading data file, using default seed:', err)
  }
  saveData(initialData)
  return initialData
}

// Save data to disk
export function saveData(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
  } catch (err) {
    console.error('Error writing data file:', err)
  }
}

export let db = loadData()

// Helper: send JSON response
export function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  })
  res.end(JSON.stringify(payload))
}

// Helper: parse request body as JSON
export function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', (chunk) => {
      body += chunk
    })
    req.on('end', () => {
      if (!body) return resolve({})
      try {
        resolve(JSON.parse(body))
      } catch {
        reject(new Error('Invalid JSON format'))
      }
    })
    req.on('error', reject)
  })
}

// Helper: authenticate request
export function authenticate(req) {
  const authHeader = req.headers['authorization'] || ''
  if (!authHeader.startsWith('Bearer ')) {
    return null
  }
  const token = authHeader.slice(7).trim()
  const userId = db.tokens[token]
  if (!userId) return null
  return db.users.find((u) => u.id === userId) || null
}

export async function handleRequest(req, res) {
  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    })
    return res.end()
  }

  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`)
  const pathname = url.pathname

  try {
    // 1. POST /api/auth/register
    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req)
      const { name, email, password } = body

      if (!name || typeof name !== 'string' || !name.trim()) {
        return sendJson(res, 400, { message: 'Full name is required' })
      }
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return sendJson(res, 400, { message: 'A valid email address is required' })
      }
      if (!password || typeof password !== 'string' || password.length < 6) {
        return sendJson(res, 400, { message: 'Password must be at least 6 characters long' })
      }

      const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (existing) {
        return sendJson(res, 400, { message: 'User already exists with this email' })
      }

      const newUser = {
        id: `user-${crypto.randomUUID()}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      }
      const token = `token-${crypto.randomBytes(24).toString('hex')}`

      db.users.push(newUser)
      db.tokens[token] = newUser.id
      saveData(db)

      const userSafe = { id: newUser.id, name: newUser.name, email: newUser.email }
      return sendJson(res, 201, {
        token,
        user: userSafe,
        data: { token, user: userSafe },
      })
    }

    // 2. POST /api/auth/login
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req)
      const { email, password } = body
      if (!email || !password) {
        return sendJson(res, 400, { message: 'Email and password are required' })
      }

      const user = db.users.find(
        (u) => u.email.toLowerCase() === String(email).trim().toLowerCase() && u.password === password
      )
      if (!user) {
        return sendJson(res, 401, { message: 'Invalid email or password' })
      }

      let token = Object.keys(db.tokens).find((t) => db.tokens[t] === user.id)
      if (!token) {
        token = `token-${crypto.randomBytes(24).toString('hex')}`
        db.tokens[token] = user.id
        saveData(db)
      }

      const userSafe = { id: user.id, name: user.name, email: user.email }
      return sendJson(res, 200, {
        token,
        user: userSafe,
        data: { token, user: userSafe },
      })
    }

    // 3. GET /api/auth/me - Verify current session
    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = authenticate(req)
      if (!user) {
        return sendJson(res, 401, { message: 'Session expired or invalid. Please sign in.' })
      }
      const userSafe = { id: user.id, name: user.name, email: user.email }
      return sendJson(res, 200, {
        user: userSafe,
        data: { user: userSafe },
      })
    }

    // Require Auth for all /api/tasks routes
    if (pathname.startsWith('/api/tasks')) {
      const user = authenticate(req)
      if (!user) {
        return sendJson(res, 401, { message: 'Unauthorized. Please sign in.' })
      }

      // 4. GET /api/tasks
      if (pathname === '/api/tasks' && req.method === 'GET') {
        const statusFilter = url.searchParams.get('status')
        let userTasks = db.tasks.filter((t) => t.userId === user.id)
        if (statusFilter) {
          userTasks = userTasks.filter((t) => t.status === statusFilter)
        }
        return sendJson(res, 200, { data: userTasks })
      }

      // 5. POST /api/tasks
      if (pathname === '/api/tasks' && req.method === 'POST') {
        const body = await parseBody(req)

        if (!body.title || typeof body.title !== 'string' || !body.title.trim()) {
          return sendJson(res, 400, { message: 'Task title is required' })
        }
        if (body.title.trim().length > 200) {
          return sendJson(res, 400, { message: 'Title cannot exceed 200 characters' })
        }

        let description = null
        if (body.description !== undefined && body.description !== null) {
          if (typeof body.description !== 'string') {
            return sendJson(res, 400, { message: 'Description must be a string' })
          }
          if (body.description.length > 2000) {
            return sendJson(res, 400, { message: 'Description cannot exceed 2000 characters' })
          }
          description = body.description.trim() || null
        }

        const status = VALID_STATUSES.includes(body.status) ? body.status : 'backlog'
        const now = new Date().toISOString()
        const newTask = {
          id: `task-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
          userId: user.id,
          title: body.title.trim(),
          description,
          status,
          createdAt: now,
          updatedAt: now,
        }

        db.tasks.unshift(newTask)
        saveData(db)

        return sendJson(res, 201, { data: newTask, ...newTask })
      }

      // Route parameter matching: /api/tasks/:id/status
      const taskStatusMatch = pathname.match(/^\/api\/tasks\/([^/]+)\/status$/)
      if (taskStatusMatch && req.method === 'PATCH') {
        const taskId = taskStatusMatch[1]
        const body = await parseBody(req)
        if (!body.status || !VALID_STATUSES.includes(body.status)) {
          return sendJson(res, 400, {
            message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
          })
        }

        const taskIndex = db.tasks.findIndex((t) => String(t.id) === String(taskId) && t.userId === user.id)
        if (taskIndex === -1) {
          return sendJson(res, 404, { message: 'Task not found' })
        }

        db.tasks[taskIndex].status = body.status
        db.tasks[taskIndex].updatedAt = new Date().toISOString()
        saveData(db)

        return sendJson(res, 200, { data: db.tasks[taskIndex], ...db.tasks[taskIndex] })
      }

      const singleTaskMatch = pathname.match(/^\/api\/tasks\/([^/]+)$/)
      if (singleTaskMatch) {
        const taskId = singleTaskMatch[1]
        const taskIndex = db.tasks.findIndex((t) => String(t.id) === String(taskId) && t.userId === user.id)

        // 6. GET /api/tasks/:id
        if (req.method === 'GET') {
          if (taskIndex === -1) {
            return sendJson(res, 404, { message: 'Task not found' })
          }
          return sendJson(res, 200, { data: db.tasks[taskIndex], ...db.tasks[taskIndex] })
        }

        // 7. PUT /api/tasks/:id - Atomic update for title, description, and status
        if (req.method === 'PUT') {
          if (taskIndex === -1) {
            return sendJson(res, 404, { message: 'Task not found' })
          }
          const body = await parseBody(req)

          if (body.title !== undefined) {
            if (typeof body.title !== 'string' || !body.title.trim()) {
              return sendJson(res, 400, { message: 'Task title cannot be empty' })
            }
            if (body.title.trim().length > 200) {
              return sendJson(res, 400, { message: 'Title cannot exceed 200 characters' })
            }
            db.tasks[taskIndex].title = body.title.trim()
          }

          if (body.description !== undefined) {
            if (body.description === null || body.description === '') {
              db.tasks[taskIndex].description = null
            } else if (typeof body.description === 'string') {
              if (body.description.length > 2000) {
                return sendJson(res, 400, { message: 'Description cannot exceed 2000 characters' })
              }
              db.tasks[taskIndex].description = body.description.trim() || null
            } else {
              return sendJson(res, 400, { message: 'Description must be a string or null' })
            }
          }

          if (body.status !== undefined) {
            if (!VALID_STATUSES.includes(body.status)) {
              return sendJson(res, 400, {
                message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
              })
            }
            db.tasks[taskIndex].status = body.status
          }

          db.tasks[taskIndex].updatedAt = new Date().toISOString()
          saveData(db)

          return sendJson(res, 200, { data: db.tasks[taskIndex], ...db.tasks[taskIndex] })
        }

        // 8. DELETE /api/tasks/:id
        if (req.method === 'DELETE') {
          if (taskIndex === -1) {
            return sendJson(res, 404, { message: 'Task not found' })
          }
          db.tasks.splice(taskIndex, 1)
          saveData(db)
          return sendJson(res, 200, { message: 'Task deleted successfully' })
        }
      }
    }

    // 404 for unknown endpoints
    return sendJson(res, 404, { message: `Not Found: ${req.method} ${pathname}` })
  } catch (error) {
    console.error('Server error:', error)
    return sendJson(res, 500, { message: 'Internal server error' })
  }
}

// Only start listener if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const server = http.createServer(handleRequest)

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${PORT} is already in use. An existing backend server is already running on port ${PORT}.`)
    } else {
      console.error('Server error:', err)
    }
  })

  server.listen(PORT, () => {
    console.log(`\n🚀 Task Board Backend Server running at: http://localhost:${PORT}`)
    console.log(`📝 Ready to handle authentication and task board API requests\n`)
  })
}
