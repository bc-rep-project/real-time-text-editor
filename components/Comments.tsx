import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Comment, CommentReply } from '@/types/comments';
import { format } from 'date-fns';

interface CommentsProps {
  documentId: string;
  websocket: WebSocket;
  selection?: { from: number; to: number } | null;
}

export const Comments: React.FC<CommentsProps> = ({ documentId, websocket, selection }) => {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyText, setReplyText] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    // Listen for comment updates from WebSocket
    const handleMessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data);
      if (message.type === 'comment') {
        handleCommentMessage(message);
      }
    };

    websocket.addEventListener('message', handleMessage);
    return () => websocket.removeEventListener('message', handleMessage);
  }, [websocket]);

  const handleCommentMessage = (message: any) => {
    switch (message.action) {
      case 'create':
        setComments(prev => [...prev, message.data.comment]);
        break;
      case 'update':
        setComments(prev => 
          prev.map(c => c.id === message.data.comment.id ? message.data.comment : c)
        );
        break;
      case 'delete':
        setComments(prev => prev.filter(c => c.id !== message.data.commentId));
        break;
      case 'resolve':
        setComments(prev =>
          prev.map(c => c.id === message.data.commentId ? { ...c, resolved: true } : c)
        );
        break;
      case 'reply':
        setComments(prev =>
          prev.map(c => c.id === message.data.commentId
            ? { ...c, replies: [...c.replies, message.data.reply] }
            : c
          )
        );
        break;
    }
  };

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

  const addReply = (commentId: string) => {
    if (!session?.user?.id || !replyText[commentId]?.trim()) return;

    const reply: CommentReply = {
      id: crypto.randomUUID(),
      commentId,
      userId: session.user.id,
      content: replyText[commentId],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    websocket.send(JSON.stringify({
      type: 'comment',
      action: 'reply',
      data: { commentId, reply },
    }));

    setReplyText(prev => ({ ...prev, [commentId]: '' }));
  };

  const resolveComment = (commentId: string) => {
    websocket.send(JSON.stringify({
      type: 'comment',
      action: 'resolve',
      data: { commentId },
    }));
  };

  const deleteComment = (commentId: string) => {
    websocket.send(JSON.stringify({
      type: 'comment',
      action: 'delete',
      data: { commentId },
    }));
  };

  return (
    <div className="comments-panel w-80 bg-white dark:bg-gray-800 p-4 overflow-y-auto">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      {selection && (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="w-full p-2 border rounded dark:bg-gray-700"
            rows={3}
          />
          <button
            onClick={addComment}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add Comment
          </button>
        </div>
      )}

      <div className="space-y-4">
        {comments.map(comment => (
          <div key={comment.id} className={`p-3 border rounded ${comment.resolved ? 'bg-gray-100 dark:bg-gray-700' : 'bg-white dark:bg-gray-800'}`}>
            <div className="flex justify-between items-start mb-2">
              <span className="font-medium">{comment.userId}</span>
              <div className="flex space-x-2">
                {!comment.resolved && (
                  <button
                    onClick={() => resolveComment(comment.id)}
                    className="text-sm text-green-500 hover:text-green-600"
                  >
                    Resolve
                  </button>
                )}
                {session?.user?.id === comment.userId && (
                  <button
                    onClick={() => deleteComment(comment.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
            <p className="text-sm mb-2">{comment.content}</p>
            <span className="text-xs text-gray-500">
              {format(new Date(comment.createdAt), 'MMM d, yyyy HH:mm')}
            </span>

            {/* Replies */}
            <div className="mt-3 pl-4 border-l">
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

              {!comment.resolved && (
                <div className="mt-2">
                  <textarea
                    value={replyText[comment.id] || ''}
                    onChange={(e) => setReplyText(prev => ({
                      ...prev,
                      [comment.id]: e.target.value
                    }))}
                    placeholder="Reply to comment..."
                    className="w-full p-2 text-sm border rounded dark:bg-gray-700"
                    rows={2}
                  />
                  <button
                    onClick={() => addReply(comment.id)}
                    className="mt-1 px-3 py-1 text-sm bg-gray-100 dark:bg-gray-600 rounded hover:bg-gray-200 dark:hover:bg-gray-500"
                  >
                    Reply
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 