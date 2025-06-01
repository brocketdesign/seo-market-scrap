#!/usr/bin/env node

// Set production environment
process.env.NODE_ENV = 'production';

// Start the backend server
require('./backend/src/server.js');
