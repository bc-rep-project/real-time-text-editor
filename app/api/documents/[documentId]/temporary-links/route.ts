import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { nanoid } from 'nanoid';

const temporaryLinkSchema = z.object({
  role: z.enum(['viewer', 'commenter', 'editor']),
  expiresAt: z.string().datetime(),
  maxUses: z.number().optional(),
});

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

    // Get all active temporary links
    const links = await prisma.temporaryLink.findMany({
      where: {
        documentId: params.documentId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching temporary links:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin or editor
    const userAccess = await prisma.documentCollaborator.findFirst({
      where: {
        documentId: params.documentId,
        userId: session.user.id,
        role: {
          in: ['admin', 'editor'],
        },
      },
    });

    if (!userAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = temporaryLinkSchema.parse(body);

    // Generate unique URL-safe token
    const token = nanoid(32);
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const url = `${baseUrl}/documents/${params.documentId}/share/${token}`;

    // Create temporary link
    const link = await prisma.temporaryLink.create({
      data: {
        documentId: params.documentId,
        url,
        role: validatedData.role,
        createdBy: session.user.id,
        expiresAt: new Date(validatedData.expiresAt),
        maxUses: validatedData.maxUses,
      },
      include: {
        createdByUser: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Log the action
    await prisma.accessLog.create({
      data: {
        documentId: params.documentId,
        action: 'granted',
        performedBy: session.user.id,
        details: `Created temporary ${validatedData.role} access link`,
      },
    });

    return NextResponse.json(link);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error creating temporary link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if user is admin or editor
    const userAccess = await prisma.documentCollaborator.findFirst({
      where: {
        documentId: params.documentId,
        userId: session.user.id,
        role: {
          in: ['admin', 'editor'],
        },
      },
    });

    if (!userAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { linkId } = await request.json();
    if (!linkId) {
      return new NextResponse('Missing link ID', { status: 400 });
    }

    // Revoke the link
    await prisma.temporaryLink.update({
      where: {
        id: linkId,
        documentId: params.documentId,
      },
      data: {
        isRevoked: true,
      },
    });

    // Log the action
    await prisma.accessLog.create({
      data: {
        documentId: params.documentId,
        action: 'revoked',
        performedBy: session.user.id,
        details: 'Revoked temporary access link',
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error revoking temporary link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 