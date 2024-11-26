interface ServerConfig {
  port: number;
  cors: {
    origin: string[];
    methods: string[];
    allowedHeaders: string[];
  };
  websocket: {
    heartbeatInterval: number;
    clientTimeout: number;
    maxMessageSize: number;
  };
}

export const config: ServerConfig = {
  port: parseInt(process.env.PORT || '3001', 10),
  cors: {
    origin: [
      process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'https://real-time-text-editor-amber.vercel.app',
      'https://real-time-text-editor-git-bug-cee6e5-johanns-projects-6ef4f9e7.vercel.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  websocket: {
    heartbeatInterval: 30000, // 30 seconds
    clientTimeout: 60000, // 60 seconds
    maxMessageSize: 5242880, // 5MB
  }
}; 