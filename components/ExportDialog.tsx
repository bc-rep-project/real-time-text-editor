'use client';

import { useState } from 'react';

interface ExportDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ExportDialog({ documentId, isOpen, onClose }: ExportDialogProps) {
  const [format, setFormat] = useState<'pdf' | 'docx' | 'txt'>('pdf');
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch(`/api/documents/${documentId}/export?format=${format}`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document.${format}`;
      a.click();
      window.URL.revokeObjectURL(url);
      onClose();
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Export Document
        </h2>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            {(['pdf', 'docx', 'txt'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={`p-4 border rounded-lg text-center uppercase ${
                  format === f 
                    ? 'border-blue-500 text-blue-500' 
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50"
            >
              {isExporting ? 'Exporting...' : 'Export'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 