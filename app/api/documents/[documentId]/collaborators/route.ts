import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get document collaborators from Firestore
    const collaboratorsSnapshot = await db
      .collection('documents')
      .doc(params.documentId)
      .collection('collaborators')
      .get();

    const collaborators = collaboratorsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      isOnline: false // We'll update this with real-time data from WebSocket
    }));

    return NextResponse.json(collaborators);
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 