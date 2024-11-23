import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { db } from '@/lib/db';
import { WhereFilterOp } from 'firebase-admin/firestore';

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

interface NewChatMessage {
  documentId: string;
  userId: string;
  message: string;
  createdAt: Date;
}

// GET /api/chat/[documentId]
export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await db.query<ChatMessage>('chat_messages', {
      where: [{
        field: 'documentId',
        op: '==',
        value: params.documentId
      }],
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { message } = await request.json();
    
    const newMessage = {
      documentId: params.documentId,
      userId: session.user.id,
      message,
      createdAt: new Date()
    };

    const chatMessageId = await db.add('chat_messages', newMessage);
    const user = await db.get<User>('users', session.user.id);

    const chatMessage: ChatMessage = {
      id: chatMessageId,
      ...newMessage,
      username: user?.username || 'Unknown User'
    };

    return NextResponse.json(chatMessage);
  } catch (error) {
    console.error('Failed to send chat message:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 