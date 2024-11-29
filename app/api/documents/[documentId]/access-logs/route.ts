import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user has access to the document
    const userAccess = await prisma.documentCollaborator.findFirst({
      where: {
        documentId: params.documentId,
        userId: session.user.id,
      },
    });

    if (!userAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get access logs with user information
    const logs = await prisma.accessLog.findMany({
      where: {
        documentId: params.documentId,
      },
      include: {
        performedByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100, // Limit to last 100 logs
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 