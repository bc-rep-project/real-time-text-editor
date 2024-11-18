import { 
  WebSocketMessage, 
  WebSocketMessageData,
  PresenceData,
  DocumentUpdateData,
  ChatMessageData,
  isPresenceData,
  isDocumentUpdateData,
  isChatMessageData
} from '../types';

export function validateMessage(data: unknown): WebSocketMessage | null {
  try {
    if (!data || typeof data !== 'object') return null;

    const message = data as WebSocketMessage;
    if (!message.type || !message.documentId || !message.data) return null;

    if (!['documentUpdate', 'chatMessage', 'userPresence'].includes(message.type)) {
      return null;
    }

    if (typeof message.documentId !== 'string') return null;

    // Type-specific validation
    switch (message.type) {
      case 'documentUpdate':
        if (!isDocumentUpdateData(message.data)) return null;
        break;
      case 'chatMessage':
        if (!isChatMessageData(message.data)) return null;
        break;
      case 'userPresence':
        if (!isPresenceData(message.data)) return null;
        break;
      default:
        return null;
    }

    return message;
  } catch {
    return null;
  }
}

// Helper functions for specific message type validation
function validateDocumentUpdate(data: WebSocketMessageData): data is DocumentUpdateData {
  return isDocumentUpdateData(data);
}

function validateChatMessage(data: WebSocketMessageData): data is ChatMessageData {
  return isChatMessageData(data);
}

function validatePresence(data: WebSocketMessageData): data is PresenceData {
  return isPresenceData(data);
} 