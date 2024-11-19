interface Config {
  websocket: {
    url: string;
    reconnectDelay: number;
  };
  firebase: {
    cacheSizeBytes?: number;
    experimentalForceLongPolling: boolean;
    experimentalAutoDetectLongPolling: boolean;
    ignoreUndefinedProperties: boolean;
  };
}

const config: Config = {
  websocket: {
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081',
    reconnectDelay: 3000, // 3 seconds
  },
  firebase: {
    experimentalForceLongPolling: true,
    experimentalAutoDetectLongPolling: true,
    ignoreUndefinedProperties: true,
  }
};

export default config; 