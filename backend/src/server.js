const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const cors = require('cors');
const connectDB = require('./config/db');
const { initializeScheduler } = require('./services/schedulerService');
const { initializeCleanup } = require('./services/cleanupService');

// Routes
const adminRoutes = require('./routes/adminRoutes');
const scrapingRoutes = require('./routes/scrapingRoutes');
const cronJobRoutes = require('./routes/cronJobRoutes');
const productRoutes = require('./routes/productRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect to database
connectDB();

const app = express();

// Middleware: Request logging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] [BACKEND] ${req.method} ${req.url}`);
  res.on('finish', () => {
    console.log(`[${timestamp}] [BACKEND] Response ${res.statusCode} for ${req.method} ${req.url}`);
  });
  next();
});

// --- Next.js integration ---
const next = require('next');
const dev = process.env.NODE_ENV !== 'production';
// Point Next.js to the frontend directory
const nextApp = next({ dev, dir: path.resolve(__dirname, '../../frontend') });
const handle = nextApp.getRequestHandler();

nextApp.prepare().then(() => {
  // Middleware: CORS
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://www.rakurabu.com',
      'https://rakurabu.com',
      'https://app.rakurabu.com',
      'https://app.rakurabu.com/ja',
      'https://www.rakurabu.com/ja',
      'https://rakurabu.com/ja',
      'https://seo-market-scraper-302575e6832d.herokuapp.com',
      process.env.FRONTEND_URL
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  // Middleware: JSON parsing
  app.use(express.json({ extended: false }));

  // API Routes
  console.log('[BACKEND] Registering API routes...');
  app.use('/api/admin', adminRoutes);
  app.use('/api/scrape', scrapingRoutes);
  app.use('/api/cron-jobs', cronJobRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/settings', settingsRoutes);
  console.log('[BACKEND] All API routes registered successfully');

  // Dev root route
  if (dev) {
    app.get('/', (req, res) => res.send('API Running'));
  }

  // Catch all other routes and send to Next.js handler
  app.all(/(.*)/, (req, res) => {
    return handle(req, res);
  });

  const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;
  app.listen(PORT, () => {
    // Start background services
    initializeScheduler();
    initializeCleanup();
    console.log(`[BACKEND] Server started on port ${PORT}`);
  });
});
