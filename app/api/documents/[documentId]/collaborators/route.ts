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
      const userData = userDoc.data() as FirestoreUser;

      collaborators.push({
        id: doc.id,
        ...data,
        user: {
          id: data.userId,
          name: userData?.name,
          email: userData?.email,
          image: userData?.image,
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
    const userEmail = request.headers.get('x-user-email');
    const userName = request.headers.get('x-user-name');
    
    if (!userEmail) {
      console.error('No user email found in headers');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get current user's ID from their email
    const usersRef = adminDb.collection('users');
    const currentUserQuery = await usersRef
      .where('email', '==', userEmail)
      .limit(1)
      .get();
    
    if (currentUserQuery.empty) {
      return new NextResponse('User not found', { status: 404 });
    }

    const currentUserId = currentUserQuery.docs[0].id;

    // Check if user is admin
    const collaboratorsRef = adminDb.collection('documentCollaborators');
    const userAccessQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .where('userId', '==', currentUserId)
      .where('role', '==', 'admin')
      .get();

    if (userAccessQuery.empty) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const validatedData = collaboratorSchema.parse(body);

    // Find user by email
    const userQuery = await usersRef
      .where('email', '==', validatedData.email)
      .limit(1)
      .get();

    if (userQuery.empty) {
      // Create new user if they don't exist
      const newUserRef = await usersRef.add({
        email: validatedData.email,
        createdAt: new Date().toISOString(),
      });
      var userId = newUserRef.id;
    } else {
      var userId = userQuery.docs[0].id;
    }

    // Check if collaborator already exists
    const existingCollabQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (!existingCollabQuery.empty) {
      return new NextResponse('User is already a collaborator', { status: 400 });
    }

    // Create collaborator
    const collaboratorData = {
      documentId: params.documentId,
      userId,
      role: validatedData.role,
      addedBy: currentUserId,
      addedAt: new Date().toISOString(),
      expiresAt: validatedData.expiresAt || null,
      teamId: validatedData.teamId || null,
    };

    const collaboratorRef = await collaboratorsRef.add(collaboratorData);

    // Log the action
    await adminDb.collection('accessLogs').add({
      documentId: params.documentId,
      action: 'granted',
      performedBy: currentUserId,
      details: `Added ${validatedData.email} as ${validatedData.role}`,
      timestamp: new Date().toISOString(),
    });

    // Get user details for response
    const userDoc = await adminDb.collection('users').doc(userId).get();
    const userData = userDoc.data() as Omit<FirestoreUser, 'id'>;

    return NextResponse.json({
      id: collaboratorRef.id,
      ...collaboratorData,
      user: {
        id: userId,
        ...userData,
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