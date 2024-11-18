interface ServerConfig {
  server: {
    port: number;
    wsPort: number;
  };
  cors: {
    origin: string;
    methods: string[];
    allowedHeaders: string[];
  };
  websocket: {
    heartbeatInterval: number;
    clientTimeout: number;
    maxMessageSize: number;
    reconnectDelay: number;
  };
}

export const config: ServerConfig = {
  server: {
    port: parseInt(process.env.PORT || '8080', 10),
    wsPort: parseInt(process.env.PORT || '8080', 10) + 1,
  },
  cors: {
    origin: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  },
  websocket: {
    heartbeatInterval: 30000, // 30 seconds
    clientTimeout: 60000, // 60 seconds
    maxMessageSize: 5242880, // 5MB
    reconnectDelay: 3000, // 3 seconds
  }
}; 