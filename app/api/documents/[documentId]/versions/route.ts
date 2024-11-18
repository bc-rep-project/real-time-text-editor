import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';

interface User {
  id: string;
  username: string;
  password: string;
  email?: string;
}

interface Version {
  id: string;
  documentId: string;
  content: string;
  userId: string;
  createdAt: Date;
  username?: string;
}

interface Document {
  id: string;
  content: string;
  title: string;
  updatedAt: Date;
}

// GET /api/documents/[documentId]/versions
export async function GET(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versions = await db.query<Version>('versions', {
      where: {
        field: 'documentId',
        op: '==',
        value: params.documentId
      },
      orderBy: {
        field: 'createdAt',
        direction: 'desc'
      }
    });

    // Get usernames for each version
    const versionsWithUsernames = await Promise.all(
      versions.map(async (version: Version) => {
        const user = await db.get<User>('users', version.userId);
        return {
          ...version,
          username: user?.username || 'Unknown User'
        };
      })
    );

    return NextResponse.json(versionsWithUsernames);
  } catch (error) {
    console.error('Failed to fetch versions:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
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

    const { versionId } = await request.json();
    if (!versionId) {
      return NextResponse.json({ error: 'Version ID is required' }, { status: 400 });
    }

    // Get the version to revert to
    const version = await db.get<Version>('versions', versionId);

    if (!version) {
      return NextResponse.json({ error: 'Version not found' }, { status: 404 });
    }

    // Get current document
    const currentDoc = await db.get<Document>('documents', params.documentId);

    if (!currentDoc) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    // Save current version before reverting
    await db.add('versions', {
      documentId: params.documentId,
      content: currentDoc.content,
      userId: session.user.id,
      createdAt: new Date()
    });

    // Revert to the selected version
    await db.update('documents', params.documentId, {
      content: version.content,
      updatedAt: new Date()
    });

    // Get updated document
    const updatedDocument = await db.get<Document>('documents', params.documentId);

    return NextResponse.json(updatedDocument);
  } catch (error) {
    console.error('Failed to revert version:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 