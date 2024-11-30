import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

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

export async function validateTemporaryAccess(
  request: NextRequest,
  documentId: string,
  token: string
) {
  try {
    // Find the temporary link
    const linksRef = adminDb.collection('temporaryLinks');
    const linkQuery = await linksRef
      .where('documentId', '==', documentId)
      .where('url', '==', token)
      .where('isRevoked', '==', false)
      .where('expiresAt', '>', new Date().toISOString())
      .get();

    if (linkQuery.empty) {
      return {
        error: 'Invalid or expired link',
        status: 403,
      };
    }

    const link = {
      id: linkQuery.docs[0].id,
      ...linkQuery.docs[0].data()
    } as TemporaryLink;

    // Check usage limits
    if (link.maxUses && link.usageCount >= link.maxUses) {
      return {
        error: 'Link has reached maximum usage limit',
        status: 403,
      };
    }

    // Increment usage count
    await linksRef.doc(link.id).update({
      usageCount: (link.usageCount || 0) + 1
    });

    // Create temporary session data
    const sessionData = {
      documentId,
      role: link.role,
      accessType: 'temporary',
      linkId: link.id,
      expiresAt: link.expiresAt,
    };

    // Set session data in a cookie
    const response = NextResponse.next();
    response.cookies.set('temporary_access', JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      expires: new Date(link.expiresAt),
    });

    return { response, sessionData };
  } catch (error) {
    console.error('Error validating temporary access:', error);
    return {
      error: 'Internal server error',
      status: 500,
    };
  }
}

export async function validateTemporarySession(request: NextRequest) {
  try {
    const temporaryAccess = request.cookies.get('temporary_access');
    if (!temporaryAccess) {
      return null;
    }

    const sessionData = JSON.parse(temporaryAccess.value);
    if (new Date(sessionData.expiresAt) <= new Date()) {
      return null;
    }

    // Verify the link still exists and is valid
    const linkDoc = await adminDb.collection('temporaryLinks').doc(sessionData.linkId).get();
    const link = linkDoc.exists ? linkDoc.data() as TemporaryLink : null;

    if (!link || 
        link.isRevoked || 
        new Date(link.expiresAt) <= new Date() ||
        (link.maxUses && link.usageCount >= link.maxUses)) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error validating temporary session:', error);
    return null;
  }
} 