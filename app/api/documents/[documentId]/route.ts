import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { db } from '@/lib/db';

interface Document {
  id: string;
  title: string;
  content: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/documents/[documentId]
export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await db.get<Document>('documents', params.documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Safely format the date, falling back to current time if invalid
    const safeDate = (date: any) => {
      try {
        return new Date(date).toISOString();
      } catch (e) {
        return new Date().toISOString();
      }
    };

    // Return document with safely formatted dates
    return NextResponse.json({
      id: document.id,
      title: document.title,
      content: document.content,
      userId: document.userId,
      createdAt: safeDate(document.createdAt),
      updatedAt: safeDate(document.updatedAt)
    });

  } catch (error) {
    console.error('Failed to fetch document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// PUT /api/documents/[documentId]
export async function PUT(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, content } = await request.json();
    
    const currentDoc = await db.get<Document>('documents', params.documentId);
    
    if (!currentDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    if (currentDoc.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Save version history
    await db.add('versions', {
      documentId: params.documentId,
      content: currentDoc.content,
      userId: session.user.id,
      createdAt: new Date().toISOString()
    });

    // Update document
    const now = new Date().toISOString();
    await db.update('documents', params.documentId, {
      ...(title && { title }),
      ...(content !== undefined && { content }),
      updatedAt: now
    });

    // Fetch updated document
    const updatedDoc = await db.get<Document>('documents', params.documentId);
    if (!updatedDoc) {
      return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
    }

    // Safely format the date
    const safeDate = (date: any) => {
      try {
        return new Date(date).toISOString();
      } catch (e) {
        return now;
      }
    };

    // Return formatted document
    return NextResponse.json({
      id: updatedDoc.id,
      title: updatedDoc.title,
      content: updatedDoc.content,
      userId: updatedDoc.userId,
      createdAt: safeDate(updatedDoc.createdAt),
      updatedAt: safeDate(updatedDoc.updatedAt)
    });

  } catch (error) {
    console.error('Failed to update document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// DELETE /api/documents/[documentId]
export async function DELETE(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const document = await db.get<Document>('documents', params.documentId);

    if (!document) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Only allow document owner to delete
    if (document.userId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await db.delete('documents', params.documentId);

    return NextResponse.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Failed to delete document:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 