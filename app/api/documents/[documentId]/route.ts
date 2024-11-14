import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

// GET /api/documents/[documentId]
export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await db.get('documents', {
      field: 'id',
      value: params.documentId
    });

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json(document);
  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/documents/[documentId]
export async function PUT(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { content } = await request.json();
    
    // Save current version
    await db.add('versions', {
      documentId: params.documentId,
      content,
      userId: session.user.id,
      createdAt: new Date()
    });

    // Update document
    await db.update('documents', params.documentId, {
      content,
      updatedAt: new Date()
    });

    const updatedDocument = await db.get('documents', {
      field: 'id',
      value: params.documentId
    });

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 