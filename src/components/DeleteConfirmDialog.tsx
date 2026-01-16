import { Button } from './ui/button'
import { Trash2, X } from 'lucide-react'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  title?: string
  description?: string
  itemName?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function DeleteConfirmDialog({
  isOpen,
  title = 'Delete Item',
  description = 'This action cannot be undone.',
  itemName,
  onConfirm,
  onCancel,
  isLoading = false,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 dark:bg-red-950 rounded-lg">
              <Trash2 size={20} className="text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-400">
            {itemName ? `Are you sure you want to delete "${itemName}"?` : 'Are you sure you want to delete this item?'}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">{description}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end p-6 border-t border-gray-200 dark:border-gray-800">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="transition-all duration-200"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white transition-all duration-200"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}
