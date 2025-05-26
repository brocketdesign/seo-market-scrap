const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SettingsSchema = new Schema({
  scraperSettings: {
    userAgent: {
      type: String,
      default: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
      description: 'Browser User Agent for scraping'
    },
    requestTimeout: {
      type: Number, 
      default: 30000,
      description: 'Timeout for page requests in milliseconds'
    },
    waitTime: {
      type: Number,
      default: 2000,
      description: 'Wait time between requests in milliseconds'
    },
    useProxy: {
      type: Boolean,
      default: false,
      description: 'Whether to use proxy servers for scraping'
    },
    proxyList: {
      type: [String],
      default: [],
      description: 'List of proxy servers to use when useProxy is true'
    }
  },
  dashboardSettings: {
    itemsPerPage: {
      type: Number,
      default: 20,
      description: 'Number of items to show per page in listings'
    },
    defaultSorting: {
      type: String,
      enum: ['createdAt', 'updatedAt', 'title', 'price'],
      default: 'createdAt',
      description: 'Default sorting field for product listings'
    },
    defaultSortDirection: {
      type: String,
      enum: ['asc', 'desc'],
      default: 'desc',
      description: 'Default sorting direction for product listings'
    }
  },
  notificationSettings: {
    enableEmailNotifications: {
      type: Boolean,
      default: false,
      description: 'Enable email notifications'
    },
    notifyOnError: {
      type: Boolean,
      default: true,
      description: 'Send notification on scraping errors'
    },
    notifyOnSuccess: {
      type: Boolean,
      default: false,
      description: 'Send notification on successful scraping jobs'
    },
    emailRecipients: {
      type: [String],
      default: [],
      description: 'List of email recipients for notifications'
    }
  },
  systemSettings: {
    maintenanceMode: {
      type: Boolean,
      default: false,
      description: 'Enable maintenance mode'
    },
    maxConcurrentJobs: {
      type: Number,
      default: 3,
      description: 'Maximum number of concurrent scraping jobs'
    },
    dataRetentionDays: {
      type: Number,
      default: 90,
      description: 'Number of days to retain scraped data'
    }
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'AdminUser'
  }
}, { 
  timestamps: true,
  // Ensure there's only one settings document
  collection: 'settings'
});

// Create a singleton pattern for settings
SettingsSchema.statics.getSettings = async function() {
  const settings = await this.findOne();
  if (settings) {
    return settings;
  }
  
  // Create default settings if none exist
  const defaultSettings = new this();
  return defaultSettings.save();
};

module.exports = mongoose.model('Settings', SettingsSchema);
