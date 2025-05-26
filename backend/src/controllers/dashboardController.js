const Product = require('../models/Product');
const CronJob = require('../models/CronJob');

// @desc    Get admin dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = async (req, res) => {
  try {
    // Get product stats
    const totalProducts = await Product.countDocuments();
    const amazonProducts = await Product.countDocuments({ source: 'amazon' });
    const rakutenProducts = await Product.countDocuments({ source: 'rakuten' });
    const otherProducts = totalProducts - amazonProducts - rakutenProducts;
    
    // Get recently added products (last 7 days)
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const recentlyAdded = await Product.countDocuments({ scrapedAt: { $gte: oneWeekAgo } });

    // Get most recent products
    const recentProducts = await Product.find()
      .sort({ scrapedAt: -1 })
      .limit(5)
      .select('title source scrapedAt images');
    
    // Get cron job stats
    const totalJobs = await CronJob.countDocuments();
    const activeJobs = await CronJob.countDocuments({ isActive: true });
    const scheduledJobs = await CronJob.countDocuments({ 
      isActive: true,
      nextRunAt: { $gt: new Date() }
    });
    const failedJobs = await CronJob.countDocuments({ status: 'failed' });
    
    // Get upcoming scheduled jobs
    const upcomingJobs = await CronJob.find({ 
      isActive: true,
      nextRunAt: { $gt: new Date() }
    })
    .sort({ nextRunAt: 1 })
    .limit(5);
    
    // Get most recently executed jobs
    const recentJobs = await CronJob.find()
      .sort({ lastRunAt: -1 })
      .limit(5);
    
    res.json({
      products: {
        total: totalProducts,
        amazon: amazonProducts,
        rakuten: rakutenProducts,
        other: otherProducts,
        recentlyAdded,
        recentProducts
      },
      cronJobs: {
        total: totalJobs,
        active: activeJobs,
        scheduled: scheduledJobs,
        failed: failedJobs,
        upcomingJobs,
        recentJobs
      }
    });
    
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Server error while fetching dashboard statistics.' });
  }
};

module.exports = {
  getDashboardStats
};
