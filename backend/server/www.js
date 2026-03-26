#!/usr/bin/env node

/**
 * Module dependencies.
 */
const http = require('http');
const cluster = require('cluster');
const os = require('os');
const config = require('./config')[process.env.NODE_ENV || 'local'];
const app = require('./app')(config);
const { db } = require('./lib/db');

const log = config.log();

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);

  if (Number.isNaN(port)) {
    // named pipe
    return val;
  }
  if (port >= 0) {
    // port number
    return port;
  }
  return false;
}

/**
 * Get port from environment and store in Express.
 */
const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server and listen on the provided port
 */
const server = http.createServer(app);
Promise.all([db.connect()])
  .then(() => {
    log.info('Connected to MariaDB successfully');
    server.listen(port);
  })
  .catch((err) => {
    log.fatal(err);
  });

server.on('listening', () => {
  const addr = server.address();
  const bind = typeof addr === 'string' ? `pipe ${addr}` : `port ${addr.port}`;
  log.info(`Listening on ${bind}`);
});

// Handle server errors
server.on('error', (error) => {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string' ? `Pipe ${port}` : `Port ${port}`;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      log.fatal(`${bind} requires elevated privileges`);
      process.exit(1);
      break;
    case 'EADDRINUSE':
      log.fatal(`${bind} is already in use`);
      process.exit(1);
      break;
    default:
      log.info(error);
    //throw error;
  }
});
