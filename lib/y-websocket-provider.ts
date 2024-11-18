import * as Y from 'yjs';
import { WebSocketMessage, AwarenessMessage, SyncMessage } from '@/types/websocket';

export class CustomWebsocketProvider {
  private ws: WebSocket;
  private doc: Y.Doc;
  private awareness: Map<number, any>;
  private connected: boolean = false;

  constructor(url: string, roomName: string, doc: Y.Doc) {
    this.doc = doc;
    this.awareness = new Map();
    this.ws = new WebSocket(`${url}?documentId=${roomName}`);
    
    this.ws.onopen = () => {
      this.connected = true;
      // Send initial sync message
      this.sendUpdate();
    };

    this.ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        if (message.type === 'sync') {
          // Apply updates from other clients
          const syncMessage = message as SyncMessage;
          if (syncMessage.data) {
            Y.applyUpdate(this.doc, new Uint8Array(syncMessage.data));
          }
        } else if (message.type === 'awareness') {
          // Handle cursor updates
          const awarenessMessage = message as AwarenessMessage;
          this.awareness.set(awarenessMessage.clientId, awarenessMessage.data);
        }
      } catch (error) {
        console.error('Error processing message:', error);
      }
    };

    // Listen for document updates
    this.doc.on('update', (update: Uint8Array) => {
      if (this.connected) {
        this.sendUpdate(update);
      }
    });
  }

  private sendUpdate(update?: Uint8Array) {
    if (!this.connected) return;

    const message: SyncMessage = {
      type: 'sync',
      documentId: this.doc.guid,
      data: update ? Array.from(update) : null,
      timestamp: Date.now()
    };

    this.ws.send(JSON.stringify(message));
  }

  setAwarenessField(field: string, value: any) {
    const message: AwarenessMessage = {
      type: 'awareness',
      documentId: this.doc.guid,
      clientId: this.doc.clientID,
      data: { [field]: value },
      timestamp: Date.now()
    };
    this.ws.send(JSON.stringify(message));
  }

  destroy() {
    this.ws.close();
  }
} 