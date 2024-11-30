import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { z } from 'zod';

interface FirestoreUser {
  id: string;
  name?: string;
  email?: string;
  image?: string;
}

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
    const collaboratorsRef = adminDb.collection('documentCollaborators');
    const userAccessQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .where('userId', '==', session.user.id)
      .get();

    if (userAccessQuery.empty) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Get all collaborators for the document
    const collaboratorsQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .get();

    const collaborators = [];
    for (const doc of collaboratorsQuery.docs) {
      const data = doc.data();
      // Get user details
      const userDoc = await adminDb.collection('users').doc(data.userId).get();
      const userData = userDoc.data() as Omit<FirestoreUser, 'id'>;

      collaborators.push({
        id: doc.id,
        ...data,
        user: {
          id: data.userId,
          ...userData,
        },
      });
    }

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
    const collaboratorsRef = adminDb.collection('documentCollaborators');
    const userAccessQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .where('userId', '==', session.user.id)
      .where('role', '==', 'admin')
      .get();

    if (userAccessQuery.empty) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = collaboratorSchema.parse(body);

    // Find user by email
    const usersRef = adminDb.collection('users');
    const userQuery = await usersRef.where('email', '==', validatedData.email).get();

    if (userQuery.empty) {
      return new NextResponse('User not found', { status: 404 });
    }

    const userDoc = userQuery.docs[0];
    const userData = userDoc.data() as Omit<FirestoreUser, 'id'>;
    const user: FirestoreUser = {
      id: userDoc.id,
      ...userData,
    };

    // Check if collaborator already exists
    const existingCollabQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .where('userId', '==', user.id)
      .get();

    if (!existingCollabQuery.empty) {
      return new NextResponse('User is already a collaborator', { status: 400 });
    }

    // Create collaborator
    const collaboratorData = {
      documentId: params.documentId,
      userId: user.id,
      role: validatedData.role,
      addedBy: session.user.id,
      addedAt: new Date().toISOString(),
      expiresAt: validatedData.expiresAt || null,
      teamId: validatedData.teamId || null,
    };

    const collaboratorRef = await collaboratorsRef.add(collaboratorData);

    // Log the action
    await adminDb.collection('accessLogs').add({
      documentId: params.documentId,
      action: 'granted',
      performedBy: session.user.id,
      details: `Added ${user.email || 'user'} as ${validatedData.role}`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      id: collaboratorRef.id,
      ...collaboratorData,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse('Invalid request data', { status: 400 });
    }
    console.error('Error adding collaborator:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 