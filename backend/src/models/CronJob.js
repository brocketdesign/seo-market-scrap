const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CronJobSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    description: 'A descriptive name for the cron job (e.g., \"Scrape Daily Deals - Amazon\")',
  },
  keyword: {
    type: String,
    required: function() { return this.type === 'keyword'; }, // Required if type is keyword
    trim: true,
    description: 'The keyword to scrape (if type is keyword)',
  },
  url: {
    type: String,
    required: function() { return this.type === 'url'; }, // Required if type is URL
    trim: true,
    description: 'The specific product/category URL to scrape (if type is URL)',
  },
  type: {
    type: String,
    enum: ['keyword', 'url', 'sitemap'], // Type of scraping task
    required: true,
    default: 'keyword',
  },
  source: {
    type: String,
    enum: ['Amazon', 'Rakuten', 'Generic'], // Source marketplace
    required: true,
  },
  schedule: {
    type: String,
    required: true,
    trim: true,
    description: 'Cron expression for the job (e.g., \"0 0 * * *\" for daily at midnight)',
    // Add validation for cron expression format if needed
  },
  isActive: {
    type: Boolean,
    default: true,
    description: 'Whether the cron job is currently active and should run',
  },
  lastRunAt: {
    type: Date,
    description: 'Timestamp of the last time the job was executed',
  },
  nextRunAt: {
    type: Date,
    description: 'Timestamp for the next scheduled execution (can be calculated by the job scheduler)',
  },
  status: {
    type: String,
    enum: ['idle', 'running', 'success', 'failed', 'disabled'],
    default: 'idle',
    description: 'Current status of the cron job',
  },
  logs: [
    {
      runAt: { type: Date, default: Date.now },
      status: { type: String, enum: ['success', 'failed', 'partial_success'] },
      message: String,
      durationMs: Number, // Duration of the scrape job in milliseconds
      itemsScraped: Number, // Number of items successfully scraped
    },
  ],
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser',
    // required: true, // Decide if this is strictly required
    description: 'Admin user who created this cron job',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update `updatedAt` timestamp before saving
CronJobSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

CronJobSchema.index({ isActive: 1, nextRunAt: 1 }); // For querying active jobs to run
CronJobSchema.index({ keyword: 1, source: 1 });
CronJobSchema.index({ type: 1, source: 1 });

module.exports = mongoose.model('CronJob', CronJobSchema);
