import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/documents
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '';
    const sort = searchParams.get('sort') || 'updatedAt';

    // Query documents from Firebase
    const querySnapshot = await adminDb.collection('documents')
      .where('userId', '==', session.user.id)
      .orderBy(sort === 'title' ? 'title' : 'updatedAt', 'desc')
      .get();

    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(documents || []);
  } catch (error) {
    console.error('Failed to fetch documents:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST /api/documents
export async function POST(request: Request) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.id) {
      console.log('Unauthorized request:', { session });
      return NextResponse.json(
        { error: 'You must be signed in to create documents' }, 
        { status: 401 }
      );
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create document in Firebase
    const docRef = await adminDb.collection('documents').add({
      title,
      content: '',
      userId: session.user.id,
      userEmail: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const newDocument = {
      id: docRef.id,
      title,
      content: '',
      userId: session.user.id,
      userEmail: session.user.email,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json(newDocument);
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json(
      { error: 'Failed to create document' }, 
      { status: 500 }
    );
  }
} 