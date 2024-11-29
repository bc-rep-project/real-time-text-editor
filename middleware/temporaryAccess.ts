import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function validateTemporaryAccess(
  request: NextRequest,
  documentId: string,
  token: string
) {
  try {
    // Find the temporary link
    const link = await prisma.temporaryLink.findFirst({
      where: {
        documentId,
        url: {
          endsWith: `/${token}`,
        },
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!link) {
      return {
        error: 'Invalid or expired link',
        status: 403,
      };
    }

    // Check usage limits
    if (link.maxUses && link.usageCount >= link.maxUses) {
      return {
        error: 'Link has reached maximum usage limit',
        status: 403,
      };
    }

    // Increment usage count
    await prisma.temporaryLink.update({
      where: { id: link.id },
      data: { usageCount: { increment: 1 } },
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
      expires: link.expiresAt,
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
    const link = await prisma.temporaryLink.findUnique({
      where: {
        id: sessionData.linkId,
        isRevoked: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!link || (link.maxUses && link.usageCount >= link.maxUses)) {
      return null;
    }

    return sessionData;
  } catch (error) {
    console.error('Error validating temporary session:', error);
    return null;
  }
} 