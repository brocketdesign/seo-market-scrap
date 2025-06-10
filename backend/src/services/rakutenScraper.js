const puppeteer = require('puppeteer');
const Settings = require('../models/Settings');
const { ScraperError, NetworkError, TimeoutError, logError } = require('./errorService');

async function extractRakutenProductData(page, productUrl) {
  try {
    // Get settings for timeout
    const settings = await Settings.getSettings();
    const timeout = settings?.scraperSettings?.requestTimeout || 30000;
    console.log(`[SCRAPER] Extracting Rakuten product data from: ${productUrl}`);
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout });
    
    // Wait for page to load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract product details from the main product page
    const productData = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };
      
      const getMetaContent = (name) => {
        const element = document.querySelector(`meta[name="${name}"]`) || 
                        document.querySelector(`meta[property="${name}"]`);
        return element ? element.getAttribute('content') || '' : '';
      };
      
      // Get title from meta og:title or page title
      const title = getMetaContent('og:title') || 
                    getMetaContent('title') || 
                    document.title || 
                    getTextContent('h1');
      
      // Get description from meta description - prioritize this
      const description = getMetaContent('description') || 
                         getMetaContent('og:description') ||
                         getTextContent('#itemDescription') ||
                         getTextContent('.itemDescription') ||
                         getTextContent('.item_desc') ||
                         '';
      
      // Get product price - use the same logic as extractRakutenReviewData
      let price = '';
      // Try new price format first (modern Rakuten layout)
      const priceElement = document.querySelector('.value--1oSD_');
      if (priceElement) {
        const priceValue = priceElement.textContent.trim();
        const currencyElement = document.querySelector('.suffix--5oXks .text-display--2xC98');
        const currency = currencyElement ? currencyElement.textContent.trim() : '円';
        price = priceValue + currency;
      } else {
        // Fall back to traditional selectors
        const priceSelectors = [
          '.price2',
          '.price',
          '.important-price',
          '#priceCalculationConfig',
          '[data-testid="price"]'
        ];
        
        for (const selector of priceSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            price = element.textContent.trim();
            break;
          }
        }
        
        // If still no price, try to get from meta tags
        if (!price) {
          const priceMeta = getMetaContent('price') || getMetaContent('og:price:amount');
          if (priceMeta) {
            price = priceMeta;
          }
        }
      }
      
      // Get images from meta og:image and other sources
      const images = [];
      const ogImage = getMetaContent('og:image');
      if (ogImage) {
        images.push(ogImage);
      }
      
      // Get additional images from the page - use similar logic as review function
      const imageSelectors = [
        '.image--BGsMl', // Main product image from modern layout
        'img[src*="thumbnail.image.rakuten.co.jp"]',
        'img[src*="r.r10s.jp"]',
        '#imageDisplay img',
        '.rakutenLimitedId_ImageMain1-3 img'
      ];
      
      for (const selector of imageSelectors) {
        const imageElements = document.querySelectorAll(selector);
        imageElements.forEach(img => {
          if (img.src && 
              !img.src.includes('transparent') && 
              !img.src.includes('pixel') &&
              !img.src.includes('icon') &&
              !img.src.includes('star-') &&
              !img.src.includes('svg') &&
              img.width > 100 && img.height > 100) {
            
            let fullSizeUrl = img.src;
            
            // Handle the @0_mall pattern and size parameters
            if (fullSizeUrl.includes('@0_mall')) {
              fullSizeUrl = fullSizeUrl.replace(/\?_ex=\d+x\d+/, '');
              fullSizeUrl = fullSizeUrl.replace(/@\d+_mall/, '@0_mall');
            }
            
            // Handle other thumbnail patterns
            if (fullSizeUrl.includes('thumbnail')) {
              fullSizeUrl = fullSizeUrl.replace(/@\d+x\d+/, '');
            }
            
            fullSizeUrl = fullSizeUrl.replace(/\?_ex=\d+x\d+/, '').replace(/@\d+x\d+/, '');
            
            if (!images.includes(fullSizeUrl)) {
              images.push(fullSizeUrl);
            }
          }
        });
        
        // Break if we found images with this selector
        if (images.length > 0) break;
      }
      
      // Get category from breadcrumbs or meta
      const breadcrumbs = [];
      const breadcrumbElements = document.querySelectorAll('.breadcrumbs a, a[href*="/s/"]');
      breadcrumbElements.forEach(a => {
        const text = a.textContent.trim();
        if (text && !breadcrumbs.includes(text)) {
          breadcrumbs.push(text);
        }
      });
      
      const category = breadcrumbs.length > 0 ? breadcrumbs[0] : 'Uncategorized';
      
      // Get basic rating info if available on main page - use similar logic as review function
      let ratingValue = 0;
      let countValue = 0;
      
      // Try modern rating layout first
      const ratingContainer = document.querySelector('.rating-container--1utdQ');
      if (ratingContainer) {
        const ratingNumber = ratingContainer.querySelector('.number-wrapper-l--JjxAC .text-container--2tSUW') || 
                           ratingContainer.querySelector('.number-wrapper-xl--LyvuU .value--1oSD_');
        
        if (ratingNumber) {
          ratingValue = parseFloat(ratingNumber.textContent.trim());
        }
        
        // Look for review count
        const reviewCountSelectors = [
          '.amount-wrapper-xl--38iTg .text-container--2tSUW',
          '.text-container--2tSUW[class*="color-gray-dark"]'
        ];
        
        for (const selector of reviewCountSelectors) {
          const reviewCountElement = document.querySelector(selector);
          if (reviewCountElement) {
            const text = reviewCountElement.textContent;
            const countMatch = text.match(/(\d+)件/) || text.match(/\((\d+)\)/);
            if (countMatch && countMatch[1]) {
              countValue = parseInt(countMatch[1]);
              break;
            }
          }
        }
      } else {
        // Fall back to traditional selectors
        const ratingElement = document.querySelector('[data-testid="rating"], .rating');
        if (ratingElement) {
          const ratingMatch = ratingElement.textContent.match(/(\d+(?:\.\d+)?)/);
          if (ratingMatch) {
            ratingValue = parseFloat(ratingMatch[1]);
          }
        }
        
        const reviewCountElement = document.querySelector('[data-testid="review-count"], .review-count');
        if (reviewCountElement) {
          const countMatch = reviewCountElement.textContent.match(/(\d+)/);
          if (countMatch) {
            countValue = parseInt(countMatch[1]);
          }
        }
      }
      
      // Get page language - Always default to japanese for Rakuten
      let pageLanguage = 'japanese';
      const htmlElement = document.querySelector('html');
      if (htmlElement && htmlElement.lang) {
        const detectedLang = htmlElement.lang.split('-')[0].toLowerCase();
        // Only override if we detect a different language explicitly
        if (detectedLang && detectedLang !== 'ja' && detectedLang !== 'jp') {
          pageLanguage = detectedLang === 'en' ? 'english' : detectedLang;
        }
      }
      
      return {
        title,
        price,
        description,
        images: [...new Set(images)].slice(0, 10),
        ratings: { score: ratingValue || 0, count: countValue || 0 },
        reviews: [], // Will be populated by review scraping
        category,
        tags: breadcrumbs,
        contentLanguage: pageLanguage,
      };
    });
    
    return {
      ...productData,
      source: 'rakuten',
      sourceUrl: productUrl,
    };
  } catch (error) {
    logError(error, 'extractRakutenProductData', { productUrl });
    
    if (error.name === 'TimeoutError') {
      throw new TimeoutError(`Timeout while extracting Rakuten product data: ${error.message}`, 30000, { productUrl });
    } else if (error.message.includes('net::ERR')) {
      throw new NetworkError(`Network error while extracting Rakuten product data: ${error.message}`, productUrl);
    } else {
      throw new ScraperError(`Error extracting Rakuten product data: ${error.message}`, { productUrl });
    }
  }
}

async function extractRakutenReviewData(page, reviewUrl) {
  try {
    // Get settings for timeout
    const settings = await Settings.getSettings();
    const timeout = settings?.scraperSettings?.requestTimeout || 30000;
    console.log(`[SCRAPER] Extracting Rakuten review data from: ${reviewUrl}`);
    await page.goto(reviewUrl, { waitUntil: 'networkidle2', timeout });
    
    // Wait for necessary elements to load - updated for modern Rakuten layout
    await page.waitForSelector('.text-container--2tSUW, .item_name, .productTitle', { timeout: 10000 })
      .catch(() => console.log('[SCRAPER] Title selector not found for Rakuten reviews'));
    
    // Extract review details
    const reviewData = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };
      
      // Get product title - support both new and old layouts
      const title = document.querySelector('.text-container--2tSUW .ellipsis--395xS')?.textContent.trim() ||
                    document.querySelector('.text-container--2tSUW')?.textContent.trim() ||
                    getTextContent('.item_name') || 
                    getTextContent('.productTitle');
      
      // Get product description - look for specific elements in review page
      const description = document.querySelector('.ellipsis--395xS[style*="linesToClamp"]')?.textContent.trim() ||
                         document.querySelector('.spacer--3J57F.block--_IJiJ .text-container--2tSUW .ellipsis--395xS')?.textContent.trim() ||
                         document.querySelector('.spacer--3J57F.block--_IJiJ a span.ellipsis--395xS')?.textContent.trim() ||
                         document.querySelector('.item_desc')?.textContent.trim() ||
                         document.querySelector('.itemDescription')?.textContent.trim() ||
                         document.querySelector('#itemDescription')?.textContent.trim() ||
                         '';

      // Get product price - modern Rakuten layout uses a different price format
      let price = '';
      // Try new price format first
      const priceElement = document.querySelector('.value--1oSD_');
      if (priceElement) {
        const priceValue = priceElement.textContent.trim();
        const currencyElement = document.querySelector('.suffix--5oXks .text-display--2xC98');
        const currency = currencyElement ? currencyElement.textContent.trim() : '円';
        price = priceValue + currency;
      } else {
        // Fall back to traditional selectors
        const priceSelectors = [
          '.price2, .price, .important-price',
          '#priceCalculationConfig'
        ];
        
        for (const selector of priceSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            price = element.textContent.trim();
            break;
          }
        }
      }
      
      // Get product images - updated for modern Rakuten layout
      const images = [];
      
      // Modern layout - handle the new structure with specific class names
      const modernImageSelectors = [
        '.image--BGsMl', // Main product image from the example
        'img[src*="thumbnail.image.rakuten.co.jp"]',
        'img[src*="r.r10s.jp"]',
        '#imageDisplay img',
        '.rakutenLimitedId_ImageMain1-3 img'
      ];
      
      for (const selector of modernImageSelectors) {
        const imgElements = document.querySelectorAll(selector);
        imgElements.forEach(img => {
          if (img.src && 
              !img.src.includes('transparent') && 
              !img.src.includes('pixel') &&
              !img.src.includes('common') && 
              !img.src.includes('icon') &&
              !img.src.includes('star-') && // Exclude star rating images
              !img.src.includes('svg') &&
              img.width > 50 && img.height > 50) { // Ensure it's not a tiny icon
            
            // Convert thumbnail to full size by removing size constraints
            let fullSizeUrl = img.src;
            
            // Handle the @0_mall pattern and size parameters
            if (fullSizeUrl.includes('@0_mall')) {
              // Remove size constraints like ?_ex=288x288
              fullSizeUrl = fullSizeUrl.replace(/\?_ex=\d+x\d+/, '');
              // Try to get larger version by replacing size in path
              fullSizeUrl = fullSizeUrl.replace(/@\d+_mall/, '@0_mall');
            }
            
            // Handle other thumbnail patterns
            if (fullSizeUrl.includes('thumbnail')) {
              fullSizeUrl = fullSizeUrl.replace(/@\d+x\d+/, '');
            }
            
            if (!images.includes(fullSizeUrl)) {
              images.push(fullSizeUrl);
            }
          }
        });
        
        // Break if we found images with this selector
        if (images.length > 0) break;
      }
      
      // If still no images found, try a broader search
      if (images.length === 0) {
        const allImages = document.querySelectorAll('img[src*="rakuten"], img[src*="r10s.jp"]');
        allImages.forEach(img => {
          if (img.src && 
              !img.src.includes('transparent') && 
              !img.src.includes('pixel') &&
              !img.src.includes('icon') &&
              !img.src.includes('star-') &&
              !img.src.includes('svg') &&
              !img.src.includes('logo') &&
              img.width > 100 && 
              img.height > 100) {
            
            let fullSizeUrl = img.src.replace(/\?_ex=\d+x\d+/, '').replace(/@\d+x\d+/, '');
            
            if (!images.includes(fullSizeUrl)) {
              images.push(fullSizeUrl);
            }
          }
        });
      }
      
      // Remove duplicates and limit to reasonable number
      const uniqueImages = [...new Set(images)].slice(0, 10);
      
      // Get product ratings - updated for modern star layout
      let ratingValue = 0;
      let countValue = 0;
      
      // Modern rating layout with star images - updated based on HTML example
      const ratingContainer = document.querySelector('.rating-container--1utdQ');
      if (ratingContainer) {
        // Look for rating value in number wrapper
        const ratingNumber = ratingContainer.querySelector('.number-wrapper-l--JjxAC .text-container--2tSUW') || 
                           ratingContainer.querySelector('.number-wrapper-xl--LyvuU .value--1oSD_');
        
        if (ratingNumber) {
          ratingValue = parseFloat(ratingNumber.textContent.trim());
        } else {
          // Count filled stars - updated for new star structure
          const starContainer = ratingContainer.querySelector('.star-container--I4Q5E');
          if (starContainer) {
            const allStars = starContainer.querySelectorAll('img[alt="star-rating"]');
            const filledStars = Array.from(allStars).filter(star => 
              star.src && !star.src.includes('star-empty')
            );
            ratingValue = filledStars.length;
          }
        }
        
        // Look for review count - check for various patterns
        const reviewCountSelectors = [
          '.amount-wrapper-xl--38iTg .text-container--2tSUW',
          '.text-container--2tSUW[class*="color-gray-dark"]'
        ];
        
        for (const selector of reviewCountSelectors) {
          const reviewCountElement = document.querySelector(selector);
          if (reviewCountElement) {
            const text = reviewCountElement.textContent;
            const countMatch = text.match(/(\d+)件/) || text.match(/\((\d+)\)/);
            if (countMatch && countMatch[1]) {
              countValue = parseInt(countMatch[1]);
              break;
            }
          }
        }
      } else {
        // Fall back to traditional rating selectors
        const ratingElement = document.querySelector('.revEvaluate span');
        if (ratingElement) {
          const ratingMatch = ratingElement.textContent.match(/\d+(\.\d+)?/);
          ratingValue = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
        }
        
        const ratingCount = getTextContent('.revEvaluate');
        countValue = ratingCount ? parseInt(ratingCount.replace(/[^0-9]/g, '')) : 0;
      }
      
      // Get reviews (sample) - updated for modern review layout
      const reviews = [];
      const reviewElements = document.querySelectorAll('.review-body--3myhE, .revRvwUserSec');
      reviewElements.forEach((review, index) => {
        if (index < 10) { // Limit to 10 reviews from review page
          // Handle modern review structure
          if (review.classList.contains('review-body--3myhE')) {
            // Find parent container to get reviewer info
            const reviewContainer = review.closest('li');
            let author = 'Anonymous';
            let rating = 5;
            if (reviewContainer) {
              const nameElem = reviewContainer.querySelector('.reviewer-name--3aHc3');
              if (nameElem) author = nameElem.textContent.trim();
              
              const ratingElem = reviewContainer.querySelector('.number-wrapper-l--JjxAC');
              if (ratingElem) rating = parseInt(ratingElem.textContent.trim() || 5);
            }
            reviews.push({ 
              author, 
              text: review.textContent.trim(),
              rating
            });
          } else {
            // Handle legacy review structure
            const reviewText = review.querySelector('.revRvwUserEntryComment')?.textContent.trim() || '';
            const author = review.querySelector('.revRvwUserEntryUserName')?.textContent.trim() || 'Anonymous';
            reviews.push({ author, text: reviewText, rating: 5 });
          }
        }
      });

      // Extract category and breadcrumbs for tags
      // Support both modern and traditional breadcrumbs
      const categoryElements = document.querySelectorAll('.breadcrumbs a, a[href*="/s/"]');
      const breadcrumbs = Array.from(categoryElements)
        .map(a => a.textContent.trim())
        .filter(Boolean);
      
      // Use the first breadcrumb as the primary category
      const category = breadcrumbs.length > 0 ? breadcrumbs[0] : 'Uncategorized';
      
      // Get the page language - Always default to japanese for Rakuten
      let pageLanguage = 'japanese';
      const htmlElement = document.querySelector('html');
      if (htmlElement && htmlElement.lang) {
        const detectedLang = htmlElement.lang.split('-')[0].toLowerCase();
        // Only override if we detect a different language explicitly
        if (detectedLang && detectedLang !== 'ja' && detectedLang !== 'jp') {
          pageLanguage = detectedLang === 'en' ? 'english' : detectedLang;
        }
      }
      
      return {
        title,
        price,
        description, // Add description to the returned data
        images: uniqueImages, // Use the processed unique images
        ratings: { score: ratingValue || 0, count: countValue || 0 },
        reviews,
        category,
        tags: breadcrumbs, // Using breadcrumbs as tags
        contentLanguage: pageLanguage,
      };
    });
    
    return reviewData;
  } catch (error) {
    logError(error, 'extractRakutenReviewData', { reviewUrl });
    return {
      ratings: { score: 0, count: 0 },
      reviews: [],
      images: [],
      category: 'Uncategorized',
      tags: [],
    };
  }
}

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
    
    if (isUrl && (keywordOrUrl.includes('rakuten.co.jp') || keywordOrUrl.includes('rakuten.com'))) {
      // If it's a direct Rakuten product URL, scrape that product
      
      // First, try to find review link on the product page
      let reviewLink = null;
      let primaryData = null;
      let metaData = null;
      
      try {
        console.log(`[SCRAPER] Looking for review link on product page: ${keywordOrUrl}`);
        await page.goto(keywordOrUrl, { waitUntil: 'networkidle2', timeout: 30000 });
        
        // Look for review link on the product page
        reviewLink = await page.evaluate(() => {
          const reviewElement = document.querySelector('a[href*="review."]');
          return reviewElement ? reviewElement.href : null;
        });
        
        if (reviewLink) {
          console.log(`[SCRAPER] Found review link: ${reviewLink}`);
        } else {
          console.log(`[SCRAPER] No review link found on product page`);
        }
      } catch (error) {
        console.log(`[SCRAPER] Error looking for review link: ${error.message}`);
      }
      
      // Try to get comprehensive data from review page if link found
      if (reviewLink) {
        try {
          console.log(`[SCRAPER] Getting comprehensive data from reviews: ${reviewLink}`);
          primaryData = await extractRakutenReviewData(page, reviewLink);
        } catch (reviewError) {
          console.log(`[SCRAPER] Could not fetch review data: ${reviewError.message}`);
        }
      }
      
      // Then get meta description from product page
      try {
        console.log(`[SCRAPER] Getting meta description from product page: ${keywordOrUrl}`);
        metaData = await extractRakutenProductData(page, keywordOrUrl);
      } catch (productError) {
        console.log(`[SCRAPER] Could not fetch product meta data: ${productError.message}`);
      }
      
      // Merge data: prioritize review data but supplement with meta description
      let finalData;
      if (primaryData) {
        finalData = {
          ...primaryData,
          source: 'rakuten',
          sourceUrl: keywordOrUrl,
        };
        
        // If review data has description, use it - otherwise use meta description
        if (!primaryData.description && metaData?.description) {
          finalData.description = metaData.description;
        } else if (primaryData.description && metaData?.description && 
                  metaData.description.length > primaryData.description.length && 
                  !primaryData.description.includes(metaData.description.substring(0, 20))) {
          // If meta description is longer and not a subset of review description, use it
          finalData.description = metaData.description;
        }
        
        // Add meta title if review title is missing or short
        if (metaData?.title && (!primaryData.title || primaryData.title.length < metaData.title.length)) {
          finalData.title = metaData.title;
        }
        
        // Supplement images if review page didn't have any
        if (metaData?.images?.length > 0 && (!primaryData.images || primaryData.images.length === 0)) {
          finalData.images = metaData.images;
        }
      } else if (metaData) {
        // Fallback to product data if review data failed
        finalData = {
          ...metaData,
          source: 'rakuten',
          sourceUrl: keywordOrUrl,
        };
      } else {
        // Both failed, return empty structure
        finalData = {
          title: 'Product Not Found',
          description: '',
          price: '',
          images: [],
          ratings: { score: 0, count: 0 },
          reviews: [],
          category: 'Uncategorized',
          tags: [],
          contentLanguage: 'japanese',
          source: 'rakuten',
          sourceUrl: keywordOrUrl,
        };
      }
      
      await browser.close();
      return [finalData];
    } else {
      // If it's a keyword, search on Rakuten
      const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keywordOrUrl)}/`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for search results to load
      await page.waitForSelector('.searchresultitem, .dui-card', { timeout: 10000 }).catch(() => console.log('Search results not found'));
      
      // Extract product links and review links from search results
      const productData = await page.evaluate(() => {
        const products = [];
        const productElements = document.querySelectorAll('.searchresultitem, .dui-card');
        
        productElements.forEach(product => {
          const linkElement = product.querySelector('a[href*="item."]');
          const reviewElement = product.querySelector('a[href*="review."]');
          
          if (linkElement && linkElement.href) {
            products.push({
              productLink: linkElement.href,
              reviewLink: reviewElement ? reviewElement.href : null
            });
          }
        });
        
        return products.slice(0, 5); // Limit to first 5 products
      });
      
      console.log(`[SCRAPER] Found ${productData.length} products with links`);
      
      // Scrape each product
      const products = [];
      for (const linkData of productData) {
        try {
          console.log(`[SCRAPER] Processing product: ${linkData.productLink}`);
          console.log(`[SCRAPER] Review link available: ${linkData.reviewLink ? 'Yes' : 'No'}`);
          
          // For each product, prioritize review data if available
          let primaryData = null;
          let metaData = null;
          
          // Try to get review data first if review link is available
          if (linkData.reviewLink) {
            try {
              console.log(`[SCRAPER] Getting review data from: ${linkData.reviewLink}`);
              primaryData = await extractRakutenReviewData(page, linkData.reviewLink);
            } catch (reviewError) {
              console.log(`[SCRAPER] Could not fetch reviews for ${linkData.reviewLink}: ${reviewError.message}`);
            }
          } else {
            // If no direct review link, try to find it on the product page
            try {
              await page.goto(linkData.productLink, { waitUntil: 'networkidle2', timeout: 30000 });
              const reviewLink = await page.evaluate(() => {
                const reviewElement = document.querySelector('a[href*="review."]');
                return reviewElement ? reviewElement.href : null;
              });
              
              if (reviewLink) {
                console.log(`[SCRAPER] Found review link on product page: ${reviewLink}`);
                primaryData = await extractRakutenReviewData(page, reviewLink);
              }
            } catch (error) {
              console.log(`[SCRAPER] Could not find review link on product page: ${error.message}`);
            }
          }
          
          // Get meta data from product page
          try {
            metaData = await extractRakutenProductData(page, linkData.productLink);
          } catch (productError) {
            console.log(`[SCRAPER] Could not fetch product meta for ${linkData.productLink}: ${productError.message}`);
          }
          
          // Merge data: prioritize review data but supplement with meta description
          let finalData;
          if (primaryData) {
            finalData = {
              ...primaryData,
              source: 'rakuten',
              sourceUrl: linkData.productLink,
            };
            
            // If review data has description, use it - otherwise use meta description
            if (!primaryData.description && metaData?.description) {
              finalData.description = metaData.description;
            } else if (primaryData.description && metaData?.description && 
                      metaData.description.length > primaryData.description.length && 
                      !primaryData.description.includes(metaData.description.substring(0, 20))) {
              // If meta description is longer and not a subset of review description, use it
              finalData.description = metaData.description;
            }
            
            // Add meta title if review title is missing or short
            if (metaData?.title && (!primaryData.title || primaryData.title.length < metaData.title.length)) {
              finalData.title = metaData.title;
            }
            
            // Supplement images if review page didn't have any
            if (metaData?.images?.length > 0 && (!primaryData.images || primaryData.images.length === 0)) {
              finalData.images = metaData.images;
            }
          } else if (metaData) {
            // Fallback to product data if review data failed
            finalData = {
              ...metaData,
              source: 'rakuten',
              sourceUrl: linkData.productLink,
            };
          } else {
            // Both failed, skip this product
            console.log(`[SCRAPER] Skipping product due to no data available`);
            continue;
          }
          
          console.log(`[SCRAPER] Successfully processed product: ${finalData.title}`);
          products.push(finalData);
        } catch (error) {
          console.log(`[SCRAPER] Failed to scrape product ${linkData.productLink}: ${error.message}`);
          logError(error, 'scrapeRakutenProduct', { url: linkData.productLink });
        }
      }
      
      await browser.close();
      return products;
    }
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
  scrapeRakuten,
  extractRakutenProductData,
  extractRakutenReviewData
};
