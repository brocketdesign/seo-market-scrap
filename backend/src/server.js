const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Import path module
const cors = require('cors'); // Import cors module
const connectDB = require('./config/db');
const { initializeScheduler } = require('./services/schedulerService');
const { initializeCleanup } = require('./services/cleanupService');

// Import Next.js
const next = require('next');

// Import routes
const adminRoutes = require('./routes/adminRoutes');
const scrapingRoutes = require('./routes/scrapingRoutes'); // Import scraping routes
const cronJobRoutes = require('./routes/cronJobRoutes'); // Import cron job routes
const productRoutes = require('./routes/productRoutes'); // Import product routes
const settingsRoutes = require('./routes/settingsRoutes'); // Import settings routes

// Load env vars from root .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });

connectDB();

const app = express();

// Logging middleware for all requests
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BACKEND] Received request: ${req.method} ${req.url}`);
  
  // Log response status when the response is completed
  res.on('finish', () => {
    console.log(`[${timestamp}] [BACKEND] Response: ${res.statusCode} for ${req.method} ${req.url}`);
  });
  
  next();
});

// CORS middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.FRONTEND_URL
  ].filter(Boolean), // Remove any undefined values
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Init Middleware
app.use(express.json({ extended: false }));

// Prepare Next.js app in production
let nextApp, handle;
if (process.env.NODE_ENV === 'production') {
  nextApp = next({
    dev: false,
    dir: path.join(__dirname, '../../frontend'),
  });
  handle = nextApp.getRequestHandler();
}

// Define Routes
console.log('[BACKEND] Registering route: /api/admin');
app.use('/api/admin', adminRoutes);
console.log('[BACKEND] Registering route: /api/scrape');
app.use('/api/scrape', scrapingRoutes); // Use scraping routes
console.log('[BACKEND] Registering route: /api/cron-jobs');
app.use('/api/cron-jobs', cronJobRoutes); // Use cron job routes
console.log('[BACKEND] Registering route: /api/products');
app.use('/api/products', productRoutes); // Use product routes
console.log('[BACKEND] Registering route: /api/settings');
app.use('/api/settings', settingsRoutes); // Use settings routes

console.log('[BACKEND] All API routes registered successfully');
console.log(`[BACKEND] NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`[BACKEND] process.env.PORT: ${process.env.PORT}`);
// In production, handle all non-API routes with Next.js
if (process.env.NODE_ENV === 'production') {
  // Prepare Next.js and then start the server
  console.log(`[BACKEND] Preparing Next.js app...`);
  nextApp.prepare()
    .then(() => {
      // Catch-all handler for non-API routes
      console.log('[BACKEND] Next.js app prepared, starting server...');
      app.all('*', (req, res) => {
        if (req.url.startsWith('/api/')) {
          // Let API routes fall through to 404 handler below
          return res.status(404).json({ message: 'API route not found' });
        }
        return handle(req, res);
      });

      // Start server after Next.js is ready
      // Always use process.env.PORT in production (Heroku requirement)
      const PORT = process.env.PORT || 8000;
      app.listen(PORT, () => {
        console.log('='.repeat(50));
        console.log(`[BACKEND] Server started on port ${PORT}`);
        console.log(`[BACKEND] Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log('='.repeat(50));
        console.log('🚀 Backend server started. It will serve the frontend build.');
        // Initialize the scheduler service
        initializeScheduler();
        // Initialize the cleanup service
        initializeCleanup();
      });
    })
    .catch((err) => {
      console.error('[BACKEND] Error preparing Next.js app:', err);
      process.exit(1);
    });
} else {
  // Development mode
  console.log('[BACKEND] Registering development GET route: /');
  app.get('/', (req, res) => res.send('API Running'));

  // Use fallback only in development
  const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;
  console.log(`[BACKEND] Starting server on port ${PORT}...`);
  app.listen(PORT, () => {
    console.log('='.repeat(50));
    console.log(`[BACKEND] Server started on port ${PORT}`);
    console.log(`[BACKEND] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
    // Initialize the scheduler service
    initializeScheduler();
    // Initialize the cleanup service
    initializeCleanup();
  });
}
