const CronJob = require('../models/CronJob');
const { scrapeProductData } = require('../services/scraperService');
const Product = require('../models/Product');
const { calculateNextRunTime, triggerJobManually } = require('../services/schedulerService');

// @desc    Get all cron jobs
// @route   GET /api/cron-jobs
// @access  Private (Admin only)
const getCronJobs = async (req, res) => {
  try {
    const cronJobs = await CronJob.find().sort({ createdAt: -1 });
    res.json(cronJobs);
  } catch (error) {
    console.error('Error fetching cron jobs:', error);
    res.status(500).json({ message: 'Server error while fetching cron jobs.' });
  }
};

// @desc    Get a single cron job
// @route   GET /api/cron-jobs/:id
// @access  Private (Admin only)
const getCronJobById = async (req, res) => {
  try {
    const cronJob = await CronJob.findById(req.params.id);
    
    if (!cronJob) {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    res.json(cronJob);
  } catch (error) {
    console.error('Error fetching cron job:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching cron job.' });
  }
};

// @desc    Create a new cron job
// @route   POST /api/cron-jobs
// @access  Private (Admin only)
const createCronJob = async (req, res) => {
  const {
    name,
    keyword,
    url,
    type,
    source,
    schedule,
    isActive
  } = req.body;

  // Validation
  if (!name || !schedule || !source || !type) {
    return res.status(400).json({ 
      message: 'Please provide all required fields: name, schedule, source, and type' 
    });
  }

  if (type === 'keyword' && !keyword) {
    return res.status(400).json({ message: 'Keyword is required for keyword-type jobs' });
  }

  if (type === 'url' && !url) {
    return res.status(400).json({ message: 'URL is required for URL-type jobs' });
  }

  try {
    // Check for duplicate job
    const existingJob = await CronJob.findOne({
      $and: [
        { source },
        { $or: [
          { name: name.trim() },
          ...(keyword ? [{ keyword: keyword.trim(), type: 'keyword' }] : []),
          ...(url ? [{ url: url.trim(), type: 'url' }] : [])
        ]}
      ]
    });

    if (existingJob) {
      return res.status(409).json({ 
        message: 'A similar cron job already exists',
        existingJob 
      });
    }

    // Calculate next run time based on cron schedule
    const nextRunAt = calculateNextRunTime(schedule);

    // Create new job
    const newCronJob = new CronJob({
      name,
      keyword: keyword || undefined,
      url: url || undefined,
      type,
      source,
      schedule,
      isActive: isActive !== undefined ? isActive : true,
      nextRunAt,
      createdBy: req.user ? req.user._id : undefined
    });

    const savedJob = await newCronJob.save();
    res.status(201).json(savedJob);

  } catch (error) {
    console.error('Error creating cron job:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while creating cron job.' });
  }
};

// @desc    Update a cron job
// @route   PUT /api/cron-jobs/:id
// @access  Private (Admin only)
const updateCronJob = async (req, res) => {
  const {
    name,
    keyword,
    url,
    type,
    source,
    schedule,
    isActive
  } = req.body;

  try {
    let cronJob = await CronJob.findById(req.params.id);
    
    if (!cronJob) {
      return res.status(404).json({ message: 'Cron job not found' });
    }

    // Update fields
    if (name) cronJob.name = name;
    if (keyword) cronJob.keyword = keyword;
    if (url) cronJob.url = url;
    if (type) cronJob.type = type;
    if (source) cronJob.source = source;
    if (schedule) {
      cronJob.schedule = schedule;
      cronJob.nextRunAt = calculateNextRunTime(schedule);
    }
    if (isActive !== undefined) cronJob.isActive = isActive;

    // Validate the job type-specific fields
    if (cronJob.type === 'keyword' && !cronJob.keyword) {
      return res.status(400).json({ message: 'Keyword is required for keyword-type jobs' });
    }

    if (cronJob.type === 'url' && !cronJob.url) {
      return res.status(400).json({ message: 'URL is required for URL-type jobs' });
    }

    const updatedJob = await cronJob.save();
    res.json(updatedJob);

  } catch (error) {
    console.error('Error updating cron job:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while updating cron job.' });
  }
};

// @desc    Toggle cron job active status
// @route   PATCH /api/cron-jobs/:id/toggle
// @access  Private (Admin only)
const toggleCronJobStatus = async (req, res) => {
  try {
    const cronJob = await CronJob.findById(req.params.id);
    
    if (!cronJob) {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    // Toggle the isActive status
    cronJob.isActive = !cronJob.isActive;
    
    // If being activated, update the next run time
    if (cronJob.isActive) {
      cronJob.nextRunAt = calculateNextRunTime(cronJob.schedule);
      cronJob.status = 'idle';
    } else {
      // If being deactivated, update the status
      cronJob.status = 'disabled';
    }
    
    const updatedJob = await cronJob.save();
    res.json(updatedJob);
    
  } catch (error) {
    console.error('Error toggling cron job status:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    res.status(500).json({ message: 'Server error while toggling cron job status.' });
  }
};

// @desc    Delete a cron job
// @route   DELETE /api/cron-jobs/:id
// @access  Private (Admin only)
const deleteCronJob = async (req, res) => {
  try {
    const cronJob = await CronJob.findById(req.params.id);
    
    if (!cronJob) {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    await cronJob.deleteOne();
    res.json({ message: 'Cron job removed' });
    
  } catch (error) {
    console.error('Error deleting cron job:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    res.status(500).json({ message: 'Server error while deleting cron job.' });
  }
};

// @desc    Manually run a cron job now
// @route   POST /api/cron-jobs/:id/run
// @access  Private (Admin only)
const runCronJobNow = async (req, res) => {
  try {
    // Find the cron job
    const cronJob = await CronJob.findById(req.params.id);
    
    if (!cronJob) {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    // Use the scheduler service to run the job
    const result = await triggerJobManually(req.params.id);
    
    // Fetch the updated job to get the latest logs and status
    const updatedJob = await CronJob.findById(req.params.id);
    
    // Return the result to the client
    if (result.status === 'success') {
      res.json({ 
        message: 'Cron job executed successfully',
        productsScraped: result.itemsScraped,
        job: updatedJob
      });
    } else {
      res.status(500).json({ 
        message: 'Error executing cron job',
        error: result.message,
        job: updatedJob
      });
    }
    
  } catch (error) {
    console.error('Error processing run job request:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Cron job not found' });
    }
    
    res.status(500).json({ message: 'Server error while processing job execution.' });
  }
};

// We now use the calculateNextRunTime function from schedulerService

module.exports = {
  getCronJobs,
  getCronJobById,
  createCronJob,
  updateCronJob,
  toggleCronJobStatus,
  deleteCronJob,
  runCronJobNow
};
