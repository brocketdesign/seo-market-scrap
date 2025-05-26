const express = require('express');
const { 
  getSettings, 
  updateScraperSettings, 
  updateDashboardSettings,
  updateNotificationSettings,
  updateSystemSettings
} = require('../controllers/settingsController');
const { protect, admin } = require('../middlewares/authMiddleware');
const { manualCleanup } = require('../services/cleanupService');

const router = express.Router();

// All routes are protected with authentication middleware
// Route: /api/settings
router.get('/', protect, admin, getSettings);

// Settings by category
router.put('/scraper', protect, admin, updateScraperSettings);
router.put('/dashboard', protect, admin, updateDashboardSettings);
router.put('/notifications', protect, admin, updateNotificationSettings);
router.put('/system', protect, admin, updateSystemSettings);

// System maintenance routes
router.post('/cleanup', protect, admin, async (req, res) => {
  try {
    const result = await manualCleanup();
    
    if (result.success) {
      return res.json({ 
        message: result.message,
        deletedCount: result.deletedCount
      });
    } else {
      return res.status(500).json({ 
        message: result.message 
      });
    }
  } catch (error) {
    console.error('Error during manual cleanup:', error);
    res.status(500).json({ 
      message: 'An error occurred during cleanup',
      error: error.message
    });
  }
});

module.exports = router;
