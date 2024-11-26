'use client';

interface ChatHeaderProps {
  onlineUsers: number;
  onClearChat?: () => void;
  onScrollToBottom: () => void;
}

export function ChatHeader({ onlineUsers, onClearChat, onScrollToBottom }: ChatHeaderProps) {
  return (
    <div className="p-3 border-b dark:border-gray-700 flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h3 className="font-medium text-gray-900 dark:text-white">Chat</h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({onlineUsers} online)
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        <button
          onClick={onScrollToBottom}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          title="Scroll to Latest"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </button>
        
        {onClearChat && (
          <button
            onClick={onClearChat}
            className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            title="Clear Chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
} 