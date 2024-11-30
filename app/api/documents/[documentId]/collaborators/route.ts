import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
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
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      console.error('No session or user email found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's ID from their email
    const usersRef = adminDb.collection('users');
    const userQuery = await usersRef
      .where('email', '==', session.user.email)
      .limit(1)
      .get();
    
    if (userQuery.empty) {
      console.error('User not found in Firestore:', session.user.email);
      // Create user if they don't exist
      const newUserRef = await usersRef.add({
        email: session.user.email,
        name: session.user.name || '',
        image: session.user.image || '',
        createdAt: new Date().toISOString(),
      });
      var userId = newUserRef.id;
    } else {
      var userId = userQuery.docs[0].id;
    }

    // Check if user has access to the document
    const collaboratorsRef = adminDb.collection('documentCollaborators');
    const userAccessQuery = await collaboratorsRef
      .where('documentId', '==', params.documentId)
      .where('userId', '==', userId)
      .limit(1)
      .get();

    if (userAccessQuery.empty) {
      // If user is document owner, grant them admin access
      const documentRef = adminDb.collection('documents').doc(params.documentId);
      const documentDoc = await documentRef.get();
      
      if (!documentDoc.exists) {
        return new NextResponse('Document not found', { status: 404 });
      }

      const documentData = documentDoc.data();
      if (documentData?.createdBy === userId) {
        // Add user as admin collaborator
        await collaboratorsRef.add({
          documentId: params.documentId,
          userId,
          role: 'admin',
          addedAt: new Date().toISOString(),
          addedBy: userId,
        });
      } else {
        return new NextResponse('Forbidden', { status: 403 });
      }
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
    if (!session?.user?.email) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get user's ID from their email
    const usersRef = adminDb.collection('users');
    const currentUserQuery = await usersRef.where('email', '==', session.user.email).get();
    
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