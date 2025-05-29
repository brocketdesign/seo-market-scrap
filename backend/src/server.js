const express = require('express');
const dotenv = require('dotenv');
const path = require('path'); // Import path module
const cors = require('cors'); // Import cors module
const next = require('next'); // Import next

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

const dev = process.env.NODE_ENV !== 'production';
// Adjust the path to point to the 'frontend' directory from 'backend/src'
const nextApp = next({ dev, dir: path.resolve(__dirname, '../../frontend') });
const handle = nextApp.getRequestHandler();

connectDB();

const app = express();

// Logging middleware for all requests
app.use((req, res, nextMiddleware) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BACKEND] Received request: ${req.method} ${req.url}`);
  
  res.on('finish', () => {
    console.log(`[${timestamp}] [BACKEND] Response: ${res.statusCode} for ${req.method} ${req.url}`);
  });
  
  nextMiddleware();
});

// CORS middleware
// Determine allowed origins
const allowedOrigins = ['http://localhost:3000']; // Frontend dev URL (Next.js default)
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}
if (process.env.HEROKU_APP_NAME) {
  allowedOrigins.push(`https://${process.env.HEROKU_APP_NAME}.herokuapp.com`);
}
// If running in production and no specific frontend URL is set,
// and if backend serves frontend, same-origin requests will occur.
// For API access from other specific domains on Heroku, configure FRONTEND_URL env var.

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests) or same-origin requests
    if (!origin || allowedOrigins.indexOf(origin) !== -1 || origin === undefined) {
      callback(null, true);
    } else {
      console.warn(`CORS: Origin ${origin} not allowed.`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Init Middleware
app.use(express.json({ extended: false }));

// Define API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/scrape', scrapingRoutes); // Use scraping routes
app.use('/api/cron-jobs', cronJobRoutes); // Use cron job routes
app.use('/api/products', productRoutes); // Use product routes
app.use('/api/settings', settingsRoutes); // Use settings routes

const PORT = process.env.PORT || process.env.BACKEND_PORT || 5001;

nextApp.prepare().then(() => {
  // Default route handler for Next.js pages
  // This should be after all your API routes
  app.all('*', (req, res) => {
    return handle(req, res);
  });

  app.listen(PORT, (err) => {
    if (err) {
      console.error("Failed to start server:", err);
      throw err;
    }
    console.log('='.repeat(50));
    console.log(`[BACKEND] Server started on port ${PORT}`);
    console.log(`[BACKEND] Next.js app ready and served on port ${PORT}`);
    console.log(`[BACKEND] Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('='.repeat(50));
    
    // Initialize the scheduler service
    initializeScheduler();
    
    // Initialize the cleanup service
    initializeCleanup();
  });
}).catch(ex => {
  console.error("Error preparing Next.js app:", ex.stack);
  process.exit(1);
});
