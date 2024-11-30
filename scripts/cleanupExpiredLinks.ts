import { adminDb } from '@/lib/firebase-admin';

interface ExpiredLink {
  id: string;
  documentId: string;
  createdBy: string;
}

async function cleanupExpiredLinks() {
  try {
    console.log('Starting cleanup of expired temporary links...');

    // Find all expired links that haven't been revoked
    const linksRef = adminDb.collection('temporaryLinks');
    const expiredLinksQuery = await linksRef
      .where('isRevoked', '==', false)
      .where('expiresAt', '<', new Date().toISOString())
      .get();

    const expiredLinks = expiredLinksQuery.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ExpiredLink[];

    console.log(`Found ${expiredLinks.length} expired links`);

    // Revoke all expired links
    const batch = adminDb.batch();
    expiredLinks.forEach(link => {
      const linkRef = linksRef.doc(link.id);
      batch.update(linkRef, {
        isRevoked: true,
        updatedAt: new Date().toISOString()
      });
    });

    // Log the revocations
    expiredLinks.forEach(link => {
      const logRef = adminDb.collection('accessLogs').doc();
      batch.set(logRef, {
        documentId: link.documentId,
        action: 'revoked',
        performedBy: link.createdBy,
        details: 'Temporary link expired and was automatically revoked',
        timestamp: new Date().toISOString()
      });
    });

    await batch.commit();

    console.log('Cleanup completed successfully');
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
}

// If running directly (not imported)
if (require.main === module) {
  cleanupExpiredLinks();
}

export { cleanupExpiredLinks }; 