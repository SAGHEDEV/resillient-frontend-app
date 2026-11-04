import { useState } from 'react'
import { api, normalizeApiError } from '@/utils/api'
import { useAuth } from '@/context/AuthContext'
import type { ApiError, User } from '@/types/task'

interface RegisterData {
  name: string
  email: string
  password: string
}

interface LoginData {
  email: string
  password: string
}

// Normalize user from backend: id may be a number, coerce to string
function normalizeUser(raw: Record<string, unknown>): User {
  return {
    id: String(raw.id),
    name: String(raw.name || ''),
    email: String(raw.email || ''),
  }
}

export function useAuthActions() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)
  const { login: saveAuth } = useAuth()

  const register = async (data: RegisterData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/api/auth/register', data)
      const resData = response.data?.data ?? response.data
      const user = normalizeUser(resData.user as Record<string, unknown>)
      saveAuth(resData.token as string, user)
      return resData
    } catch (err: unknown) {
      const normalized = normalizeApiError(err)
      setError(normalized)
      throw normalized
    } finally {
      setLoading(false)
    }
  }

  const login = async (data: LoginData) => {
    setLoading(true)
    setError(null)
    try {
      const response = await api.post('/api/auth/login', data)
      const resData = response.data?.data ?? response.data
      const user = normalizeUser(resData.user as Record<string, unknown>)
      saveAuth(resData.token as string, user)
      return resData
    } catch (err: unknown) {
      const normalized = normalizeApiError(err)
      setError(normalized)
      throw normalized
    } finally {
      setLoading(false)
    }
  }

  return { register, login, loading, error, clearError: () => setError(null) }
}
