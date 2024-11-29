import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
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

    // Mark notification as read
    const notification = await prisma.notification.update({
      where: {
        id: params.notificationId,
        userId: session.user.id, // Ensure user owns the notification
      },
      data: {
        read: true,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 