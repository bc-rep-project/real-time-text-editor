import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { apiRateLimiter } from '@/lib/rateLimiter';

export async function POST(
  request: Request,
  { params }: { params: { notificationId: string } }
) {
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

    // Get notification
    const notificationRef = adminDb.collection('notifications').doc(params.notificationId);
    const notificationDoc = await notificationRef.get();

    if (!notificationDoc.exists) {
      return new NextResponse('Notification not found', { status: 404 });
    }

    const notificationData = notificationDoc.data();
    if (notificationData?.userId !== session.user.id) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Mark notification as read
    await notificationRef.update({ read: true });

    return NextResponse.json({
      id: notificationDoc.id,
      ...notificationData,
      read: true
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 