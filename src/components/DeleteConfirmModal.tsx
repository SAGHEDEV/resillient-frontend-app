import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertCircle, Loader2, Trash2 } from 'lucide-react'

interface DeleteConfirmModalProps {
  open: boolean
  taskTitle: string
  onClose: () => void
  onConfirm: () => void
  loading?: boolean
}

export function DeleteConfirmModal({
  open,
  taskTitle,
  onClose,
  onConfirm,
  loading = false,
}: DeleteConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => !loading && onClose()}>
      <DialogContent className="w-[95vw] sm:max-w-[420px] p-4 sm:p-6">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-900">Delete Task?</DialogTitle>
              <p className="mt-2 text-xs sm:text-sm text-gray-600">
                Are you sure you want to permanently delete{' '}
                <span className="font-semibold text-gray-900">"{taskTitle}"</span>? This action cannot be undone.
              </p>
            </div>
          </div>
        </DialogHeader>
        <div className="flex justify-end gap-2.5 pt-4 border-t border-[var(--color-border)] mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="cursor-pointer"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
