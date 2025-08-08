const express = require('express');
const router = express.Router();
const affiliationController = require('../controllers/affiliationController');

// Validate token from WordPress site
router.post('/validate-token', affiliationController.validateToken);

// Get redirect URL based on page/product ID
router.get('/redirect/:pageId', affiliationController.getRedirectUrl);

module.exports = router;
