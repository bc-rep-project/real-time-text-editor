



const express = require('express');
const next = require('next');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const dotenv = require('dotenv');
const { expressErrorHandler, createCustomError } = require('./errorHandler');
const setupWebSocket = require('./websocketHandler');
const apiRoutes = require('./api');
const logger = require('./logger');
const { authenticateUser, registerUser, loginUser } = require('./auth');

// Load environment variables
dotenv.config();

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();
  const httpServer = http.createServer(server);

  // Set up WebSocket
  const wss = setupWebSocket(httpServer);

  // Middleware
  server.use(cors());
  server.use(bodyParser.json());

  // Serve static files from the 'public' directory
  server.use(express.static(path.join(__dirname, 'public')));

  // Authentication routes
  server.post('/api/register', registerUser);
  server.post('/api/login', loginUser);

  // Protected API routes
  server.use('/api', authenticateUser, apiRoutes);

  // Next.js request handler
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  // Error handling middleware
  server.use(expressErrorHandler);

  const PORT = process.env.PORT || 3003;

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



