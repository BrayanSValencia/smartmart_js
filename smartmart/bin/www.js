#!/usr/bin/env node

/**
 * Module dependencies.
 */
import app from '../app.js';
import debugLib from 'debug';
import http from 'http';
import { sequelize } from '../config/db/pool.js';

const debug = debugLib('smartmart:server');

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  const port = parseInt(val, 10);
  if (isNaN(port)) return val; // named pipe
  if (port >= 0) return port;  // port number
  return false;
}

/**
 * Initialize database and start server
 */
async function initialize() {
  try {
    // Database connection
    await sequelize.authenticate();
   // debug('✅ Database connection established');
    
    // Sync models (alter: true for development only)
   // await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
    //debug('📦 Database models synchronized');

    // Server setup
    const port = normalizePort(process.env.PORT);
    app.set('port', port);
    const server = http.createServer(app);

    // Event listeners
    server.on('error', (error) => {
      if (error.syscall !== 'listen') throw error;

      const bind = typeof port === 'string'
        ? 'Pipe ' + port
        : 'Port ' + port;

      switch (error.code) {
        case 'EACCES':
          //.error(bind + ' requires elevated privileges');
          process.exit(1);
        case 'EADDRINUSE':
         // console.error(bind + ' is already in use');
          process.exit(1);
        default:
          throw error;
      }
    });

    server.on('listening', () => {
      const addr = server.address();
      const bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
      debug('Listening on ' + bind);
      //console.log('✅ Server running on http://localhost:' + addr.port);
    });

    server.listen(port);

  } catch (error) {
   // debug('❌ Server initialization failed:', error);
    process.exit(1);
  }
}

// Start the application
initialize();