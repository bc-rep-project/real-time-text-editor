import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { db } from '@/lib/firebase-admin';

export async function POST(
  request: Request,
  { params }: { params: { documentId: string } }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { content, restoredFromVersionId } = await request.json();

    // Create new version entry
    const versionRef = await db.collection('versions').add({
      documentId: params.documentId,
      content,
      userId: session.user.id,
      username: session.user.name,
      createdAt: new Date(),
      restoredFromVersionId // Track which version this was restored from
    });

    return NextResponse.json({ id: versionRef.id }, { status: 201 });
  } catch (error) {
    console.error('Error creating version:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 