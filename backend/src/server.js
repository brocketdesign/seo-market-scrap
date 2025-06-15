const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Import path module
const cors = require('cors'); // Import cors module
const connectDB = require('./config/db');
const { initializeScheduler } = require('./services/schedulerService');
const { initializeCleanup } = require('./services/cleanupService');

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

// In production, serve static files from Next.js build
if (process.env.NODE_ENV === 'production') {
  // Serve static files from Next.js .next/static directory
  const nextJsOutputDir = path.join(__dirname, '../../frontend/.next');
  const nextJsPublicDir = path.join(__dirname, '../../frontend/public');
  const nextJsOutDir = path.join(__dirname, '../../frontend/out');
  
  try {
    const fs = require('fs');
    
    // Check if Next.js build exists (.next directory for server-side rendering)
    if (fs.existsSync(nextJsOutputDir)) {
      console.log('[BACKEND] Serving Next.js build from: frontend/.next');
      console.log('[BACKEND] Registering static path: /_next/static');
      app.use('/_next/static', express.static(path.join(nextJsOutputDir, 'static')));
      
      console.log('[BACKEND] Registering static path: /static (public)');
      app.use('/static', express.static(nextJsPublicDir));
      
      console.log('[BACKEND] Registering static path: / (public)');
      app.use(express.static(nextJsPublicDir));
    } 
    // Check if Next.js export exists (out directory for static export)
    else if (fs.existsSync(nextJsOutDir)) {
      console.log('[BACKEND] Serving Next.js static export from: frontend/out');
      app.use(express.static(nextJsOutDir));
    } else {
      console.error('[BACKEND] ERROR: Next.js build directory not found!');
      console.error('[BACKEND] Expected directory: frontend/.next or frontend/out');
    }
  } catch (error) {
    console.error('[BACKEND] Error setting up static file serving:', error);
  }
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

// In production, serve the built Next.js app
if (process.env.NODE_ENV === 'production') {
  // Handle all other routes by serving the Next.js app
  console.log('[BACKEND] Registering catch-all middleware for non-API routes');
  
  app.use((req, res, next) => {
    // Skip API routes - let them go to the 404 handler
    if (req.url.startsWith('/api/')) {
      return next();
    }
    
    // For Next.js static export, serve index.html for all routes
    const fs = require('fs');
    const nextJsOutDir = path.join(__dirname, '../../frontend/out');
    const indexHtmlPath = path.join(nextJsOutDir, 'index.html');
    
    if (fs.existsSync(indexHtmlPath)) {
      res.sendFile(indexHtmlPath);
    } else {
      // Fallback to the public directory
      const publicIndexPath = path.join(__dirname, '../../frontend/public/index.html');
      if (fs.existsSync(publicIndexPath)) {
        res.sendFile(publicIndexPath);
      } else {
        res.status(404).send('Application not found - frontend not properly built');
      }
    }
  });
  
  // Simple 404 handler for unmatched routes (including API routes)
  app.use((req, res) => {
    if (req.url.startsWith('/api/')) {
      res.status(404).json({ message: 'API route not found' });
    } else {
      res.status(404).send('Page not found');
    }
  });
} else {
  console.log('[BACKEND] Registering development GET route: /');
  app.get('/', (req, res) => res.send('API Running'));
}

const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;

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
