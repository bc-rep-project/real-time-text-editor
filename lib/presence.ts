import { getDatabase, Database } from 'firebase-admin/database';
import { app } from './firebase-admin';

export class PresenceSystem {
  private presenceRef: ReturnType<Database['ref']>;
  private db: Database;
  
  constructor() {
    this.db = getDatabase(app);
    this.presenceRef = this.db.ref('.info/connected');
  }

  async trackUserPresence(userId: string, documentId: string) {
    const userStatusRef = this.db
      .ref(`/status/${documentId}/${userId}`);

    this.presenceRef.on('value', async (snapshot: any) => {
      if (!snapshot.val()) return;

      await userStatusRef.onDisconnect().remove();
      await userStatusRef.set({
        status: 'online',
        lastSeen: {
          '.sv': 'timestamp'
        }
      });
    });
  }

  async getUsersInDocument(documentId: string): Promise<string[]> {
    const snapshot = await this.db
      .ref(`/status/${documentId}`)
      .once('value');
    return Object.keys(snapshot.val() || {});
  }
} 