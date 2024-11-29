'use client';

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  isLoading?: boolean;
  placeholder?: string;
}

export function MessageInput({ 
  value, 
  onChange, 
  onSend, 
  isLoading, 
  placeholder = "Type a message..." 
}: MessageInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="flex gap-2 p-3 border-t dark:border-gray-700">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={isLoading}
        className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 
          disabled:opacity-50 text-sm
          bg-white dark:bg-gray-700
          text-gray-900 dark:text-gray-100
          placeholder-gray-500 dark:placeholder-gray-400"
      />
      <button
        onClick={onSend}
        disabled={isLoading || !value.trim()}
        className="px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg 
          hover:bg-blue-600 dark:hover:bg-blue-700 
          disabled:opacity-50 disabled:hover:bg-blue-500 
          flex items-center gap-2 whitespace-nowrap text-sm"
      >
        {isLoading ? 'Sending...' : 'Send'}
      </button>
    </div>
  );
} 