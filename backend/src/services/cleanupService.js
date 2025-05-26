const Settings = require('../models/Settings');
const Product = require('../models/Product');
const { logError } = require('./errorService');
const cron = require('node-cron');

/**
 * CleanupService - Handles data retention and cleanup tasks
 * 
 * Responsible for:
 * 1. Running scheduled cleanup tasks
 * 2. Deleting old products based on retention settings
 * 3. Cleaning up logs from jobs
 */

let cleanupInstance = null;

/**
 * Initialize the cleanup service
 */
function initializeCleanup() {
  if (cleanupInstance) {
    console.log('[CLEANUP] Cleanup service already initialized');
    return;
  }
  
  console.log('[CLEANUP] Initializing cleanup service...');

  // Schedule cleanup to run once per day at 3:00 AM
  cleanupInstance = cron.schedule('0 3 * * *', async () => {
    console.log('[CLEANUP] Running scheduled cleanup tasks');
    await cleanupProducts();
    console.log('[CLEANUP] Scheduled cleanup tasks completed');
  });
  
  console.log('[CLEANUP] Cleanup service initialized successfully');
}

/**
 * Stop the cleanup service
 */
function stopCleanup() {
  if (cleanupInstance) {
    cleanupInstance.stop();
    cleanupInstance = null;
    console.log('[CLEANUP] Cleanup service stopped');
  }
}

/**
 * Delete products older than retention period
 */
async function cleanupProducts() {
  try {
    const settings = await Settings.getSettings();
    const { dataRetentionDays } = settings.systemSettings;
    
    // Calculate cutoff date based on retention period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - dataRetentionDays);
    
    console.log(`[CLEANUP] Deleting products older than ${dataRetentionDays} days (before ${cutoffDate.toISOString()})`);
    
    // Delete products older than the cutoff date
    const result = await Product.deleteMany({
      createdAt: { $lt: cutoffDate }
    });
    
    console.log(`[CLEANUP] Deleted ${result.deletedCount} products`);
    
    return {
      success: true,
      deletedCount: result.deletedCount,
      message: `Deleted ${result.deletedCount} products older than ${dataRetentionDays} days`
    };
  } catch (error) {
    logError(error, 'cleanupProducts');
    return {
      success: false,
      message: `Error cleaning up products: ${error.message}`,
      error
    };
  }
}

/**
 * Manually trigger a cleanup
 */
async function manualCleanup() {
  console.log('[CLEANUP] Running manual cleanup tasks');
  const result = await cleanupProducts();
  console.log('[CLEANUP] Manual cleanup tasks completed');
  return result;
}

module.exports = {
  initializeCleanup,
  stopCleanup,
  manualCleanup
};
