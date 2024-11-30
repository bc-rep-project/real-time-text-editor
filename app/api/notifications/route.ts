import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
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
    const notificationsRef = adminDb.collection('notifications');
    const notificationsQuery = await notificationsRef
      .where('userId', '==', session.user.id)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = notificationsQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

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
    const notificationsRef = adminDb.collection('notifications');
    const notificationData = {
      type,
      title,
      message,
      documentId,
      documentTitle,
      userId: recipientId,
      createdAt: new Date().toISOString(),
      read: false
    };

    const notificationRef = await notificationsRef.add(notificationData);
    const notification = {
      id: notificationRef.id,
      ...notificationData
    };

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