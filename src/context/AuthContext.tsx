import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
// NOTE: useEffect is used for the cross-tab storage listener below.
import type { User } from '@/types/task'

interface AuthContextType {
  user: User | null
  token: string | null
  login: (token: string, user: User) => void
  logout: () => void
  isAuthenticated: boolean
  isValidating: boolean
  sessionError: string | null
  clearSessionError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function getSafeStoredUser(): User | null {
  try {
    const raw = localStorage.getItem('user')
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === 'object' &&
      // id may be a number (from backend) or string — accept both
      (typeof parsed.id === 'string' || typeof parsed.id === 'number') &&
      typeof parsed.email === 'string' &&
      typeof parsed.name === 'string'
    ) {
      return { ...parsed, id: String(parsed.id) } as User
    }
    // Malformed user structure — clear it
    localStorage.removeItem('user')
    return null
  } catch {
    // Malformed JSON
    localStorage.removeItem('user')
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [user, setUser] = useState<User | null>(getSafeStoredUser)
  // No /api/auth/me endpoint on this backend — trust the stored token.
  // If it is expired the first protected API request will return 401 and the
  // response interceptor in api.ts will clear storage and redirect to /login.
  const [isValidating] = useState<boolean>(false)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const logout = useCallback(() => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setToken(null)
    setUser(null)
  }, [])

  // Listen for storage changes from other tabs so logout propagates
  useEffect(() => {
    function handleStorage(e: StorageEvent) {
      if (e.key === 'token' && !e.newValue) {
        logout()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [logout])

  const login = (newToken: string, newUser: User) => {
    localStorage.setItem('token', newToken)
    localStorage.setItem('user', JSON.stringify(newUser))
    setToken(newToken)
    setUser(newUser)
    setSessionError(null)
  }

  const clearSessionError = () => setSessionError(null)

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAuthenticated: Boolean(token && user && !isValidating),
        isValidating,
        sessionError,
        clearSessionError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
