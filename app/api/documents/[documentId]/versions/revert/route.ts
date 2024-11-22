import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

interface Document {
  id: string;
  content: string;
  title: string;
  updatedAt: Date;
}

interface Version {
  id: string;
  documentId: string;
  content: string;
  userId: string;
  createdAt: Date;
}

// POST /api/documents/[documentId]/versions/revert
export async function POST(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { versionId, content } = body;

    // Validate required fields
    if (!versionId || !content) {
      return NextResponse.json({ 
        error: 'Version ID and content are required',
        receivedData: { versionId, content } 
      }, { status: 400 });
    }

    // Get current document
    const currentDoc = await db.get<Document>('documents', params.documentId);
    if (!currentDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Verify the version exists
    const versionToRevert = await db.get<Version>('versions', versionId);
    if (!versionToRevert) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    try {
      // First save the current version
      const newVersionId = await db.add('versions', {
        documentId: params.documentId,
        content: currentDoc.content,
        userId: session.user.id,
        createdAt: new Date(),
      });

      // Then update the document with the reverted content
      await db.update('documents', params.documentId, {
        content: content,
        updatedAt: new Date()
      });

      return NextResponse.json({ 
        success: true,
        message: 'Successfully reverted to selected version',
        newVersionId
      });
    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return NextResponse.json({ 
        error: 'Failed to save version history',
        details: dbError instanceof Error ? dbError.message : 'Unknown error'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Failed to revert version:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 