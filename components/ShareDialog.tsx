'use client';

interface ShareDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ documentId, isOpen, onClose }: ShareDialogProps) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md p-6">
          <h2 className="text-lg font-semibold mb-4">Share Document</h2>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={`${window.location.origin}/document/${documentId}`}
                className="flex-1 p-2 border rounded"
              />
              <button className="px-4 py-2 bg-blue-500 text-white rounded">Copy</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 