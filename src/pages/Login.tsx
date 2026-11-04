import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthActions } from '@/action/useAuth'
import { useAuth } from '@/context/AuthContext'
import { AlertCircle, Loader2, WifiOff } from 'lucide-react'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { login, loading, error, clearError } = useAuthActions()
  const { isAuthenticated, sessionError, clearSessionError } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  // Redirect to board if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/board', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const isExpired = new URLSearchParams(location.search).get('expired') === '1'

  const canSubmit = email.trim().length > 0 && password.length >= 1 && !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    clearSessionError()
    clearError()

    try {
      await login({ email: email.trim(), password })
      navigate('/board', { replace: true })
    } catch {
      // Handled in useAuthActions
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg-page)] p-4 sm:p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[var(--color-bg-soft-green)] text-2xl font-bold text-[var(--color-primary)] shadow-xs">
            ✓
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text-main)]">Resilient Task Board</h1>
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-text-secondary)]">Sign in to your account</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm">
          {/* Session Expiry Notice */}
          {(sessionError || isExpired) && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
              <AlertCircle className="h-4 w-4 shrink-0 text-amber-600" />
              <span>{sessionError || 'Your session expired. Please sign in again.'}</span>
            </div>
          )}

          {/* Form Error Notice */}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error.type === 'network' ? (
                <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <div>
                <p className="font-semibold">
                  {error.type === 'network' ? 'Server Connection Failed' : 'Sign In Failed'}
                </p>
                <p>{error.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (error) clearError()
                }}
                placeholder="demo@example.com"
                required
                disabled={loading}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-sm font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) clearError()
                }}
                placeholder="••••••••"
                required
                disabled={loading}
                className="text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] cursor-pointer text-white shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
