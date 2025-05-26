const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
  getPublicProducts,
  getPublicProductById
} = require('../controllers/productController');
const { protect } = require('../middlewares/authMiddleware'); // Middleware to protect routes

// Public routes (no authentication required)
// @route   GET /api/products/public
// @desc    Get products for public display with pagination, sorting, and filtering
// @access  Public
router.get('/public', getPublicProducts);

// @route   GET /api/products/public/:id
// @desc    Get a single public product by ID
// @access  Public
router.get('/public/:id', getPublicProductById);

// All routes below are protected with admin authentication
router.use(protect);

// @route   GET /api/products
// @desc    Get all products with pagination, sorting, and filtering
// @access  Private (Admin only)
router.get('/', getProducts);

// @route   GET /api/products/stats
// @desc    Get product statistics
// @access  Private (Admin only)
router.get('/stats', getProductStats);

// @route   GET /api/products/:id
// @desc    Get a single product by ID
// @access  Private (Admin only)
router.get('/:id', getProductById);

// @route   PUT /api/products/:id
// @desc    Update a product
// @access  Private (Admin only)
router.put('/:id', updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete a product
// @access  Private (Admin only)
router.delete('/:id', deleteProduct);

module.exports = router;
