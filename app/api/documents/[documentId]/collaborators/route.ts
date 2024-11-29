import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const collaboratorSchema = z.object({
  email: z.string().email(),
  role: z.enum(['viewer', 'commenter', 'editor', 'admin']),
  expiresAt: z.string().datetime().optional(),
  teamId: z.string().optional(),
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

    // Get all collaborators for the document
    const collaborators = await prisma.documentCollaborator.findMany({
      where: {
        documentId: params.documentId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        team: true,
      },
    });

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
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

    // Check if user is admin
    const userAccess = await prisma.documentCollaborator.findFirst({
      where: {
        documentId: params.documentId,
        userId: session.user.id,
        role: 'admin',
      },
    });

    if (!userAccess) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = collaboratorSchema.parse(body);

    // Find user by email
    const user = await prisma.user.findFirst({
      where: { email: validatedData.email },
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Check if collaborator already exists
    const existingCollaborator = await prisma.documentCollaborator.findUnique({
      where: {
        documentId_userId: {
          documentId: params.documentId,
          userId: user.id,
        },
      },
    });

    if (existingCollaborator) {
      return new NextResponse('User is already a collaborator', { status: 400 });
    }

    // Create collaborator
    const collaborator = await prisma.documentCollaborator.create({
      data: {
        documentId: params.documentId,
        userId: user.id,
        role: validatedData.role,
        addedBy: session.user.id,
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : null,
        teamId: validatedData.teamId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        team: true,
      },
    });

    // Log the action
    await prisma.accessLog.create({
      data: {
        documentId: params.documentId,
        action: 'granted',
        performedBy: session.user.id,
        details: `Added ${user.email} as ${validatedData.role}`,
      },
    });

    return NextResponse.json(collaborator);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error adding collaborator:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 