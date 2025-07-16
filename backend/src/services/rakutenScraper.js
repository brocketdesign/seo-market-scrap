const puppeteer = require('puppeteer');
const Settings = require('../models/Settings');
const { ScraperError, NetworkError, TimeoutError, logError } = require('./errorService');

const SCRAPER_VERSION = '1.2'; // Updated selectors and added debug logs

async function scrapeRakuten(keywordOrUrl, browserConfig) {
  console.log(`[SCRAPER v${SCRAPER_VERSION}] scrapeRakuten - Scraping Rakuten for: ${keywordOrUrl}`);
  
  // Enhanced browser configuration with system Chrome fallback
  const enhancedBrowserConfig = {
    ...browserConfig,
    // Try to use system Chrome first
    executablePath: process.env.CHROME_PATH || 
                   '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' || // macOS
                   '/usr/bin/google-chrome' || // Linux
                   'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe' || // Windows
                   undefined,
    args: [
      ...(browserConfig.args || []),
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-web-security',
      '--disable-features=VizDisplayCompositor',
      '--lang=ja-JP',
      '--accept-lang=ja-JP,ja;q=0.9'
    ]
  };

  // If executablePath is not found, remove it to let Puppeteer auto-detect
  if (!enhancedBrowserConfig.executablePath) {
    delete enhancedBrowserConfig.executablePath;
  }

  // Launch browser with enhanced config
  let browser;
  try {
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Launching browser with enhanced config:`, enhancedBrowserConfig);
    browser = await puppeteer.launch(enhancedBrowserConfig);
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Browser launched successfully.`);
  } catch (error) {
    console.log(`[SCRAPER v${SCRAPER_VERSION}][scrapeRakuten] Failed to launch with custom config, trying default: ${error.message}`);
    // Fallback to basic configuration
    try {
      console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Launching browser with default config.`);
      browser = await puppeteer.launch({
        headless: browserConfig.headless !== false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--lang=ja-JP'
        ]
      });
      console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Browser launched successfully with default config.`);
    } catch (err) {
      console.error(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Failed to launch browser with default config:', err.message`);
      throw err; // Re-throw the error to prevent further execution
    }
  }
  
  try {
    const page = await browser.newPage();
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] New page created.`);
    
    // Set viewport and user agent
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Viewport set.`);
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36');
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] User agent set.`);
    
    // Set language preferences for Japanese content
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
    });
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] HTTP headers set.`);

    const isUrl = keywordOrUrl.startsWith('http://') || keywordOrUrl.startsWith('https://');
    
    let searchUrl;
    if (isUrl && (keywordOrUrl.includes('rakuten.co.jp') || keywordOrUrl.includes('rakuten.com'))) {
      // If it's a keyword, search on Rakuten
      const urlParams = new URL(keywordOrUrl).searchParams;
      const searchTerm = urlParams.get('s') || urlParams.get('keyword') || 'products';
      searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(searchTerm)}/`;
    } else if (isUrl) {
      // If it's a non-Rakuten URL, can't process
      throw new ScraperError('Only Rakuten URLs or keywords are supported');
    } else {
      // If it's a keyword, search on Rakuten
      searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keywordOrUrl)}/`;
    }

    console.log(`[SCRAPER v${SCRAPER_VERSION}] scrapeRakuten - Navigating to search URL: ${searchUrl}`);
    try {
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Navigated to URL: ${searchUrl}`);
    } catch (gotoError) {
      console.error(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Error navigating to URL: ${searchUrl}`, gotoError.message);
      throw gotoError;
    }
    
    // Wait for search results to load - try multiple selectors
    try {
      console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Waiting for search results selectors.`);
      await page.waitForSelector('.searchresultitem, .dui-card', { timeout: 15000 })
        .then(() => console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Search results selectors found.`))
        .catch(() => console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Search results selectors not found, proceeding anyway`));
    } catch (waitError) {
      console.warn(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Error waiting for selectors:', waitError.message`);
    }
    
    // Add a small delay to ensure content is fully loaded
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Delay completed.`);
    
    // Extract product information from search results
    let products = [];
    try {
      products = await page.evaluate((version) => {
        const productList = [];
        
        // Try multiple selector strategies for Rakuten search results
        const productContainers = document.querySelectorAll('.searchresultitem, .dui-card');
        
        console.log(`[page.evaluate v${version}] Found ${productContainers.length} potential product containers`);
        
        productContainers.forEach((container, index) => {
          if (index > 20) return; // Limit to first 5 products

          try {
            console.log(`[page.evaluate v${version}] Processing container ${index}`);
            
            // Look for title/link - prioritize elements with "item" in the href
            let titleElement = container.querySelector('a[href*="item.rakuten.co.jp"] h2') ||
                               container.querySelector('a[href*="item.rakuten.co.jp"] .title') ||
                               container.querySelector('a[href*="/item/"] h2') ||
                               container.querySelector('a[href*="/item/"] .title') ||
                               container.querySelector('h2 a') || 
                               container.querySelector('.title a');
            
            if (!titleElement) {
              console.log(`[page.evaluate v${version}] No title element found for container ${index}`);
              return;
            }
            
            const productUrl = titleElement.closest('a').href;
            const title = titleElement.textContent.trim() || titleElement.title || '';
            
            if (!title) {
              console.log(`[page.evaluate v${version}] No title text found for container ${index}`);
              return;
            }
            
            // Get price - look for price indicators
            let price = '';
            const priceSelectors = [
              '.price',
              '[data-testid*="price"]',
              '.important',
              '[class*="price"]',
              '.priceValue',
              '.searchResultPrice'
            ];
            
            for (const selector of priceSelectors) {
              const priceElement = container.querySelector(selector);
              if (priceElement) {
                price = priceElement.textContent.trim();
                if (price && (price.includes('円') || price.match(/\d+/))) {
                  break;
                }
              }
            }
            
            // Get image
            const images = [];
            const imgElement = container.querySelector('img');
            if (imgElement && imgElement.src && 
                !imgElement.src.includes('transparent') && 
                !imgElement.src.includes('pixel') &&
                !imgElement.src.includes('icon') &&
                !imgElement.src.includes('1x1')) {
              
              let fullSizeUrl = imgElement.src;
              // Try to get larger version by removing size constraints
              fullSizeUrl = fullSizeUrl.replace(/\?_ex=\d+x\d+/, '').replace(/@\d+x\d+/, '');
              images.push(fullSizeUrl);
            }
            
            // Get rating information
            let ratingScore = 0;
            let ratingCount = 0;
            
            // Look for rating elements - check for star ratings or numeric ratings
            const ratingText = container.textContent;
            const ratingMatch = ratingText.match(/(\d+\.?\d*)\s*\((\d+)件\)/);
            if (ratingMatch) {
              ratingScore = parseFloat(ratingMatch[1]);
              ratingCount = parseInt(ratingMatch[2]);
            } else {
              // Try alternative rating patterns
              const starMatch = ratingText.match(/★+|☆+/);
              if (starMatch) {
                ratingScore = starMatch[0].length;
              }
              
              const reviewMatch = ratingText.match(/(\d+)件/);
              if (reviewMatch) {
                ratingCount = parseInt(reviewMatch[1]);
              }
            }
            
            // Get shop/seller info
            let shop = '';
            const shopSelectors = [
              '.merchant',
              '.shop',
              '[class*="shop"]',
              '[data-testid*="shop"]'
            ];
            
            for (const selector of shopSelectors) {
              const shopElement = container.querySelector(selector);
              if (shopElement) {
                shop = shopElement.textContent.trim();
                if (shop) break;
              }
            }
            
            // Get shipping info
            let shipping = '';
            const shippingText = container.textContent;
            if (shippingText.includes('送料無料')) {
              shipping = '送料無料';
            } else if (shippingText.includes('送料')) {
              const shippingMatch = shippingText.match(/送料[^\s]*/);
              if (shippingMatch) {
                shipping = shippingMatch[0];
              }
            }
            
            // Get points info
            let points = '';
            const pointsMatch = container.textContent.match(/(\d+)ポイント/);
            if (pointsMatch) {
              points = pointsMatch[0];
            }
            
            console.log(`Extracted product: ${title.substring(0, 50)}...`);
            
            productList.push({
              title: title.substring(0, 200), // Limit title length
              price: price.replace(/[^\d,円]/g, '') || '価格不明',
              description: '', // Not available on search page
              images,
              ratings: { 
                score: ratingScore, 
                count: ratingCount 
              },
              shop,
              shipping,
              points,
              category: 'General', // Category not usually available on search page
              tags: [],
              contentLanguage: 'japanese',
              source: 'rakuten',
              sourceUrl: productUrl
            });
          } catch (error) {
            console.log(`Error processing container ${index}:`, error.message);
          }
        });
        
        return productList;
      }, SCRAPER_VERSION);
    } catch (evaluateError) {
      console.error(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Error during page.evaluate:', evaluateError.message`);
      throw evaluateError;
    }
    
    console.log(`[SCRAPER v${SCRAPER_VERSION}] scrapeRakuten - Found ${products.length} products from search results`);
    
    await browser.close();
    console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Browser closed.`);
    return products;
    
  } catch (error) {
    logError(error, 'scrapeRakuten', { keywordOrUrl });
    
    try {
      await browser.close();
      console.log(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Browser closed after error.`);
    } catch (closeError) {
      console.error(`[SCRAPER v${SCRAPER_VERSION}][DEBUG][scrapeRakuten] Error closing browser: ${closeError.message}`);
    }
    
    if (error.name === 'TimeoutError') {
      throw new TimeoutError(`Timeout while scraping Rakuten: ${error.message}`, 30000, { keywordOrUrl });
    } else if (error.message.includes('net::ERR')) {
      throw new NetworkError(`Network error while scraping Rakuten: ${error.message}`, keywordOrUrl);
    } else {
      throw new ScraperError(`Error scraping Rakuten: ${error.message}`, { keywordOrUrl });
    }
  }
}

module.exports = {
  scrapeRakuten
};