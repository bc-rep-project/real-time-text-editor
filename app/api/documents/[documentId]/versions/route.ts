import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/db';
import * as admin from 'firebase-admin';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

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
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const versions = await db.query<Version>('versions', {
      where: [{
        field: 'documentId',
        op: '==',
        value: params.documentId
      }],
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Log the request body for debugging
    const rawBody = await request.text();
    console.log('Raw request body:', rawBody);

    let body;
    try {
      body = JSON.parse(rawBody);
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: 'Could not parse JSON'
      }, { status: 400 });
    }

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
        title: currentDoc.title
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