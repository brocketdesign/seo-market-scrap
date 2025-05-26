const Settings = require('../models/Settings');

/**
 * @desc    Get all settings
 * @route   GET /api/settings
 * @access  Private (Admin only)
 */
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Server error while fetching settings' });
  }
};

/**
 * @desc    Update scraper settings
 * @route   PUT /api/settings/scraper
 * @access  Private (Admin only)
 */
const updateScraperSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    const {
      userAgent,
      requestTimeout,
      waitTime,
      useProxy,
      proxyList
    } = req.body;
    
    // Update only the provided fields
    if (userAgent !== undefined) settings.scraperSettings.userAgent = userAgent;
    if (requestTimeout !== undefined) settings.scraperSettings.requestTimeout = requestTimeout;
    if (waitTime !== undefined) settings.scraperSettings.waitTime = waitTime;
    if (useProxy !== undefined) settings.scraperSettings.useProxy = useProxy;
    if (proxyList !== undefined) settings.scraperSettings.proxyList = proxyList;
    
    settings.updatedBy = req.user ? req.user._id : undefined;
    settings.updatedAt = Date.now();
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating scraper settings:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while updating scraper settings' });
  }
};

/**
 * @desc    Update dashboard settings
 * @route   PUT /api/settings/dashboard
 * @access  Private (Admin only)
 */
const updateDashboardSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    const {
      itemsPerPage,
      defaultSorting,
      defaultSortDirection
    } = req.body;
    
    // Update only the provided fields
    if (itemsPerPage !== undefined) settings.dashboardSettings.itemsPerPage = itemsPerPage;
    if (defaultSorting !== undefined) settings.dashboardSettings.defaultSorting = defaultSorting;
    if (defaultSortDirection !== undefined) settings.dashboardSettings.defaultSortDirection = defaultSortDirection;
    
    settings.updatedBy = req.user ? req.user._id : undefined;
    settings.updatedAt = Date.now();
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating dashboard settings:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while updating dashboard settings' });
  }
};

/**
 * @desc    Update notification settings
 * @route   PUT /api/settings/notifications
 * @access  Private (Admin only)
 */
const updateNotificationSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    const {
      enableEmailNotifications,
      notifyOnError,
      notifyOnSuccess,
      emailRecipients
    } = req.body;
    
    // Update only the provided fields
    if (enableEmailNotifications !== undefined) settings.notificationSettings.enableEmailNotifications = enableEmailNotifications;
    if (notifyOnError !== undefined) settings.notificationSettings.notifyOnError = notifyOnError;
    if (notifyOnSuccess !== undefined) settings.notificationSettings.notifyOnSuccess = notifyOnSuccess;
    if (emailRecipients !== undefined) settings.notificationSettings.emailRecipients = emailRecipients;
    
    settings.updatedBy = req.user ? req.user._id : undefined;
    settings.updatedAt = Date.now();
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating notification settings:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while updating notification settings' });
  }
};

/**
 * @desc    Update system settings
 * @route   PUT /api/settings/system
 * @access  Private (Admin only)
 */
const updateSystemSettings = async (req, res) => {
  try {
    let settings = await Settings.getSettings();
    
    const {
      maintenanceMode,
      maxConcurrentJobs,
      dataRetentionDays
    } = req.body;
    
    // Update only the provided fields
    if (maintenanceMode !== undefined) settings.systemSettings.maintenanceMode = maintenanceMode;
    if (maxConcurrentJobs !== undefined) settings.systemSettings.maxConcurrentJobs = maxConcurrentJobs;
    if (dataRetentionDays !== undefined) settings.systemSettings.dataRetentionDays = dataRetentionDays;
    
    settings.updatedBy = req.user ? req.user._id : undefined;
    settings.updatedAt = Date.now();
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating system settings:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while updating system settings' });
  }
};

module.exports = {
  getSettings,
  updateScraperSettings,
  updateDashboardSettings,
  updateNotificationSettings,
  updateSystemSettings
};
