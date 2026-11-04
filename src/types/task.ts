export type TaskStatus = 'backlog' | 'in_progress' | 'pending' | 'done'

export interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
}

export type ApiErrorType =
  | 'network'
  | 'timeout'
  | 'auth'
  | 'validation'
  | 'server'
  | 'unknown'

export interface ApiError {
  type: ApiErrorType
  message: string
  status?: number
  details?: unknown
}

export interface UpdateTaskPayload {
  title?: string
  description?: string | null
  status?: TaskStatus
}

export interface CreateTaskPayload {
  title: string
  description?: string | null
  status?: TaskStatus
}
