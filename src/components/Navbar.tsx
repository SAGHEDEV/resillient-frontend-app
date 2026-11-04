import { useAuth } from '@/context/AuthContext'
import { Button } from '@/components/ui/button'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { LogOut, User as UserIcon } from 'lucide-react'

export function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const today = format(new Date(), 'EEE, MMM d, yyyy')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 sm:px-6 py-3.5 shadow-xs">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[var(--color-bg-soft-green)] font-bold text-[var(--color-primary)]">
            ✓
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-[var(--color-text-main)] leading-tight">
              Resilient Task Board
            </h1>
            <p className="text-xs text-[var(--color-text-secondary)]">{today}</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 border-t border-[var(--color-border)] sm:border-t-0 pt-2 sm:pt-0">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-bg-page)] text-[var(--color-text-secondary)]">
              <UserIcon className="h-4 w-4" />
            </div>
            <div className="text-left sm:text-right">
              <p className="text-xs sm:text-sm font-semibold text-[var(--color-text-main)] truncate max-w-[150px] sm:max-w-[200px]">
                {user?.name || 'User'}
              </p>
              <p className="text-[11px] text-[var(--color-text-secondary)] truncate max-w-[150px] sm:max-w-[200px]">
                {user?.email || ''}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            className="border-[var(--color-border)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 cursor-pointer"
          >
            <LogOut className="mr-1.5 h-3.5 w-3.5" />
            <span className="hidden sm:inline">Logout</span>
            <span className="sm:hidden">Exit</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}
