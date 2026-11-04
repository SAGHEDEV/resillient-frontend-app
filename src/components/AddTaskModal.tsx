import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { TaskStatus, ApiError, CreateTaskPayload } from '@/types/task'
import { normalizeApiError } from '@/utils/api'
import { X, AlertCircle, Loader2 } from 'lucide-react'

interface AddTaskModalProps {
  open: boolean
  initialStatus?: TaskStatus
  onClose: () => void
  onSubmit: (data: CreateTaskPayload) => Promise<unknown>
}

export function AddTaskModal({ open, initialStatus = 'backlog', onClose, onSubmit }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>(initialStatus)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<ApiError | null>(null)

  const isTitleValid = title.trim().length > 0 && title.length <= 200
  const isDescriptionValid = description.length <= 2000
  const canSubmit = isTitleValid && isDescriptionValid && !loading

  const handleClose = () => {
    if (loading) return
    setTitle('')
    setDescription('')
    setStatus(initialStatus)
    setError(null)
    onClose()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim() || null,
        status,
      })
      handleClose()
    } catch (err: unknown) {
      setError(normalizeApiError(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Task</DialogTitle>
          <button
            onClick={handleClose}
            disabled={loading}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
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
                  : 'Failed to Create Task'}
              </p>
              <p className="text-xs text-red-600">{error.message}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="title" className="text-sm font-medium">
                Title <span className="text-red-500">*</span>
              </Label>
              <span className={`text-xs ${title.length > 200 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {title.length}/200
              </span>
            </div>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (error) setError(null)
              }}
              placeholder="e.g., Implement resilient sync queue"
              maxLength={200}
              required
              disabled={loading}
              className="text-sm"
            />
            {title.trim().length === 0 && title.length > 0 && (
              <p className="text-xs text-red-500">Title cannot consist only of spaces.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium">
                Description
              </Label>
              <span className={`text-xs ${description.length > 2000 ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
                {description.length}/2000
              </span>
            </div>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (error) setError(null)
              }}
              placeholder="Add details, criteria, or context..."
              rows={4}
              maxLength={2000}
              disabled={loading}
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-sm font-medium">
              Initial Column
            </Label>
            <Select
              value={status}
              onValueChange={(v) => setStatus(v as TaskStatus)}
              disabled={loading}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select column" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">To Do</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="done">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--color-border)]">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={loading}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Task'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
