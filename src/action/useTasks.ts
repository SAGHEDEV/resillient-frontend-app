import { useState, useEffect, useCallback, useRef } from 'react'
import axios from 'axios'
import { api, normalizeApiError } from '@/utils/api'
import type { Task, TaskStatus, ApiError, CreateTaskPayload, UpdateTaskPayload } from '@/types/task'

export type { Task, TaskStatus, ApiError } from '@/types/task'

function parseTask(item: Record<string, unknown>): Task {
  return {
    id: String(item.id),
    title: String(item.title || ''),
    description: item.description ? String(item.description) : null,
    status: item.status as TaskStatus,
    // Backend returns snake_case timestamps (created_at / updated_at)
    createdAt: (item.created_at as string) || (item.createdAt as string) || new Date().toISOString(),
    updatedAt: (item.updated_at as string) || (item.updatedAt as string) || new Date().toISOString(),
  }
}

function parseTasks(rawData: unknown): Task[] {
  if (!Array.isArray(rawData)) return []
  return rawData.map((item) => parseTask(item as Record<string, unknown>))
}

export function useTasks(status?: TaskStatus) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  // Track active abort controller to cancel obsolete requests
  const activeAbortRef = useRef<AbortController | null>(null)

  // Initial and reactive fetch on status change
  useEffect(() => {
    let ignore = false
    const controller = new AbortController()
    activeAbortRef.current = controller

    async function loadTasks() {
      try {
        const url = status ? `/api/tasks?status=${status}` : '/api/tasks'
        const response = await api.get(url, { signal: controller.signal })

        if (!ignore) {
          const rawData = response.data?.data ?? response.data
          setTasks(parseTasks(rawData))
          setError(null)
          setLoading(false)
        }
      } catch (err: unknown) {
        if (!ignore) {
          if (!axios.isCancel(err) && !(err instanceof Error && err.name === 'CanceledError')) {
            setError(normalizeApiError(err))
          }
          setLoading(false)
        }
      }
    }

    loadTasks()

    return () => {
      ignore = true
      controller.abort()
    }
  }, [status])

  // Explicit refetch triggered by user interaction (e.g., clicking retry)
  const refetch = useCallback(async () => {
    if (activeAbortRef.current) {
      activeAbortRef.current.abort()
    }

    const controller = new AbortController()
    activeAbortRef.current = controller
    setRefreshing(true)

    try {
      const url = status ? `/api/tasks?status=${status}` : '/api/tasks'
      const response = await api.get(url, { signal: controller.signal })
      const rawData = response.data?.data ?? response.data

      setTasks(parseTasks(rawData))
      setError(null)
    } catch (err: unknown) {
      if (!axios.isCancel(err) && !(err instanceof Error && err.name === 'CanceledError')) {
        setError(normalizeApiError(err))
      }
    } finally {
      setRefreshing(false)
    }
  }, [status])

  const createTask = async (payload: CreateTaskPayload) => {
    const response = await api.post('/api/tasks', payload)
    const raw = response.data?.data ?? response.data
    const newTask = parseTask(raw as Record<string, unknown>)
    setTasks((prev) => [newTask, ...prev])
    return newTask
  }

  const updateTask = async (id: string, payload: UpdateTaskPayload) => {
    // The backend PUT /api/tasks/:id only accepts title + description.
    // Status must go through PATCH /api/tasks/:id/status.
    // We fire both when status changed, treating title/description as the
    // primary operation and status as a follow-up.
    const { status: newStatus, ...rest } = payload

    // Always call PUT for title/description (even if unchanged — backend is idempotent)
    const putResponse = await api.put(`/api/tasks/${id}`, rest)
    let raw = putResponse.data?.data ?? putResponse.data

    // If status changed, follow up with PATCH
    if (newStatus !== undefined) {
      const patchResponse = await api.patch(`/api/tasks/${id}/status`, { status: newStatus })
      raw = patchResponse.data?.data ?? patchResponse.data
    }

    const updatedTask = parseTask(raw as Record<string, unknown>)
    setTasks((prev) => prev.map((t) => (t.id === String(id) ? updatedTask : t)))
    return updatedTask
  }

  const updateTaskStatus = async (id: string, newStatus: TaskStatus) => {
    const response = await api.patch(`/api/tasks/${id}/status`, { status: newStatus })
    const raw = response.data?.data ?? response.data
    const updatedTask = parseTask(raw as Record<string, unknown>)
    setTasks((prev) => prev.map((t) => (t.id === String(id) ? updatedTask : t)))
    return updatedTask
  }

  const deleteTask = async (id: string) => {
    await api.delete(`/api/tasks/${id}`)
    setTasks((prev) => prev.filter((t) => t.id !== String(id)))
  }

  return {
    tasks,
    loading,
    refreshing,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    refetch,
  }
}
