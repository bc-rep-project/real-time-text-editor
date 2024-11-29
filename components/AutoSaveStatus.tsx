'use client';

export function AutoSaveStatus() {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <div className="animate-pulse h-2 w-2 rounded-full bg-green-500" />
      <span>Saving...</span>
    </div>
  );
} 