import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import type { ChatMessage, ChatMessageWithUser } from '@/types/chat';

interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
}

// GET /api/chat/[documentId]
export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get messages from Firebase
    const messages = await db.all<ChatMessage>('chat_messages', {
      where: {
        field: 'documentId',
        op: '==',
        value: params.documentId
      },
      orderBy: {
        field: 'createdAt',
        direction: 'desc'
      },
      limit: 100
    });

    // Get user details for each message
    const messagesWithUserDetails = await Promise.all(
      messages.map(async (message) => {
        const user = await db.get<User>('users', {
          field: 'id',
          value: message.userId
        });
        return {
          ...message,
          username: user?.username || 'Unknown User'
        } as ChatMessageWithUser;
      })
    );

    return NextResponse.json(messagesWithUserDetails);
  } catch (error) {
    console.error('Failed to fetch chat messages:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Add message to Firebase
    const messageId = await db.add('chat_messages', {
      documentId: params.documentId,
      userId: session.user.id,
      message,
      createdAt: new Date()
    });

    // Get the created message with user details
    const user = await db.get<User>('users', {
      field: 'id',
      value: session.user.id
    });

    const newMessage: ChatMessageWithUser = {
      id: messageId,
      documentId: params.documentId,
      userId: session.user.id,
      message,
      createdAt: new Date(),
      username: user?.username || 'Unknown User'
    };

    return NextResponse.json(newMessage);
  } catch (error) {
    console.error('Failed to create chat message:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 