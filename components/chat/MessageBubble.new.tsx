'use client';

interface MessageBubbleProps {
  message: string;
  username: string;
  timestamp: string;
  isSelf: boolean;
  onReact?: (reaction: string) => void;
}

export function MessageBubble({ message, username, timestamp, isSelf, onReact }: MessageBubbleProps) {
  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'}`}>
      <div className="text-xs text-gray-500 dark:text-gray-400 px-2">
        {username}
      </div>
      <div className={`
        rounded-lg px-3 py-2 break-words max-w-[85%] sm:max-w-[75%]
        ${isSelf 
          ? 'bg-blue-500 text-white dark:bg-blue-600 ml-8' 
          : 'bg-gray-100 dark:bg-gray-700 dark:text-gray-100 mr-8'
        }
      `}>
        {message}
        <div className="text-xs opacity-70 mt-1">
          {new Date(timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
} 