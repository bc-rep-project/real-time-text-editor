'use client';

interface Tab {
  id: string;
  label: string;
}

interface DocumentTabsProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  tabs: Tab[];
}

export function DocumentTabs({ activeTab, onTabChange, tabs }: DocumentTabsProps) {
  return (
    <div className="border-b dark:border-gray-700">
      <nav className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`px-4 py-2 ${
              activeTab === tab.id
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
} 