const config = {
  websocketUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8081',
  allowedOrigins: [
    'http://localhost:3000',
    process.env.NEXT_PUBLIC_APP_URL || 'https://your-vercel-domain.vercel.app'
  ]
};

export default config; 