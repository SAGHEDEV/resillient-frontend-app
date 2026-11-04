import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Task, TaskStatus, ApiError } from '@/types/task'
import { normalizeApiError } from '@/utils/api'
import { ArrowLeft, Calendar, Clock, Trash2, AlertCircle, Loader2 } from 'lucide-react'
import { format, isValid } from 'date-fns'

interface TaskDetailModalProps {
  task: Task
  open: boolean
  onClose: () => void
  onUpdate: (
    id: string,
    data: { title: string; description: string | null; status: TaskStatus }
  ) => Promise<Task>
  onDelete: (id: string) => void
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString)
    if (isValid(date)) {
      return format(date, 'MMM d, yyyy h:mm a')
    }
    return 'N/A'
  } catch {
    return 'N/A'
  }
}

export function TaskDetailModal({
  task,
  open,
  onClose,
  onUpdate,
  onDelete,
}: TaskDetailModalProps) {
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description || '')
  const [status, setStatus] = useState<TaskStatus>(task.status)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const isTitleValid = title.trim().length > 0 && title.length <= 200
  const isDescriptionValid = description.length <= 2000
  const canSave = isTitleValid && isDescriptionValid && !loading

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    if (!canSave) return

    setLoading(true)
    setError(null)

    try {
      // Single unified update operation for title, description, and status
      await onUpdate(task.id, {
        title: title.trim(),
        description: description.trim() || null,
        status,
      })
      onClose()
    } catch (err: unknown) {
      // Keep local state intact on failure so user does not lose edits
      setError(normalizeApiError(err))
    } finally {
      setLoading(false)
    }
  }

  // Local-only status change; does NOT fire an API request until user saves
  const handleLocalStatusChange = (newStatus: TaskStatus) => {
    setStatus(newStatus)
    if (error) setError(null)
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:max-w-[700px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <div className="flex w-full items-center justify-between gap-3 pr-6">
            <Button variant="ghost" size="sm" onClick={onClose} className="w-fit cursor-pointer">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Board
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => handleSave()}
              disabled={!canSave}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </DialogHeader>

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" />
            <div>
              <p className="font-medium">
                {error.type === 'network'
                  ? 'Network Connection Failure'
                  : error.type === 'timeout'
                  ? 'Request Timeout'
                  : error.type === 'validation'
                  ? 'Validation Error'
                  : 'Update Failed'}
              </p>
              <p className="text-xs text-red-600">{error.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-title" className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                Task Title <span className="text-red-500">*</span>
              </Label>
              <span className={`text-xs ${title.length > 200 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {title.length}/200
              </span>
            </div>
            <Input
              id="task-title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Task title..."
              maxLength={200}
              className="text-base font-medium"
              required
            />
            {title.trim().length === 0 && (
              <p className="text-xs text-red-500">Title cannot be blank.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="task-desc" className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                Description
              </Label>
              <span className={`text-xs ${description.length > 2000 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {description.length}/2000
              </span>
            </div>
            <Textarea
              id="task-desc"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Add task description or acceptance criteria..."
              rows={5}
              maxLength={2000}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                Status
              </Label>
              <Select value={status} onValueChange={(v) => handleLocalStatusChange(v as TaskStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="backlog">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-400">
                Status updates locally and will be saved when clicking "Save Changes".
              </p>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold uppercase text-[var(--color-text-secondary)]">
                Details
              </Label>
              <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-page)] p-3 text-sm text-[var(--color-text-secondary)] space-y-2">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <span className="text-xs">Created:</span>
                  <span className="ml-auto font-medium text-[var(--color-text-main)]">{formatDate(task.createdAt)}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-[var(--color-text-secondary)]" />
                  <span className="text-xs">Updated:</span>
                  <span className="ml-auto font-medium text-[var(--color-text-main)]">{formatDate(task.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="outline"
              className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 cursor-pointer"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Task
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
