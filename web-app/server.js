const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const path = require('path');
const setupWebSocket = require('./websocketHandler');
const api = require('./api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve Tailwind CSS file
app.use('/styles', express.static(path.join(__dirname, 'public/styles')));

app.use('/api', api);

const httpServer = http.createServer(app);
const wss = setupWebSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log();
});
