'use client';

interface DeleteConfirmationDialogProps {
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteConfirmationDialog({ onConfirm, onCancel }: DeleteConfirmationDialogProps) {
  return (
    <div className="p-6">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-5">
        Are you sure you want to delete this document?
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
        This action cannot be undone. This will permanently delete the document and all its contents.
      </p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Delete
        </button>
      </div>
    </div>
  );
} 