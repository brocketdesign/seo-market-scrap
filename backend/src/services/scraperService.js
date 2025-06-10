const Settings = require('../models/Settings');
const { ScraperError, logError } = require('./errorService');
const { scrapeAmazon } = require('./amazonScraper');
const { scrapeRakuten } = require('./rakutenScraper');

async function scrapeProductData(keywordOrUrl, source) {
  if (!keywordOrUrl) {
    throw new ScraperError('No keyword or URL provided for scraping');
  }

  let results = [];
  const isUrl = keywordOrUrl.startsWith('http://') || keywordOrUrl.startsWith('https://');

  try {
    // Get settings and browser configuration
    const settings = await Settings.getSettings();
    const { scraperSettings } = settings;
    const browserConfig = await getBrowserConfig();
    
    // Apply wait time between scraping operations
    const waitTime = scraperSettings?.waitTime || 2000;
    
    if (source === 'amazon' || source === 'all') {
      console.log(`[SCRAPER] Starting Amazon scraping for: ${keywordOrUrl}`);
      const amazonResults = await scrapeAmazon(keywordOrUrl, browserConfig);
      results = results.concat(amazonResults);
      
      // Wait between scraping operations if multiple sources
      if (source === 'all' && waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    if (source === 'rakuten' || source === 'all') {
      console.log(`[SCRAPER] Starting Rakuten scraping for: ${keywordOrUrl}`);
      const rakutenResults = await scrapeRakuten(keywordOrUrl, browserConfig);
      results = results.concat(rakutenResults);
    }
    
    console.log(`[SCRAPER] Completed scraping. Found ${results.length} products.`);
    return results;
  } catch (error) {
    logError(error, 'scrapeProductData', { keywordOrUrl, source });
    throw new ScraperError(`Error scraping data: ${error.message}`, {
      source,
      keywordOrUrl,
      originalError: error.message
    });
  }
}

/**
 * Get browser configuration from settings
 * @returns {Promise<Object>} Browser launch options based on settings
 */
async function getBrowserConfig() {
  try {
    // Get settings from database
    const settings = await Settings.getSettings();
    const { scraperSettings } = settings;

    // Default config: use headless true for best compatibility
    const config = {
      headless: true,
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certificate-errors',
        '--ignore-certificate-errors-skip-list',
        '--disable-features=IsolateOrigins,site-per-process',
        '--disable-blink-features=AutomationControlled',
        `--window-size=1920,1080`,
      ],
      defaultViewport: {
        width: 1920,
        height: 1080,
      },
    };

    // Add user agent if specified in settings
    if (scraperSettings?.userAgent) {
      config.args.push(`--user-agent=${scraperSettings.userAgent}`);
    }

    // Add proxy if enabled in settings
    if (scraperSettings?.useProxy && Array.isArray(scraperSettings.proxyList) && scraperSettings.proxyList.length > 0) {
      // Select a random proxy from the list
      const randomProxy = scraperSettings.proxyList[Math.floor(Math.random() * scraperSettings.proxyList.length)];
      if (randomProxy) {
        config.args.push(`--proxy-server=${randomProxy}`);
      }
    }

    // Only set executablePath if explicitly configured in settings
    if (scraperSettings?.executablePath) {
      config.executablePath = scraperSettings.executablePath;
    }
    
    // Try to handle missing Chrome issue by checking if we should use puppeteer instead of puppeteer-core
    // This setting would override the need to find Chrome locally
    config.product = 'chrome';
    
    // Add a special flag to ignore Chromium installation problems
    process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'true';
    
    // Use pre-installed Chrome or the one from the settings
    if (!config.executablePath) {
      // Try common Chrome paths based on OS
      const os = require('os');
      const platform = os.platform();
      
      if (platform === 'darwin') { // macOS
        const possiblePaths = [
          '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
          '/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary',
          '/Applications/Chromium.app/Contents/MacOS/Chromium'
        ];
        
        for (const path of possiblePaths) {
          if (require('fs').existsSync(path)) {
            config.executablePath = path;
            break;
          }
        }
      } else if (platform === 'win32') { // Windows
        const possiblePaths = [
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
        ];
        
        for (const path of possiblePaths) {
          if (require('fs').existsSync(path)) {
            config.executablePath = path;
            break;
          }
        }
      } else { // Linux
        const possiblePaths = [
          '/usr/bin/google-chrome',
          '/usr/bin/chromium-browser',
          '/usr/bin/chromium'
        ];
        
        for (const path of possiblePaths) {
          if (require('fs').existsSync(path)) {
            config.executablePath = path;
            break;
          }
        }
      }
    }
    
    // If we still don't have a path, try to install Chrome
    if (!config.executablePath) {
      console.log('[SCRAPER] Chrome not found. Attempting alternative approaches...');
      
      try {
        // Try to install Chrome via puppeteer's CLI
        const { execSync } = require('child_process');
        console.log('[SCRAPER] Attempting to install Chrome via puppeteer...');
        execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
        console.log('[SCRAPER] Chrome installation completed');
        
        // Use installed Chrome
        config.channel = 'chrome';
        delete config.executablePath; // Let puppeteer find the Chrome we just installed
      } catch (installError) {
        console.log(`[SCRAPER] Chrome installation failed: ${installError.message}`);
        console.log('[SCRAPER] Will try to use bundled version');
        
        // Force puppeteer to download and use its bundled Chrome
        process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = 'false';
        delete process.env.PUPPETEER_SKIP_DOWNLOAD;
        
        // Remove executablePath to use bundled browser
        delete config.executablePath;
        
        // Use chrome channel which is more stable
        config.channel = 'chrome';
        config.product = 'chrome';
      }
    } else {
      console.log(`[SCRAPER] Using Chrome at: ${config.executablePath}`);
    }

    return config;
  } catch (error) {
    logError(error, 'getBrowserConfig');
    // Return fallback config if there's an issue
    return {
      headless: true,
      ignoreDefaultArgs: ['--disable-extensions'],
      args: [
        '--disable-setuid-sandbox',
        '--no-sandbox',
        '--disable-dev-shm-usage',
      ]
    };
  }
}

module.exports = {
  scrapeProductData,
  getBrowserConfig
};
