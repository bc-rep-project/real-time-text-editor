const config = {
  websocketUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081',
  allowedOrigins: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-vercel-domain.vercel.app'
  ],
  firebase: {
    persistenceEnabled: true,
    cacheSizeBytes: 50000000,
    experimentalForceLongPolling: false,
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
    collections: {
      users: 'users',
      documents: 'documents',
      versions: 'versions',
      chatMessages: 'chat_messages'
    },
    indexes: {
      documents: ['title', 'updatedAt'],
      chatMessages: ['documentId', 'createdAt'],
      versions: ['documentId', 'createdAt']
    }
  }
};

export default config; 