const puppeteer = require('puppeteer');
const Settings = require('../models/Settings');
const { ScraperError, NetworkError, TimeoutError, logError } = require('./errorService');

async function scrapeRakuten(keywordOrUrl, browserConfig) {
  console.log(`[SCRAPER] Scraping Rakuten for: ${keywordOrUrl}`);
  
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
    browser = await puppeteer.launch(enhancedBrowserConfig);
  } catch (error) {
    console.log(`[SCRAPER] Failed to launch with custom config, trying default: ${error.message}`);
    // Fallback to basic configuration
    browser = await puppeteer.launch({
      headless: browserConfig.headless !== false,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--lang=ja-JP'
      ]
    });
  }
  
  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36');
    
    // Set language preferences for Japanese content
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'ja-JP,ja;q=0.9,en;q=0.8'
    });

    const isUrl = keywordOrUrl.startsWith('http://') || keywordOrUrl.startsWith('https://');
    
    let searchUrl;
    if (isUrl && (keywordOrUrl.includes('rakuten.co.jp') || keywordOrUrl.includes('rakuten.com'))) {
      // If it's a Rakuten URL, extract search term and search
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

    console.log(`[SCRAPER] Navigating to search URL: ${searchUrl}`);
    await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for search results to load
    await page.waitForSelector('.searchresultitem, .dui-card', { timeout: 10000 }).catch(() => console.log('Search results not found'));
    
    // Extract product information from search results
    const products = await page.evaluate(() => {
      const productList = [];
      const productElements = document.querySelectorAll('.searchresultitem, .dui-card');
      
      productElements.forEach((product, index) => {
        if (index >= 50) return; // Limit to first 50 products
        
        const getTextContent = (selector) => {
          const element = product.querySelector(selector);
          return element ? element.textContent.trim() : '';
        };
        
        // Get product link
        const linkElement = product.querySelector('a[href*="item."]');
        const productUrl = linkElement ? linkElement.href : '';
        
        // Get title
        const title = getTextContent('.title') || 
                     getTextContent('h3') || 
                     getTextContent('.itemname') ||
                     getTextContent('a[href*="item."]') ||
                     '';
        
        // Get price
        const price = getTextContent('.price') || 
                     getTextContent('.important') ||
                     getTextContent('[class*="price"]') ||
                     '';
        
        // Get description - usually limited on search pages
        const description = getTextContent('.description') ||
                           getTextContent('.catch') ||
                           getTextContent('.itemcatch') ||
                           '';
        
        // Get image
        const images = [];
        const imgElement = product.querySelector('img');
        if (imgElement && imgElement.src && 
            !imgElement.src.includes('transparent') && 
            !imgElement.src.includes('pixel') &&
            !imgElement.src.includes('icon')) {
          
          let fullSizeUrl = imgElement.src;
          // Try to get larger version by removing size constraints
          fullSizeUrl = fullSizeUrl.replace(/\?_ex=\d+x\d+/, '').replace(/@\d+x\d+/, '');
          images.push(fullSizeUrl);
        }
        
        // Get rating information
        let ratingScore = 0;
        let ratingCount = 0;
        
        // Look for rating elements
        const ratingElement = product.querySelector('.rating, [class*="rating"], .star');
        if (ratingElement) {
          const ratingText = ratingElement.textContent;
          const ratingMatch = ratingText.match(/(\d+(?:\.\d+)?)/);
          if (ratingMatch) {
            ratingScore = parseFloat(ratingMatch[1]);
          }
        }
        
        // Look for review count
        const reviewElement = product.querySelector('.review, [class*="review"]');
        if (reviewElement) {
          const reviewText = reviewElement.textContent;
          const countMatch = reviewText.match(/(\d+)/);
          if (countMatch) {
            ratingCount = parseInt(countMatch[1]);
          }
        }
        
        // Get shop/seller info
        const shopElement = product.querySelector('.merchant, .shop, [class*="shop"]');
        const shop = shopElement ? shopElement.textContent.trim() : '';
        
        // Skip if no title or URL
        if (!title || !productUrl) return;
        
        productList.push({
          title,
          price: price.replace(/[^\d,円]/g, ''),
          description,
          images,
          ratings: { 
            score: ratingScore, 
            count: ratingCount 
          },
          reviews: [], // No reviews from search page
          category: 'General', // Category not usually available on search page
          tags: [],
          contentLanguage: 'japanese',
          source: 'rakuten',
          sourceUrl: productUrl,
          shop
        });
      });
      
      return productList;
    });
    
    console.log(`[SCRAPER] Found ${products.length} products from search results`);
    
    await browser.close();
    return products;
    
  } catch (error) {
    logError(error, 'scrapeRakuten', { keywordOrUrl });
    
    try {
      await browser.close();
    } catch (closeError) {
      console.error(`Error closing browser: ${closeError.message}`);
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