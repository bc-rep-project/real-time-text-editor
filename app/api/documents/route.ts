import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import { adminDb } from '@/lib/firebase-admin';

// GET /api/documents
export async function GET(request: Request) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || '';
    const sort = searchParams.get('sort') || 'updatedAt';

    // Query documents from Firebase
    const documents = await db.all('documents', {
      where: filter ? {
        field: 'title',
        op: '>=',
        value: filter
      } : undefined,
      orderBy: {
        field: sort === 'title' ? 'title' : 'updatedAt',
        direction: 'desc'
      }
    });

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
    
    // Check if session exists and has user data
    if (!session?.user?.name) {
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
    const documentRef = await adminDb.collection('documents').add({
      title,
      content: '',
      userId: session.user.name, // Using name as userId for now
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Return the created document
    const newDocument = {
      id: documentRef.id,
      title,
      content: '',
      userId: session.user.name,
      createdAt: new Date(),
      updatedAt: new Date()
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