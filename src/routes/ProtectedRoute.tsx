import { Navigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isValidating } = useAuth()

  if (isValidating) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg-page)]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]"></div>
          <p className="text-sm font-medium text-[var(--color-text-main)]">Verifying session</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Connecting to backend server...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
