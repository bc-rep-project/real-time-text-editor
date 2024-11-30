import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';

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

    // Get access logs with user information
    const logsRef = adminDb.collection('accessLogs');
    const logsQuery = await logsRef
      .where('documentId', '==', params.documentId)
      .orderBy('timestamp', 'desc')
      .limit(100)
      .get();

    const logs = [];
    for (const doc of logsQuery.docs) {
      const data = doc.data();
      // Get user details
      const userDoc = await adminDb.collection('users').doc(data.performedBy).get();
      const userData = userDoc.data();

      logs.push({
        id: doc.id,
        ...data,
        performedByUser: {
          name: userData?.name,
          email: userData?.email,
        },
      });
    }

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching access logs:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 