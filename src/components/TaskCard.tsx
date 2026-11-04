import type { Task, TaskStatus } from '@/types/task'
import { Clock, ArrowRightLeft } from 'lucide-react'
import { formatDistanceToNow, isValid } from 'date-fns'

interface TaskCardProps {
  task: Task
  onClick: () => void
  onStatusChange?: (taskId: string, newStatus: TaskStatus) => void
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isValid(date)) {
      return formatDistanceToNow(date, { addSuffix: true })
    }
    return 'recently'
  } catch {
    return 'recently'
  }
}

export function TaskCard({ task, onClick, onStatusChange }: TaskCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Open modal on Enter or Space
    if (e.key === 'Enter' || e.key === ' ') {
      // Do not trigger if event originated from a child button or select
      if ((e.target as HTMLElement).tagName !== 'SELECT' && (e.target as HTMLElement).tagName !== 'BUTTON') {
        e.preventDefault()
        onClick()
      }
    }
  }

  const handleQuickStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation()
    const newStatus = e.target.value as TaskStatus
    if (newStatus && newStatus !== task.status && onStatusChange) {
      onStatusChange(task.id, newStatus)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}. Column: ${task.status}. Press Enter to view details.`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('taskId', task.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      className="group relative cursor-grab rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 shadow-sm transition-all hover:border-[var(--color-primary)] hover:shadow-md active:cursor-grabbing focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-sm text-[var(--color-text-main)] group-hover:text-[var(--color-primary)] line-clamp-2">
          {task.title}
        </h3>
      </div>

      {task.description && task.description.trim() && (
        <p className="mt-2 line-clamp-2 text-xs text-[var(--color-text-secondary)]">
          {task.description}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-[var(--color-border)] pt-2 text-xs text-[var(--color-text-secondary)]">
        <div className="flex items-center text-[11px]">
          <Clock className="mr-1 h-3 w-3 shrink-0" />
          <span>{formatDate(task.updatedAt)}</span>
        </div>

        {/* Accessible mobile/keyboard-friendly quick status mover */}
        {onStatusChange && (
          <div
            className="flex items-center gap-1"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          >
            <label htmlFor={`quick-move-${task.id}`} className="sr-only">
              Move task {task.title} to status
            </label>
            <ArrowRightLeft className="h-3 w-3 text-[var(--color-text-secondary)]" aria-hidden="true" />
            <select
              id={`quick-move-${task.id}`}
              value={task.status}
              onChange={handleQuickStatusChange}
              aria-label={`Move status for task "${task.title}"`}
              className="rounded border border-[var(--color-border)] bg-[var(--color-bg-page)] px-1.5 py-0.5 text-[11px] text-[var(--color-text-main)] focus:border-[var(--color-primary)] focus:outline-none"
            >
              <option value="backlog">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="pending">Pending</option>
              <option value="done">Completed</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}
