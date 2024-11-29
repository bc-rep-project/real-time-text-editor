import { prisma } from '@/lib/prisma';

interface ExpiredLink {
  id: string;
  documentId: string;
  createdBy: string;
}

async function cleanupExpiredLinks() {
  try {
    console.log('Starting cleanup of expired temporary links...');

    // Find all expired links that haven't been revoked
    const expiredLinks = await prisma.temporaryLink.findMany({
      where: {
        isRevoked: false,
        expiresAt: {
          lt: new Date(),
        },
      },
      select: {
        id: true,
        documentId: true,
        createdBy: true,
      },
    }) as ExpiredLink[];

    console.log(`Found ${expiredLinks.length} expired links`);

    // Revoke all expired links
    await prisma.temporaryLink.updateMany({
      where: {
        id: {
          in: expiredLinks.map((link: ExpiredLink) => link.id),
        },
      },
      data: {
        isRevoked: true,
      },
    });

    // Log the revocations
    await prisma.accessLog.createMany({
      data: expiredLinks.map((link: ExpiredLink) => ({
        documentId: link.documentId,
        action: 'revoked',
        performedBy: link.createdBy,
        details: 'Temporary link expired and was automatically revoked',
      })),
    });

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// If running directly (not imported)
if (require.main === module) {
  cleanupExpiredLinks();
}

export { cleanupExpiredLinks }; 