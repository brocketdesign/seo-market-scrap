const express = require('express');
const router = express.Router();
const { loginAdmin } = require('../controllers/adminController');
const { getDashboardStats } = require('../controllers/dashboardController');
const { protect } = require('../middlewares/authMiddleware');

// @route   POST /api/admin/login
// @desc    Authenticate admin user & get token
// @access  Public
router.post('/login', loginAdmin);

// @route   GET /api/admin/dashboard
// @desc    Get admin dashboard statistics
// @access  Private (Admin only)
router.get('/dashboard', protect, getDashboardStats);

module.exports = router;
