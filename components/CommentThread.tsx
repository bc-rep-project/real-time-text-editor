'use client';

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
  replies: Comment[];
}

export function CommentThread() {
  return (
    <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-800 shadow-lg">
      {/* Comments UI */}
    </div>
  );
} 