import axios, { type AxiosError } from 'axios'
import type { ApiError } from '@/types/task'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

// Create axios instance with timeout and base configuration
export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 second timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to outgoing requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Normalizes any error into a consistent ApiError structure
export function normalizeApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosErr = error as AxiosError<{ message?: string }>

    // Timeout detection
    if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.toLowerCase().includes('timeout')) {
      return {
        type: 'timeout',
        message: 'The request timed out. Please check your connection and try again.',
      }
    }

    // Network / offline failure
    if (!axiosErr.response || axiosErr.code === 'ERR_NETWORK') {
      return {
        type: 'network',
        message: 'Unable to reach the server. Make sure the backend server is running and you are connected to the network.',
      }
    }

    const status = axiosErr.response.status
    const serverMessage = axiosErr.response.data?.message

    if (status === 401) {
      return {
        type: 'auth',
        status,
        message: serverMessage || 'Invalid credentials or session expired.',
      }
    }

    if (status === 400 || status === 422) {
      return {
        type: 'validation',
        status,
        message: serverMessage || 'Invalid request data provided.',
      }
    }

    if (status === 404) {
      return {
        type: 'validation',
        status,
        message: serverMessage || 'Requested resource was not found.',
      }
    }

    if (status >= 500) {
      return {
        type: 'server',
        status,
        message: serverMessage || 'Server error encountered. Please try again later.',
      }
    }

    return {
      type: 'unknown',
      status,
      message: serverMessage || axiosErr.message || 'An unexpected error occurred.',
    }
  }

  if (error instanceof Error) {
    if (error.name === 'CanceledError' || error.name === 'AbortError') {
      return {
        type: 'network',
        message: 'Request was cancelled.',
      }
    }
    return {
      type: 'unknown',
      message: error.message,
    }
  }

  return {
    type: 'unknown',
    message: 'An unexpected error occurred.',
  }
}

// Track redirect state to prevent loops
let isRedirecting = false

// Interceptor for responses
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const isAuthEndpoint =
      error.config?.url?.includes('/api/auth/login') ||
      error.config?.url?.includes('/api/auth/register')

    // Only treat 401 on non-login/non-register endpoints as session expiry
    if (error.response?.status === 401 && !isAuthEndpoint) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')

      const currentPath = window.location.pathname
      if (!isRedirecting && currentPath !== '/login' && currentPath !== '/register') {
        isRedirecting = true
        // Redirect with message state
        window.location.href = '/login?expired=1'
      }
    }

    return Promise.reject(error)
  }
)
