#!/usr/bin/env node

// Set production environment
process.env.NODE_ENV = 'production';

// Import required modules
const { spawn } = require('child_process');
const path = require('path');

// Start the backend server (main process)
require('./backend/src/server.js');

// In production, the backend will serve the frontend static build
console.log('🚀 Backend server started. It will serve the frontend build.');
