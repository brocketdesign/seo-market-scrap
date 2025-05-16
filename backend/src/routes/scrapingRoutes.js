const express = require('express');
const router = express.Router();
const { manualScrape, saveScrapedProduct } = require('../controllers/scrapingController');
const { protect } = require('../middlewares/authMiddleware'); // Middleware to protect routes

// @route   POST /api/scrape/manual
// @desc    Manually trigger scraping for a keyword/URL
// @access  Private (Admin only)
router.post('/manual', protect, manualScrape);

// @route   POST /api/scrape/save
// @desc    Save a scraped product to the database
// @access  Private (Admin only)
router.post('/save', protect, saveScrapedProduct);

module.exports = router;
