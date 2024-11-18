import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

interface ChatMessage {
  id: string;
  documentId: string;
  userId: string;
  message: string;
  createdAt: Date;
  username?: string;
}

interface User {
  id: string;
  username: string;
}

// GET /api/chat/[documentId]
export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await db.query<ChatMessage>('chat_messages', {
      where: {
        field: 'documentId',
        op: '==',
        value: params.documentId
      },
      orderBy: {
        field: 'createdAt',
        direction: 'asc'
      },
      limit: 100
    });

    // Get usernames for messages
    const messagesWithUsernames = await Promise.all(
      messages.map(async (message) => {
        const user = await db.get<User>('users', message.userId);
        return {
          ...message,
          username: user?.username || 'Unknown User'
        };
      })
    );

    return NextResponse.json(messagesWithUsernames);
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// POST /api/chat/[documentId]
export async function POST(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    if (!message?.trim()) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create chat message
    const messageId = await db.add('chat_messages', {
      documentId: params.documentId,
      userId: session.user.id,
      message: message.trim(),
      createdAt: new Date()
    });

    // Get the created message with username
    const newMessage = await db.get<ChatMessage>('chat_messages', messageId);
    if (!newMessage) {
      throw new Error('Failed to create message');
    }

    const user = await db.get<User>('users', session.user.id);
    const messageWithUsername = {
      ...newMessage,
      username: user?.username || 'Unknown User'
    };

    return NextResponse.json(messageWithUsername);
  } catch (error) {
    console.error('Failed to send chat message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 