import { useState, useMemo } from 'react'
import { Navbar } from '@/components/Navbar'
import { TaskColumn } from '@/components/TaskColumn'
import { TaskDetailModal } from '@/components/TaskDetailModal'
import { AddTaskModal } from '@/components/AddTaskModal'
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal'
import { TaskStats } from '@/components/TaskStats'
import { SearchBar } from '@/components/SearchBar'
import { Button } from '@/components/ui/button'
import { useTasks, type Task, type TaskStatus, type ApiError } from '@/action/useTasks'
import { normalizeApiError } from '@/utils/api'
import { Plus, AlertCircle, RefreshCw, Loader2, WifiOff } from 'lucide-react'

export function Board() {
  const {
    tasks,
    loading,
    refreshing,
    error,
    createTask,
    updateTask,
    updateTaskStatus,
    deleteTask,
    refetch,
  } = useTasks()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalStatus, setAddModalStatus] = useState<TaskStatus>('backlog')
  const [searchQuery, setSearchQuery] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [isMovingStatus, setIsMovingStatus] = useState(false)
  const [actionError, setActionError] = useState<ApiError | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; task: Task | null }>({
    show: false,
    task: null,
  })

  // Filter tasks by search query
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks

    const query = searchQuery.toLowerCase()
    return tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(query) ||
        (task.description && task.description.toLowerCase().includes(query))
    )
  }, [tasks, searchQuery])

  // Group filtered tasks by status
  const tasksByStatus = useMemo(
    () => ({
      backlog: filteredTasks.filter((t) => t.status === 'backlog'),
      in_progress: filteredTasks.filter((t) => t.status === 'in_progress'),
      pending: filteredTasks.filter((t) => t.status === 'pending'),
      done: filteredTasks.filter((t) => t.status === 'done'),
    }),
    [filteredTasks]
  )

  const handleOpenAddModal = (status: TaskStatus = 'backlog') => {
    setAddModalStatus(status)
    setShowAddModal(true)
  }

  const handleDelete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (task) {
      setDeleteConfirm({ show: true, task })
      setSelectedTask(null)
    }
  }

  const confirmDelete = async () => {
    if (!deleteConfirm.task || isDeleting) return
    setIsDeleting(true)
    setActionError(null)

    try {
      await deleteTask(deleteConfirm.task.id)
      setDeleteConfirm({ show: false, task: null })
    } catch (err: unknown) {
      setActionError(normalizeApiError(err))
    } finally {
      setIsDeleting(false)
    }
  }

  // Handle status changes (via drag-and-drop or accessible quick-mover)
  const handleTaskStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task || task.status === newStatus || isMovingStatus) return

    setIsMovingStatus(true)
    setActionError(null)

    try {
      await updateTaskStatus(taskId, newStatus)
    } catch (err: unknown) {
      setActionError(normalizeApiError(err))
    } finally {
      setIsMovingStatus(false)
    }
  }

  // Initial full-page loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--color-bg-page)]">
        <div className="text-center">
          <div className="mx-auto mb-3 h-9 w-9 animate-spin rounded-full border-4 border-[var(--color-border)] border-t-[var(--color-primary)]"></div>
          <p className="text-sm font-medium text-[var(--color-text-main)]">Loading your board</p>
          <p className="text-xs text-[var(--color-text-secondary)]">Fetching tasks from backend...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] pb-12">
      <Navbar />

      <main className="mx-auto max-w-[1400px] px-4 sm:px-6 py-6 sm:py-8">
        {/* Fetch Error Banner with categorized message and retry */}
        {error && (
          <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-xs">
            <div className="flex items-start gap-3">
              {error.type === 'network' ? (
                <WifiOff className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              ) : (
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
              )}
              <div>
                <p className="font-semibold text-sm">
                  {error.type === 'network'
                    ? 'Server Unreachable (Offline Mode)'
                    : error.type === 'timeout'
                    ? 'Request Timeout'
                    : error.type === 'auth'
                    ? 'Session Expired'
                    : 'Error Fetching Tasks'}
                </p>
                <p className="text-xs text-red-600 mt-0.5">{error.message}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={refetch}
              disabled={refreshing}
              className="w-full sm:w-auto shrink-0 border-red-300 bg-white text-red-700 hover:bg-red-100 cursor-pointer"
            >
              <RefreshCw className={`mr-2 h-3.5 w-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Retrying...' : 'Retry Connection'}
            </Button>
          </div>
        )}

        {/* Action Error Banner (e.g., status move or deletion failed while offline) */}
        {actionError && (
          <div className="mb-6 flex items-start sm:items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 shadow-xs">
            <div className="flex items-start gap-3">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div>
                <p className="font-semibold text-sm">
                  {actionError.type === 'network' ? 'Action Failed (Network Error)' : 'Action Could Not Complete'}
                </p>
                <p className="text-xs text-amber-700">{actionError.message}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActionError(null)}
              className="text-amber-800 hover:bg-amber-100 shrink-0 cursor-pointer"
            >
              Dismiss
            </Button>
          </div>
        )}

        {/* Stats Section */}
        <TaskStats tasks={tasks} />

        {/* Controls Bar: Search & Add Task & Refreshing indicator */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="w-full sm:max-w-md">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {refreshing && (
              <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[var(--color-primary)]" />
                <span>Refreshing...</span>
              </div>
            )}
            <Button
              onClick={() => handleOpenAddModal('backlog')}
              className="w-full sm:w-auto bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] cursor-pointer text-white shadow-xs"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Search Results Info */}
        {searchQuery && (
          <div className="mb-4 text-xs font-medium text-[var(--color-text-secondary)]">
            {filteredTasks.length === 0 ? (
              <p>No tasks match your search "{searchQuery}".</p>
            ) : (
              <p>
                Found {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} for "{searchQuery}"
              </p>
            )}
          </div>
        )}

        {/* Kanban Board Grid: Responsive across mobile, tablet, and desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <TaskColumn
            title="To Do"
            tasks={tasksByStatus.backlog}
            count={tasksByStatus.backlog.length}
            status="backlog"
            onTaskClick={setSelectedTask}
            onTaskDrop={handleTaskStatusChange}
            onAddClick={handleOpenAddModal}
          />
          <TaskColumn
            title="In Progress"
            tasks={tasksByStatus.in_progress}
            count={tasksByStatus.in_progress.length}
            status="in_progress"
            onTaskClick={setSelectedTask}
            onTaskDrop={handleTaskStatusChange}
            onAddClick={handleOpenAddModal}
          />
          <TaskColumn
            title="Pending"
            tasks={tasksByStatus.pending}
            count={tasksByStatus.pending.length}
            status="pending"
            onTaskClick={setSelectedTask}
            onTaskDrop={handleTaskStatusChange}
            onAddClick={handleOpenAddModal}
          />
          <TaskColumn
            title="Completed"
            tasks={tasksByStatus.done}
            count={tasksByStatus.done.length}
            status="done"
            onTaskClick={setSelectedTask}
            onTaskDrop={handleTaskStatusChange}
            onAddClick={handleOpenAddModal}
          />
        </div>

        {/* Empty State when no tasks exist */}
        {!error && tasks.length === 0 && (
          <div className="mt-12 text-center rounded-xl border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 sm:p-12">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-bg-soft-green)]">
              <Plus className="h-6 w-6 text-[var(--color-primary)]" />
            </div>
            <h3 className="mb-1 text-base font-semibold text-[var(--color-text-main)]">No tasks on board</h3>
            <p className="mb-4 text-xs sm:text-sm text-[var(--color-text-secondary)]">
              Create your first task to start tracking your workflow.
            </p>
            <Button
              onClick={() => handleOpenAddModal('backlog')}
              className="bg-[var(--color-primary)] hover:bg-[var(--color-primary-hover)] text-white cursor-pointer"
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Create First Task
            </Button>
          </div>
        )}
      </main>

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          key={selectedTask.id}
          task={selectedTask}
          open={Boolean(selectedTask)}
          onClose={() => setSelectedTask(null)}
          onUpdate={updateTask}
          onDelete={handleDelete}
        />
      )}

      {/* Add Task Modal */}
      <AddTaskModal
        key={`${addModalStatus}-${showAddModal}`}
        open={showAddModal}
        initialStatus={addModalStatus}
        onClose={() => setShowAddModal(false)}
        onSubmit={createTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        open={deleteConfirm.show}
        taskTitle={deleteConfirm.task?.title || ''}
        loading={isDeleting}
        onClose={() => setDeleteConfirm({ show: false, task: null })}
        onConfirm={confirmDelete}
      />
    </div>
  )
}
