import type { Task } from '@/types/task'
import { CheckCircle2, Circle, Clock, ListTodo } from 'lucide-react'

interface TaskStatsProps {
  tasks: Task[]
}

export function TaskStats({ tasks }: TaskStatsProps) {
  const total = tasks.length
  const backlog = tasks.filter((t) => t.status === 'backlog').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress').length
  const completed = tasks.filter((t) => t.status === 'done').length

  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

  const stats = [
    { label: 'Total Tasks', value: total, icon: ListTodo, color: 'text-[var(--color-text-main)]' },
    { label: 'To Do', value: backlog, icon: Circle, color: 'text-[var(--color-text-secondary)]' },
    { label: 'In Progress', value: inProgress, icon: Clock, color: 'text-[var(--color-warning)]' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-[var(--color-primary)]' },
  ]

  return (
    <div className="mb-6">
      <div className="mb-4 grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 sm:p-4 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs sm:text-sm text-[var(--color-text-secondary)]">{stat.label}</p>
                  <p className="mt-0.5 text-xl sm:text-2xl font-bold text-[var(--color-text-main)]">{stat.value}</p>
                </div>
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-lg bg-[var(--color-bg-page)] shrink-0">
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {total > 0 && (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5 sm:p-4 shadow-xs">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs sm:text-sm font-medium text-[var(--color-text-main)]">Overall Completion</span>
            <span className="text-xs sm:text-sm font-bold text-[var(--color-primary)]">{completionRate}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-bg-page)]">
            <div
              className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
