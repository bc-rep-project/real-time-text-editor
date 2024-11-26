'use client';

interface TypingIndicatorProps {
  typingUsers: string[];
}

export function TypingIndicator({ typingUsers }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="text-sm text-gray-500 dark:text-gray-400 italic px-4 py-2">
      {typingUsers.length === 1 
        ? `${typingUsers[0]} is typing...`
        : `${typingUsers.join(', ')} are typing...`}
      <span className="animate-pulse">...</span>
    </div>
  );
} 