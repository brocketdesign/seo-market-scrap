const express = require('express');
const router = express.Router();
const {
  getCronJobs,
  getCronJobById,
  createCronJob,
  updateCronJob,
  toggleCronJobStatus,
  deleteCronJob,
  runCronJobNow
} = require('../controllers/cronJobController');
const { protect } = require('../middlewares/authMiddleware'); // Middleware to protect routes

// All routes are protected with admin authentication
router.use(protect);

// @route   GET /api/cron-jobs
// @desc    Get all cron jobs
// @access  Private (Admin only)
router.get('/', getCronJobs);

// @route   GET /api/cron-jobs/:id
// @desc    Get a single cron job by ID
// @access  Private (Admin only)
router.get('/:id', getCronJobById);

// @route   POST /api/cron-jobs
// @desc    Create a new cron job
// @access  Private (Admin only)
router.post('/', createCronJob);

// @route   PUT /api/cron-jobs/:id
// @desc    Update a cron job
// @access  Private (Admin only)
router.put('/:id', updateCronJob);

// @route   PATCH /api/cron-jobs/:id/toggle
// @desc    Toggle a cron job's active status
// @access  Private (Admin only)
router.patch('/:id/toggle', toggleCronJobStatus);

// @route   DELETE /api/cron-jobs/:id
// @desc    Delete a cron job
// @access  Private (Admin only)
router.delete('/:id', deleteCronJob);

// @route   POST /api/cron-jobs/:id/run
// @desc    Manually run a cron job immediately
// @access  Private (Admin only)
router.post('/:id/run', runCronJobNow);

module.exports = router;
