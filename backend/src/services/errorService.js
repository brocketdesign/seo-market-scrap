/**
 * Error Service
 * 
 * Central location for handling and logging errors in the application
 */

// Custom error classes
class ScraperError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = 'ScraperError';
    this.details = details;
    this.timestamp = new Date();
  }
}

class NetworkError extends Error {
  constructor(message, url, details = {}) {
    super(message);
    this.name = 'NetworkError';
    this.url = url;
    this.details = details;
    this.timestamp = new Date();
  }
}

class TimeoutError extends Error {
  constructor(message, timeout, details = {}) {
    super(message);
    this.name = 'TimeoutError';
    this.timeout = timeout;
    this.details = details;
    this.timestamp = new Date();
  }
}

/**
 * Log an error to the console with additional context
 * 
 * @param {Error} error - The error object
 * @param {string} context - Context where the error occurred
 * @param {Object} additionalInfo - Any additional information to include
 */
function logError(error, context = 'General', additionalInfo = {}) {
  const timestamp = new Date().toISOString();
  const errorType = error.name || 'Error';
  
  console.error(`[${timestamp}] [ERROR] [${context}] [${errorType}]: ${error.message}`);
  
  if (error.stack) {
    console.error(`Stack Trace: ${error.stack}`);
  }
  
  if (Object.keys(additionalInfo).length > 0) {
    console.error('Additional Info:', JSON.stringify(additionalInfo, null, 2));
  }
  
  // Here you could add additional error reporting, like sending to a service
  // Or storing in a database, etc.
}

/**
 * Format an error response for API endpoints
 * 
 * @param {Error} error - The error object
 * @param {boolean} includeStack - Whether to include the stack trace (false in production)
 * @returns {Object} Formatted error object
 */
function formatErrorResponse(error, includeStack = process.env.NODE_ENV !== 'production') {
  const response = {
    error: {
      message: error.message || 'An unexpected error occurred',
      type: error.name || 'Error',
      ...(error.details && { details: error.details }),
      ...(error.url && { url: error.url }),
      ...(error.timeout && { timeout: error.timeout }),
    }
  };
  
  if (includeStack && error.stack) {
    response.error.stack = error.stack;
  }
  
  return response;
}

module.exports = {
  ScraperError,
  NetworkError,
  TimeoutError,
  logError,
  formatErrorResponse
};
