# Resilient Task Board

A beautiful, modern fullstack task management application built with React, TypeScript, Tailwind CSS, and shadcn/ui.

This baseline represents the **unresilient version** of the application (traditional direct client-server coupling without offline compatibility), designed as the starting point for architectural presentations and workshops on building resilient web applications.

## Features

- 🔐 **Authentication** - Login and Register pages with token management
- 📋 **Kanban Board** - Drag-and-drop task management with To Do, In Progress, Pending, and Completed columns
- ✨ **Task Management** - Create, update, delete, view, and drag-and-drop tasks
- 🔍 **Search & Stats** - Real-time task filtering and live completion statistics
- 🎨 **Modern UI** - Built with shadcn/ui components, Lucide icons, and Tailwind CSS
- 📱 **Responsive Design** - Clean layout on desktop and mobile devices
- 🚀 **Fullstack Ready** - Includes a zero-dependency Node.js backend server with seed demo data

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, React Router v7, Tailwind CSS v4, shadcn/ui, Axios, date-fns, Lucide React
- **Backend**: Node.js REST API with file-based persistence (`server/index.js`, `server/data.json`)

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm

### 1. Installation

```bash
pnpm install
```

### 2. Environment Configuration

Check `.env` (configured for port 4000):

```bash
VITE_API_URL=http://localhost:4000
```

### 3. Start the Backend Server

Start the backend server on port 4000:

```bash
pnpm run server
```

The backend server will start at `http://localhost:4000` with pre-seeded demo tasks.

### 4. Start the Frontend Application

In a separate terminal, start the Vite development server:

```bash
pnpm dev
```

Visit `http://localhost:5173` in your browser.

### Demo Credentials

You can log in immediately using the pre-seeded account or register a new one:

- **Email:** `demo@example.com`
- **Password:** `password123`

---

## Presentation Demo: Unresilient Baseline

This codebase intentionally implements standard, straightforward client-server patterns typical of junior/intermediate development:

1. **Direct Network Dependency**: Every read and mutation (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) goes straight over HTTP.
2. **No Offline Storage**: Tasks and state are not cached in IndexedDB or localStorage.
3. **No Background Sync or Mutation Queue**: If the network is interrupted or the server stops, pending actions fail and input is lost.
4. **Immediate Failure States**: When offline, navigating or refreshing reveals connection error banners, and adding or dragging cards halts with network error alerts.

### How to Demonstrate in Presentation:

1. **Happy Path (Online)**:
   - Log in with `demo@example.com` / `password123`.
   - Add a task, drag it across columns, edit details, and view updated stats.
2. **Failure Demonstration (Unresilient)**:
   - Turn on Chrome DevTools **Network > Offline** mode (or stop `pnpm run server`).
   - Try creating a new task: observe the network failure error.
   - Try dragging a card: observe that the action cannot be saved.
   - Refresh the page: observe that tasks cannot load without an active connection.
3. **Contrast with Resilient Version**:
   - Ready for you to demonstrate introducing offline-first techniques (Service Workers, IndexedDB, background sync, optimistic UI rollbacks).

---

## API Endpoints

The backend server provides the following REST API endpoints:

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/register` | Register new user account (`name`, `email`, `password`) |
| POST | `/api/auth/login` | Log in with credentials and receive auth token |
| GET | `/api/tasks` | List tasks for authenticated user (`?status=` optional filter) |
| GET | `/api/tasks/:id` | Retrieve single task |
| POST | `/api/tasks` | Create new task (`title`, `description`, `status`) |
| PUT | `/api/tasks/:id` | Update task title and description |
| PATCH | `/api/tasks/:id/status` | Update task status (`backlog`, `in_progress`, `pending`, `done`) |
| DELETE | `/api/tasks/:id` | Delete a task |

## License

MIT
