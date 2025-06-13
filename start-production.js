#!/usr/bin/env node

// Set production environment
process.env.NODE_ENV = 'production';

// Import required modules
const path = require('path');

// Log startup information
console.log('='.repeat(50));
console.log('🚀 Starting production server...');
console.log('Environment: production');
console.log('Node version:', process.version);
console.log('='.repeat(50));

// Start the backend server (main process)
// The backend will serve both the API and the Next.js frontend
try {
  require('./backend/src/server.js');
  console.log('🚀 Backend server started. It will integrate with Next.js for the frontend.');
} catch (error) {
  console.error('❌ Failed to start the server:', error);
  process.exit(1);
}
