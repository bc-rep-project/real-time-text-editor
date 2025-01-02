import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import type { Comment, CommentReply } from '@/types/websocket';

interface CommentsPanelProps {
  documentId: string;
  websocket: WebSocket;
  selection?: { from: number; to: number };
}

export function CommentsPanel({ documentId, websocket, selection }: CommentsPanelProps) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<Record<string, string>>({});
  const [filter, setFilter] = useState<'all' | 'resolved' | 'unresolved'>('all');

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === 'comment') {
        switch (message.action) {
          case 'create':
            setComments(prev => [...prev, message.data.comment]);
            break;
          case 'update':
            setComments(prev => prev.map(c => 
              c.id === message.data.comment.id ? message.data.comment : c
            ));
            break;
          case 'delete':
            setComments(prev => prev.filter(c => c.id !== message.data.commentId));
            break;
        }
      }
    };

    websocket.addEventListener('message', handleMessage);
    return () => websocket.removeEventListener('message', handleMessage);
  }, [websocket]);

  const addComment = () => {
    if (!session?.user?.id || !selection || !newComment.trim()) return;

    const comment: Comment = {
      id: crypto.randomUUID(),
      documentId,
      userId: session.user.id,
      content: newComment,
      selection,
      createdAt: new Date(),
      updatedAt: new Date(),
      resolved: false,
      replies: [],
    };

    websocket.send(JSON.stringify({
      type: 'comment',
      action: 'create',
      data: { comment },
    }));

    setNewComment('');
  };

  const filteredComments = comments.filter(comment => {
    switch (filter) {
      case 'resolved':
        return comment.resolved;
      case 'unresolved':
        return !comment.resolved;
      default:
        return true;
    }
  });

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-l dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700">
        <h3 className="text-lg font-medium">Comments</h3>
        <div className="mt-2 flex gap-2">
          <select 
            value={filter}
            onChange={(e) => setFilter(e.target.value as typeof filter)}
            className="text-sm border rounded p-1 dark:bg-gray-700"
          >
            <option value="all">All Comments</option>
            <option value="resolved">Resolved</option>
            <option value="unresolved">Unresolved</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredComments.map(comment => (
          <CommentCard
            key={comment.id}
            comment={comment}
            websocket={websocket}
            currentUserId={session?.user?.id}
          />
        ))}
      </div>

      {selection && (
        <div className="p-4 border-t dark:border-gray-700">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded dark:bg-gray-700"
            rows={3}
          />
          <button
            onClick={addComment}
            disabled={!newComment.trim()}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            Add Comment
          </button>
        </div>
      )}
    </div>
  );
}

interface CommentCardProps {
  comment: Comment;
  websocket: WebSocket;
  currentUserId?: string;
}

function CommentCard({ comment, websocket, currentUserId }: CommentCardProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');

  const addReply = () => {
    if (!currentUserId || !replyText.trim()) return;

    const reply: CommentReply = {
      id: crypto.randomUUID(),
      commentId: comment.id,
      userId: currentUserId,
      content: replyText,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    websocket.send(JSON.stringify({
      type: 'comment',
      action: 'reply',
      data: { commentId: comment.id, reply },
    }));

    setReplyText('');
    setIsReplying(false);
  };

  const resolveComment = () => {
    websocket.send(JSON.stringify({
      type: 'comment',
      action: 'resolve',
      data: { commentId: comment.id },
    }));
  };

  return (
    <div className={`mb-4 p-3 rounded border ${comment.resolved ? 'bg-gray-50 dark:bg-gray-900' : 'bg-white dark:bg-gray-800'}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="font-medium">{comment.userId}</span>
        <span className="text-xs text-gray-500">
          {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
        </span>
      </div>
      
      <p className="text-sm mb-2">{comment.content}</p>
      
      <div className="flex gap-2 text-sm">
        <button
          onClick={() => setIsReplying(!isReplying)}
          className="text-blue-500 hover:underline"
        >
          Reply
        </button>
        {!comment.resolved && (
          <button
            onClick={resolveComment}
            className="text-green-500 hover:underline"
          >
            Resolve
          </button>
        )}
      </div>

      {comment.replies.length > 0 && (
        <div className="mt-2 pl-4 border-l">
          {comment.replies.map(reply => (
            <div key={reply.id} className="mb-2">
              <div className="flex justify-between items-start">
                <span className="text-sm font-medium">{reply.userId}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(reply.createdAt), 'MMM d, HH:mm')}
                </span>
              </div>
              <p className="text-sm">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {isReplying && (
        <div className="mt-2 pl-4">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
            className="w-full p-2 text-sm border rounded dark:bg-gray-700"
            rows={2}
          />
          <div className="mt-1 flex gap-2">
            <button
              onClick={addReply}
              disabled={!replyText.trim()}
              className="px-3 py-1 text-sm bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Reply
            </button>
            <button
              onClick={() => setIsReplying(false)}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 