import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { apiRateLimiter } from '@/lib/rateLimiter';

export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!apiRateLimiter.try(`${clientIp}:notifications`)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    // Get notifications for the user
    const notifications = await prisma.notification.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to last 50 notifications
    });

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Apply rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    if (!apiRateLimiter.try(`${clientIp}:notifications`)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    const body = await request.json();
    const { type, title, message, documentId, documentTitle, recipientId } = body;

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        documentId,
        documentTitle,
        userId: recipientId,
        createdAt: new Date(),
      },
    });

    // Broadcast notification via WebSocket if recipient is online
    const wsServer = (global as any).wsServer;
    if (wsServer) {
      wsServer.clients.forEach((client: any) => {
        if (client.userId === recipientId && client.readyState === 1) {
          client.send(JSON.stringify(notification));
        }
      });
    }

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 