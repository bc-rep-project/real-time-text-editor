'use client';

import { useState, useEffect } from 'react';

interface DocumentSettings {
  autoSave: boolean;
  fontSize: number;
  lineSpacing: number;
  spellCheck: boolean;
}

export function DocumentSettings() {
  const [settings, setSettings] = useState<DocumentSettings>({
    autoSave: true,
    fontSize: 16,
    lineSpacing: 1.5,
    spellCheck: true
  });

  const handleSettingChange = (key: keyof DocumentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
      <h3 className="font-medium mb-4 text-gray-900 dark:text-white">
        Document Settings
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 dark:text-gray-300">Auto Save</label>
          <input
            type="checkbox"
            checked={settings.autoSave}
            onChange={(e) => handleSettingChange('autoSave', e.target.checked)}
            className="toggle"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Font Size</label>
          <input
            type="range"
            min="12"
            max="24"
            value={settings.fontSize}
            onChange={(e) => handleSettingChange('fontSize', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="text-sm text-gray-500">{settings.fontSize}px</div>
        </div>
        <div className="space-y-2">
          <label className="text-sm text-gray-700 dark:text-gray-300">Line Spacing</label>
          <select
            value={settings.lineSpacing}
            onChange={(e) => handleSettingChange('lineSpacing', parseFloat(e.target.value))}
            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
          >
            <option value="1">Single</option>
            <option value="1.5">1.5</option>
            <option value="2">Double</option>
          </select>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-700 dark:text-gray-300">Spell Check</label>
          <input
            type="checkbox"
            checked={settings.spellCheck}
            onChange={(e) => handleSettingChange('spellCheck', e.target.checked)}
            className="toggle"
          />
        </div>
      </div>
    </div>
  );
} 