import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuthActions } from '@/action/useAuth'
import { useAuth } from '@/context/AuthContext'
import { AlertCircle, Loader2, WifiOff } from 'lucide-react'

export function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const { register, loading, error, clearError } = useAuthActions()
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // Redirect to board if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/board', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const isFormValid =
    name.trim().length > 0 &&
    email.trim().includes('@') &&
    password.length >= 6 &&
    !loading

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    clearError()

    try {
      await register({ name: name.trim(), email: email.trim(), password })
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
          <p className="mt-1.5 text-xs sm:text-sm text-[var(--color-text-secondary)]">Create your account</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 sm:p-8 shadow-sm">
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error.type === 'network' ? (
                <WifiOff className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
              )}
              <div>
                <p className="font-semibold">
                  {error.type === 'network' ? 'Server Connection Failed' : 'Registration Failed'}
                </p>
                <p>{error.message}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-sm font-medium">
                Full Name
              </Label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value)
                  if (error) clearError()
                }}
                placeholder="Jane Doe"
                required
                maxLength={100}
                disabled={loading}
                className="text-sm"
              />
            </div>

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
                placeholder="jane@example.com"
                required
                disabled={loading}
                className="text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <span className="text-xs text-gray-400">Min. 6 characters</span>
              </div>
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
                minLength={6}
                disabled={loading}
                className="text-sm"
              />
            </div>

            <Button
              type="submit"
              disabled={!isFormValid}
              className="mt-2 w-full bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] cursor-pointer text-white shadow-xs"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Sign up'
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs sm:text-sm text-[var(--color-text-secondary)]">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
