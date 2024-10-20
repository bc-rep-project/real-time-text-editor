
// errorHandler.js

const createError = require('http-errors');
const logger = require('./logger');

// Express error handler middleware
const expressErrorHandler = (err, req, res, next) => {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Log the error
  logger.error(`Express error: ${err.message}`, { stack: err.stack });

  // Set status code
  res.status(err.status || 500);

  // Send error response
  res.json({
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
};

// WebSocket error handler
const wsErrorHandler = (ws, err) => {
  logger.error(`WebSocket error: ${err.message}`, { stack: err.stack });

  const errorResponse = JSON.stringify({
    type: 'error',
    error: {
      message: err.message,
      status: err.status || 500,
    },
  });
  ws.send(errorResponse);
};

// Custom error creator
const createCustomError = (status, message) => {
  logger.warn(`Creating custom error: ${message}`, { status });
  return createError(status, message);
};

module.exports = {
  expressErrorHandler,
  wsErrorHandler,
  createCustomError,
};

