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

export function DocumentToolbar() {
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
    <div className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg">
      <div className="flex items-center gap-2 overflow-x-auto">
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
    </div>
  );
}

export type { DocumentToolbarProps }; 