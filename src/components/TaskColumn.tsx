import type { Task, TaskStatus } from '@/types/task'
import { TaskCard } from './TaskCard'
import { Plus } from 'lucide-react'
import { useState } from 'react'

interface TaskColumnProps {
  title: string
  tasks: Task[]
  count: number
  status: TaskStatus
  onTaskClick: (task: Task) => void
  onTaskDrop: (taskId: string, newStatus: TaskStatus) => void
  onAddClick?: (status: TaskStatus) => void
}

export function TaskColumn({
  title,
  tasks,
  count,
  status,
  onTaskClick,
  onTaskDrop,
  onAddClick,
}: TaskColumnProps) {
  const [isDragOver, setIsDragOver] = useState(false)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const taskId = e.dataTransfer.getData('taskId')
    if (taskId) {
      onTaskDrop(taskId, status)
    }
  }

  return (
    <div
      className={`flex min-h-[500px] w-full flex-col rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft-green)]/40 p-4 transition-all ${
        isDragOver
          ? 'border-[var(--color-primary)] bg-[var(--color-bg-page)] ring-2 ring-[var(--color-primary)] ring-opacity-20'
          : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Column Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-sm text-[var(--color-text-main)]">{title}</h2>
          <span className="flex h-5 min-w-5 px-1.5 items-center justify-center rounded-full bg-[var(--color-surface)] text-xs font-semibold text-[var(--color-text-secondary)] shadow-sm">
            {count}
          </span>
        </div>

        {/* Functional Column Action Button */}
        {onAddClick && (
          <button
            type="button"
            onClick={() => onAddClick(status)}
            title={`Add task to ${title}`}
            aria-label={`Add task to ${title}`}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text-secondary)] shadow-xs transition-colors hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] cursor-pointer"
          >
            <Plus className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Task List */}
      <div className="space-y-3 flex-1">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[var(--color-text-secondary)] text-center">
            <div className="mb-2 text-2xl font-light opacity-50">Empty</div>
            <p className="text-xs">No tasks in this column</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task)}
              onStatusChange={onTaskDrop}
            />
          ))
        )}
      </div>
    </div>
  )
}
