const CronJob = require('../models/CronJob');
const { scrapeProductData } = require('./scraperService');
const Product = require('../models/Product');
const cron = require('node-cron');
const parser = require('cron-parser');

/**
 * Scheduler service for handling cron jobs
 * 
 * This service is responsible for:
 * 1. Initializing the scheduler when the server starts
 * 2. Running a background scheduler that checks for jobs to run
 * 3. Executing cron jobs when they're due
 * 4. Updating job status and logs
 */

let schedulerInstance = null;

/**
 * Execute a single cron job
 * @param {Object} cronJob - The cron job to execute
 * @returns {Promise<Object>} - Result of the job execution
 */
async function executeJob(cronJob) {
  if (!cronJob.isActive) {
    console.log(`[SCHEDULER] Job ${cronJob._id} (${cronJob.name}) is inactive. Skipping.`);
    return { status: 'skipped', message: 'Job is inactive' };
  }

  console.log(`[SCHEDULER] Executing job ${cronJob._id} (${cronJob.name})`);

  // Update job status to running
  cronJob.status = 'running';
  await cronJob.save();

  const startTime = Date.now();
  let status = 'success';
  let message = '';
  let itemsScraped = 0;
  
  try {
    // Execute the scraping based on job type
    let result = [];
    
    if (cronJob.type === 'keyword') {
      result = await scrapeProductData(cronJob.keyword, cronJob.source.toLowerCase());
    } else if (cronJob.type === 'url') {
      result = await scrapeProductData(cronJob.url, cronJob.source.toLowerCase());
    } else {
      throw new Error(`Unsupported job type: ${cronJob.type}`);
    }
    
    // Save scraped products to database
    const savedProducts = [];
    for (const product of result) {
      const existingProduct = await Product.findOne({ 
        sourceUrl: product.sourceUrl, 
        source: product.source 
      });
      
      if (!existingProduct) {
        // Add SEO fields if not present
        const productToSave = {
          ...product,
          seoTitle: product.seoTitle || product.title,
          seoDescription: product.seoDescription || product.description?.substring(0, 160) || '',
          seoKeywords: product.seoKeywords || product.title.split(' '),
        };
        
        const newProduct = new Product(productToSave);
        const saved = await newProduct.save();
        savedProducts.push(saved);
      }
    }
    
    itemsScraped = savedProducts.length;
    message = `Successfully scraped ${itemsScraped} products`;
    
  } catch (error) {
    console.error(`[SCHEDULER] Error executing job ${cronJob._id} (${cronJob.name}):`, error);
    status = 'failed';
    message = error.message || 'Unknown error during execution';
  }
  
  // Update job with results
  const endTime = Date.now();
  cronJob.lastRunAt = new Date();
  cronJob.nextRunAt = calculateNextRunTime(cronJob.schedule);
  cronJob.status = status === 'success' ? 'success' : 'failed';
  
  // Add log entry
  cronJob.logs.push({
    runAt: new Date(),
    status,
    message,
    durationMs: endTime - startTime,
    itemsScraped
  });
  
  // Trim logs if they get too long (keep last 50)
  if (cronJob.logs.length > 50) {
    cronJob.logs = cronJob.logs.slice(-50);
  }
  
  await cronJob.save();
  
  return {
    status,
    message,
    itemsScraped,
    durationMs: endTime - startTime
  };
}

/**
 * Calculate the next run time for a cron expression
 * @param {string} cronExpression - Cron expression (e.g. "0 * * * *")
 * @returns {Date} - Next run time
 */
function calculateNextRunTime(cronExpression) {
  try {
    // Use cron-parser to calculate the next run time
    const interval = parser.parseExpression(cronExpression);
    return interval.next().toDate();
  } catch (error) {
    console.error(`[SCHEDULER] Error calculating next run time: ${error.message}`);
    // Return a fallback time (24 hours from now)
    return new Date(Date.now() + 24 * 60 * 60 * 1000);
  }
}

/**
 * Check for jobs that need to be run
 * @returns {Promise<void>}
 */
async function checkForDueJobs() {
  try {
    const now = new Date();
    
    // Find active jobs that are due to run
    const dueJobs = await CronJob.find({
      isActive: true,
      nextRunAt: { $lte: now },
      status: { $ne: 'running' } // Avoid running jobs that are already running
    }).sort({ nextRunAt: 1 });
    
    if (dueJobs.length > 0) {
      console.log(`[SCHEDULER] Found ${dueJobs.length} jobs to run`);
    
      // Process each job
      for (const job of dueJobs) {
        await executeJob(job);
      }
    }
    
  } catch (error) {
    console.error(`[SCHEDULER] Error checking for due jobs: ${error.message}`);
  }
}

/**
 * Initialize the scheduler service
 */
function initializeScheduler() {
  if (schedulerInstance) {
    console.log('[SCHEDULER] Scheduler already initialized');
    return;
  }
  
  console.log('[SCHEDULER] Initializing scheduler service...');

  // Schedule recurring check every minute
  schedulerInstance = cron.schedule('* * * * *', async () => {
    await checkForDueJobs();
  });

  // Update next run time for all active jobs on startup
  updateAllNextRunTimes();
  
  console.log('[SCHEDULER] Scheduler service initialized successfully');
}

/**
 * Stop the scheduler service
 */
function stopScheduler() {
  if (schedulerInstance) {
    schedulerInstance.stop();
    schedulerInstance = null;
    console.log('[SCHEDULER] Scheduler service stopped');
  }
}

/**
 * Update the next run time for all active jobs
 */
async function updateAllNextRunTimes() {
  try {
    const activeJobs = await CronJob.find({ isActive: true });
    
    for (const job of activeJobs) {
      // If nextRunAt is in the past or doesn't exist, update it
      if (!job.nextRunAt || job.nextRunAt < new Date()) {
        job.nextRunAt = calculateNextRunTime(job.schedule);
        await job.save();
      }
    }
    
    console.log(`[SCHEDULER] Updated next run times for ${activeJobs.length} active jobs`);
  } catch (error) {
    console.error(`[SCHEDULER] Error updating next run times: ${error.message}`);
  }
}

/**
 * Manually trigger a job to run
 * @param {string} jobId - ID of the job to run
 * @returns {Promise<Object>} - Result of the job execution
 */
async function triggerJobManually(jobId) {
  try {
    const job = await CronJob.findById(jobId);
    
    if (!job) {
      throw new Error('Job not found');
    }
    
    return await executeJob(job);
  } catch (error) {
    console.error(`[SCHEDULER] Error triggering job manually: ${error.message}`);
    throw error;
  }
}

module.exports = {
  initializeScheduler,
  stopScheduler,
  triggerJobManually,
  calculateNextRunTime
};
