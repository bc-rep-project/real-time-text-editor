export interface Comment {
  id: string;
  documentId: string;
  userId: string;
  content: string;
  selection: {
    from: number;
    to: number;
  };
  createdAt: Date;
  updatedAt: Date;
  resolved: boolean;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommentMessage {
  type: 'comment';
  action: 'create' | 'update' | 'delete' | 'resolve' | 'reply';
  data: {
    comment?: Comment;
    reply?: CommentReply;
    commentId?: string;
  };
} 