'use client';

import { useState } from 'react';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface DocumentTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

export function DocumentTabs({ activeTab, onTabChange, tabs }: DocumentTabsProps) {
  return (
    <div className="flex justify-center space-x-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`flex items-center gap-2 px-6 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
} 