'use client';

export function KeyboardShortcuts() {
  return (
    <div className="fixed bottom-4 right-4">
      <button
        className="p-2 bg-white dark:bg-gray-800 rounded-full shadow-lg"
        title="Keyboard Shortcuts"
      >
        <kbd className="px-2 py-1 text-sm">⌘</kbd>
      </button>
      {/* Shortcuts modal */}
    </div>
  );
} 