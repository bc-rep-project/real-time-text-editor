
const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');
const { server: websocketServer, app: websocketApp } = require('./web-app/websocket');
const apiRoutes = require('./web-app/api');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: './web-app' });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // Middleware
  server.use(cors());
  server.use(bodyParser.json());

  // API routes
  server.use('/api', apiRoutes);

  // Next.js request handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || 3003;

  websocketServer.on('request', server);
  websocketServer.listen(PORT, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${PORT}`);
  });
});
