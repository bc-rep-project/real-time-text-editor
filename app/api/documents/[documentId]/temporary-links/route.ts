import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { adminDb } from '@/lib/firebase-admin';
import { nanoid } from 'nanoid';

interface TemporaryLink {
  id: string;
  documentId: string;
  url: string;
  role: string;
  createdBy: string;
  createdAt: string;
  expiresAt: string;
  usageCount: number;
  maxUses?: number;
  isRevoked: boolean;
}

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

    // Get all temporary links for the document
    const linksRef = adminDb.collection('temporaryLinks');
    const linksQuery = await linksRef
      .where('documentId', '==', params.documentId)
      .orderBy('createdAt', 'desc')
      .get();

    const links = linksQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json(links);
  } catch (error) {
    console.error('Error fetching temporary links:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
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
      .where('role', 'in', ['admin', 'editor'])
      .get();

    if (userAccessQuery.empty) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const body = await request.json();
    const { role, expiresAt, maxUses } = body;

    // Create temporary link
    const token = nanoid();
    const url = `${token}`;

    const linkData = {
      documentId: params.documentId,
      url,
      role,
      createdBy: session.user.id,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(expiresAt).toISOString(),
      usageCount: 0,
      maxUses: maxUses || null,
      isRevoked: false,
    };

    const linksRef = adminDb.collection('temporaryLinks');
    const linkRef = await linksRef.add(linkData);

    // Log the action
    await adminDb.collection('accessLogs').add({
      documentId: params.documentId,
      action: 'created',
      performedBy: session.user.id,
      details: `Created temporary ${role} access link`,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      id: linkRef.id,
      ...linkData,
    });
  } catch (error) {
    console.error('Error creating temporary link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
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
      .where('role', 'in', ['admin', 'editor'])
      .get();

    if (userAccessQuery.empty) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    const { linkId } = await request.json();

    // Revoke the link
    const linkRef = adminDb.collection('temporaryLinks').doc(linkId);
    const linkDoc = await linkRef.get();

    if (!linkDoc.exists) {
      return new NextResponse('Link not found', { status: 404 });
    }

    await linkRef.update({
      isRevoked: true,
      updatedAt: new Date().toISOString(),
    });

    // Log the action
    await adminDb.collection('accessLogs').add({
      documentId: params.documentId,
      action: 'revoked',
      performedBy: session.user.id,
      details: 'Temporary link revoked',
      timestamp: new Date().toISOString(),
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error revoking temporary link:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 