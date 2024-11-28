'use client';

import { useState } from 'react';

interface ToolbarButton {
  id: string;
  icon: React.ReactNode;
  label: string;
  action: () => void;
}

interface DocumentToolbarProps {
  onShareClick: () => void;
  onExportClick: () => void;
}

export function DocumentToolbar({ onShareClick, onExportClick }: DocumentToolbarProps) {
  const [fontSize, setFontSize] = useState('16px');
  const [fontFamily, setFontFamily] = useState('default');

  const formatButtons: ToolbarButton[] = [
    {
      id: 'bold',
      icon: <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12h8a4 4 0 100-8H6v8zm0 0h8a4 4 0 110 8H6v-8z" />
      </svg>,
      label: 'Bold',
      action: () => document.execCommand('bold')
    },
    // Add more formatting buttons
  ];

  return (
    <div className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-2">
        <select
          value={fontFamily}
          onChange={(e) => setFontFamily(e.target.value)}
          className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          <option value="default">Default</option>
          <option value="serif">Serif</option>
          <option value="mono">Monospace</option>
        </select>

        <select
          value={fontSize}
          onChange={(e) => setFontSize(e.target.value)}
          className="px-2 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
        >
          {['12px', '14px', '16px', '18px', '20px'].map(size => (
            <option key={size} value={size}>{size}</option>
          ))}
        </select>

        <div className="h-6 w-px bg-gray-200 dark:bg-gray-700" />

        <div className="flex items-center gap-1">
          {formatButtons.map(button => (
            <button
              key={button.id}
              onClick={button.action}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
              title={button.label}
            >
              {button.icon}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onShareClick}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-blue-500 hover:bg-blue-600 rounded-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          Share
        </button>
        <button
          onClick={onExportClick}
          className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Export
        </button>
      </div>
    </div>
  );
}

export type { DocumentToolbarProps }; 