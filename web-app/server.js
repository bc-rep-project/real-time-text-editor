const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { expressLogger, logger } = require('./logger');
const setupWebSocket = require('./websocketHandler');
const api = require('./api');

dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;

app.prepare().then(() => {
  const server = express();

  server.use(cors());
  server.use(bodyParser.json());
  server.use(expressLogger);

  // Serve static files from the public directory
  server.use(express.static(path.join(__dirname, 'public')));

  // Serve Tailwind CSS file
  server.use('/styles', express.static(path.join(__dirname, 'public/styles')));

  server.use('/api', api);

  server.all('*', (req, res) => {
    return handle(req, res);
  });

  const httpServer = http.createServer(server);
  const wss = setupWebSocket(httpServer);

  httpServer.listen(PORT, (err) => {
    if (err) {
      logger.error(`Error starting server: ${err.message}`);
      throw err;
    }
    logger.info(`Server ready on http://localhost:${PORT}`);
  });
}).catch((err) => {
  logger.error(`Error preparing Next.js app: ${err.message}`);
  process.exit(1);
});
