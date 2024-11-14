import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

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
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title } = await request.json();
    if (!title) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Create document in Firebase
    const documentId = await db.add('documents', {
      title,
      content: '',
      userId: session.user.id,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // Fetch the created document
    const newDocument = await db.get('documents', {
      field: 'id',
      value: documentId
    });

    if (!newDocument) {
      throw new Error('Failed to fetch created document');
    }

    return NextResponse.json(newDocument);
  } catch (error) {
    console.error('Failed to create document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 