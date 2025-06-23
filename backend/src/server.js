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

// Middleware: CORS
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
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

// Serve frontend (production)
if (process.env.NODE_ENV === 'production') {
  const frontendPath = path.join(__dirname, '../frontend/build');
  app.use(express.static(frontendPath));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(frontendPath, 'index.html'));
  });

  console.log('[BACKEND] Serving frontend from /frontend/build');
} else {
  // Dev root route
  app.get('/', (req, res) => res.send('API Running'));
}

// Debug: Print all registered routes
const printRoutes = (stack, prefix = '') => {
  stack.forEach((layer, index) => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods)
        .map(m => m.toUpperCase())
        .join(', ');
      console.log(`${methods.padEnd(10)} ${prefix}${layer.route.path}`);
    } else if (layer.name === 'router' && layer.handle?.stack) {
      const routePath = layer.regexp?.source
        ?.replace('^\\', '/')
        .replace('\\/?(?=\\/|$)', '')
        .replace(/\\\//g, '/') || '';
      printRoutes(layer.handle.stack, prefix + routePath);
    } else {
      console.log(`[DEBUG] Skipping layer ${index} - not a route or router`);
    }
  });
};

// Start server
const PORT = process.env.PORT || process.env.BACKEND_PORT || 5000;
app.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`[BACKEND] Server started on port ${PORT}`);
  console.log(`[BACKEND] Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('='.repeat(50));
  let routerStack = null;

  if (app.router?.stack) {
    routerStack = app.router.stack;
    console.log('\n[DEBUG] Using app.router.stack to list routes');
  } else if (app._router?.stack) {
    routerStack = app._router.stack;
    console.log('\n[DEBUG] Using app._router.stack to list routes');
  }

  if (routerStack) {
    console.log('[DEBUG] Registered routes:');
    printRoutes(routerStack);
  } else {
    console.warn('[DEBUG] No routes registered — app.router and app._router are both unavailable');
  }

  // Start background services
  initializeScheduler();
  initializeCleanup();
});
