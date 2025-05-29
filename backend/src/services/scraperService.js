const puppeteer = require('puppeteer');
const Settings = require('../models/Settings');
const { ScraperError, NetworkError, TimeoutError, logError } = require('./errorService');

async function extractAmazonProductData(page, productUrl) {
  try {
    // Get settings for timeout
    const settings = await Settings.getSettings();
    const timeout = settings?.scraperSettings?.requestTimeout || 30000;

    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout });
    
    // Wait for necessary elements to load
    await page.waitForSelector('#productTitle', { timeout: 10000 }).catch(() => console.log('[SCRAPER] Title selector not found'));
    
    // Extract product details
    const productData = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };
      
      // Get product title
      const title = getTextContent('#productTitle');
      
      // Get product price (handling various price element selectors)
      let price = '';
      const priceSelectors = [
        '.a-price .a-offscreen',
        '#priceblock_ourprice',
        '#priceblock_dealprice',
        '.a-color-price'
      ];
      
      for (const selector of priceSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          price = element.textContent.trim();
          break;
        }
      }
      
      // Get product description
      const description = getTextContent('#productDescription p') || 
                          getTextContent('#feature-bullets .a-list-item') || '';
      
      // Get product images - enhanced version for modern Amazon layout
      const images = [];
      
      // Try to get full resolution images from the image carousel (multiple approaches for different Amazon layouts)
      
      // Approach 1: Classic landing image with data attributes
      const landingImage = document.getElementById('landingImage');
      if (landingImage) {
        if (landingImage.dataset && landingImage.dataset.oldHires) {
          images.push(landingImage.dataset.oldHires);
        } else if (landingImage.dataset && landingImage.dataset.aLargeImage) {
          images.push(landingImage.dataset.aLargeImage);
        } else if (landingImage.src) {
          images.push(landingImage.src.replace(/\._[^\.]+_\./, '._SL1500_.'));
        }
      }
      
      // Approach 2: Modern Amazon image gallery with JSON data
      try {
        // Look for the image data in script tags (Amazon stores image data in JSON)
        document.querySelectorAll('script:not([src])').forEach(script => {
          if (script.textContent.includes('colorImages') || script.textContent.includes('imageGalleryData')) {
            const scriptText = script.textContent;
            
            // Look for image data patterns
            const dataMatch = scriptText.match(/'colorImages'\s*:\s*({[^}]+})/);
            if (dataMatch) {
              try {
                // Try to parse the JSON-like structure (it's not always valid JSON)
                const text = dataMatch[1].replace(/'/g, '"');
                const jsonText = text.replace(/(\w+):/g, '"$1":');
                const imageData = JSON.parse(jsonText);
                
                if (imageData && imageData.initial) {
                  imageData.initial.forEach(img => {
                    if (img.hiRes) images.push(img.hiRes);
                    else if (img.large) images.push(img.large);
                  });
                }
              } catch (e) {
                // If JSON parsing fails, try regex extraction
                const hiResMatches = scriptText.match(/hiRes['"]?\s*:\s*['"]([^'"]+)['"]/g);
                if (hiResMatches) {
                  hiResMatches.forEach(match => {
                    const url = match.match(/hiRes['"]?\s*:\s*['"]([^'"]+)['"]/)[1];
                    if (url) images.push(url);
                  });
                }
              }
            }
          }
        });
      } catch (e) {
        // Silently fail if the JSON extraction attempt fails
      }
      
      // Get images from the variant selector
      const variantImages = document.querySelectorAll('#imageBlock .imgSwatch img, #variation_color_name img, #variation_style_name img');
      variantImages.forEach(img => {
        if (img.dataset && img.dataset.oldHires) {
          images.push(img.dataset.oldHires);
        } else if (img.src) {
          // Convert thumbnail URLs to high resolution
          const hiResUrl = img.src.replace(/(._[A-Z0-9]+_\.)([a-zA-Z0-9]+)\./, '$1SL1500.$2');
          images.push(hiResUrl);
        }
      });
      
      // Get carousel images
      const carouselImages = document.querySelectorAll('.a-carousel img');
      carouselImages.forEach(img => {
        if (img.dataset && img.dataset.oldHires) {
          images.push(img.dataset.oldHires);
        }
      });
      
      // Collect image URLs from thumbnail strips
      const thumbnails = document.querySelectorAll('#altImages img, #thumbs-image img, .imageThumbnail img');
      thumbnails.forEach(img => {
        if (img.src && !img.src.includes('transparent') && !img.src.includes('pixel') && !img.src.includes('icon')) {
          // Convert thumbnail to full size image
          let src;
          if (img.dataset && img.dataset.oldHires) {
            src = img.dataset.oldHires;
          } else {
            // Try to transform the URL to get a higher resolution version
            src = img.src
              .replace(/_S[CX]_/, '_AC_SL1500_')
              .replace(/_SR\d+,\d+/, '_SL1500_')
              .replace(/_SY\d+_SX\d+/, '_SL1500_')
              .replace(/\._([^\.]+)_\./, '._SL1500_.');
          }
          
          // Only add if not already in the array and not a small icon
          if (!images.includes(src) && !src.includes('icon') && !src.includes('gif')) {
            images.push(src);
          }
        }
      });
      
      // If we still don't have images, try a broader search
      if (images.length === 0) {
        const allImages = document.querySelectorAll('img[src*="images-amazon"], img[src*="m.media-amazon"]');
        allImages.forEach(img => {
          if (img.src && 
              !img.src.includes('transparent') && 
              !img.src.includes('pixel') && 
              !img.src.includes('icon') && 
              !img.src.includes('gif') &&
              img.width > 100 && 
              img.height > 100) {
            // Extract the base URL without size parameters
            let src = img.src;
            
            // Handle various Amazon image URL patterns
            src = src
              // Replace size indicators with high-res version
              .replace(/_S[CX]_/, '_AC_SL1500_')
              .replace(/_SR\d+,\d+/, '_SL1500_')
              .replace(/_SY\d+_SX\d+/, '_SL1500_')
              .replace(/\._(S|SR|SY|SX|UY|UX|CR|AC|AA)\d+_\./, '._SL1500_.')
              // Handle other common patterns
              .replace(/\._(CB\d+)_\./, '._SL1500_.')
              // Make sure we're getting a jpg/png when possible
              .replace(/\.(gif|webp)([?#].+)?$/, '.jpg$2');
              
            if (!images.includes(src)) {
              images.push(src);
              
              // Also try the direct large version as Amazon sometimes uses different patterns
              const largeVersion = src.replace(/\.(jpg|png|jpeg)/, '._AC_SL1500_.$1');
              if (largeVersion !== src && !images.includes(largeVersion)) {
                images.push(largeVersion);
              }
            }
          }
        });
      }
      
      // Remove duplicates and limit to reasonable number
      const uniqueImages = [...new Set(images)].slice(0, 10);
      
      // Get product ratings
      const ratingText = getTextContent('.a-icon-star, #acrPopover');
      const ratingValue = ratingText ? parseFloat(ratingText.match(/\d+(\.\d+)?/)?.[0] || 0) : 0;
      const ratingCount = getTextContent('#acrCustomerReviewText');
      const countValue = ratingCount ? parseInt(ratingCount.replace(/[^0-9]/g, '')) : 0;
      
      // Get reviews (sample)
      const reviews = [];
      const reviewElements = document.querySelectorAll('[data-hook="review"]');
      reviewElements.forEach((review, index) => {
        if (index < 5) { // Limit to 5 reviews
          const reviewText = review.querySelector('[data-hook="review-body"]')?.textContent.trim() || '';
          const author = review.querySelector('.a-profile-name')?.textContent.trim() || 'Anonymous';
          reviews.push({ author, text: reviewText });
        }
      });

      // Extract category and breadcrumbs for tags
      // Try multiple selectors for breadcrumbs
      const breadcrumbSelectors = [
        '#wayfinding-breadcrumbs_container .a-link-normal',
        '#wayfinding-breadcrumbs_feature_div a',
        '.a-breadcrumb a',
        '[role=navigation] a',
        'a[href*="/s?"]',
        'a.a-color-tertiary'
      ];
      
      let breadcrumbs = [];
      
      for (const selector of breadcrumbSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          const tempBreadcrumbs = Array.from(elements)
            .map(a => a.textContent.trim())
            .filter(text => text && text.length < 50); // Filter out likely non-breadcrumb items
          
          if (tempBreadcrumbs.length > 0) {
            breadcrumbs = tempBreadcrumbs;
            break;
          }
        }
      }
      
      // If no breadcrumbs found, try to determine category from URL or title
      if (breadcrumbs.length === 0) {
        // Check URL for category hints
        const url = window.location.href;
        if (url.includes('/baby-products/') || url.includes('/baby/')) {
          breadcrumbs = ['Baby Products'];
        } else if (url.includes('/electronics/')) {
          breadcrumbs = ['Electronics'];
        } else if (url.includes('/home-garden/')) {
          breadcrumbs = ['Home & Garden'];
        } else if (url.includes('/kitchen/') || title.includes('kitchen')) {
          breadcrumbs = ['Kitchen'];
        } else if (title.includes('basket') || title.includes('storage')) {
          breadcrumbs = ['Home & Kitchen', 'Storage & Organization'];
        } else {
          // Default category
          breadcrumbs = ['Gifts'];
        }
      }
      
      // Use the first breadcrumb as the primary category
      const category = breadcrumbs.length > 0 ? breadcrumbs[0] : 'Uncategorized';
      
      // Use all breadcrumbs as tags
      const tags = [...breadcrumbs];
      
      // Add additional product tags/keywords if any
      document.querySelectorAll('.zg_hrsr_item, .a-link-normal[href*="keywords="]').forEach(el => {
        const text = el.textContent.trim();
        if (text && !tags.includes(text)) {
          tags.push(text);
        }
      });
      
      // Get the page language
      let pageLanguage = 'en'; // Default to English
      const htmlElement = document.querySelector('html');
      if (htmlElement && htmlElement.lang) {
        pageLanguage = htmlElement.lang.split('-')[0]; // Get the base language code
      }
      
      return {
        title,
        price,
        description,
        images: uniqueImages,
        ratings: { score: ratingValue || 0, count: countValue || 0 },
        reviews,
        category,
        tags,
        contentLanguage: pageLanguage,
      };
    });
    
    return {
      ...productData,
      source: 'amazon',
      sourceUrl: productUrl,
    };
  } catch (error) {
    logError(error, 'extractAmazonProductData', { productUrl });
    
    if (error.name === 'TimeoutError') {
      throw new TimeoutError(`Timeout while extracting Amazon product data: ${error.message}`, 30000, { productUrl });
    } else if (error.message.includes('net::ERR')) {
      throw new NetworkError(`Network error while extracting Amazon product data: ${error.message}`, productUrl);
    } else {
      throw new ScraperError(`Error extracting Amazon product data: ${error.message}`, { productUrl });
    }
  }
}

async function scrapeAmazon(keywordOrUrl) {
  console.log(`[SCRAPER] Scraping Amazon for: ${keywordOrUrl}`);
  
  // Get browser configuration from settings
  const browserConfig = await getBrowserConfig();
  
  // Launch browser with stealth mode to avoid detection
  const browser = await puppeteer.launch(browserConfig);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    
    // Setting user-agent to appear more human-like
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36');
    
    // Setting extra HTTP headers to mimic a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Referer': 'https://www.google.com/'
    });
    
    const isUrl = keywordOrUrl.startsWith('http://') || keywordOrUrl.startsWith('https://');
    
    if (isUrl && keywordOrUrl.includes('amazon.com')) {
      // If it's a direct Amazon product URL, scrape that product
      const productData = await extractAmazonProductData(page, keywordOrUrl);
      await browser.close();
      return [productData];
    } else {
      // If it's a keyword, search on Amazon
      const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(keywordOrUrl)}`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for search results to load
      await page.waitForSelector('.s-result-item', { timeout: 10000 }).catch(() => console.log('Search results not found'));
      
      // Extract product links from search results
      const productLinks = await page.evaluate(() => {
        const links = [];
        const products = document.querySelectorAll('.s-result-item[data-asin]:not([data-asin=""])');
        
        products.forEach(product => {
          const linkElement = product.querySelector('a.a-link-normal.s-no-outline');
          if (linkElement && linkElement.href && linkElement.href.includes('/dp/')) {
            links.push(linkElement.href);
          }
        });
        
        return links.slice(0, 5); // Limit to first 5 products
      });
      
      // Scrape each product
      const products = [];
      for (const link of productLinks) {
        try {
          const productData = await extractAmazonProductData(page, link);
          products.push(productData);
        } catch (error) {
          console.error(`Failed to scrape product ${link}: ${error.message}`);
        }
      }
      
      await browser.close();
      return products;
    }
  } catch (error) {
    logError(error, 'scrapeAmazon', { keywordOrUrl });
    try {
      await browser.close();
    } catch (closeError) {
      console.error(`Error closing browser: ${closeError.message}`);
    }
    // Return empty array to indicate no products found
    return [];
  }
}

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
      
      // Get page language
      let pageLanguage = 'ja';
      const htmlElement = document.querySelector('html');
      if (htmlElement && htmlElement.lang) {
        pageLanguage = htmlElement.lang.split('-')[0];
      }
      if (pageLanguage === 'ja') {
        pageLanguage = 'japanese';
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
      
      // Get the page language
      let pageLanguage = 'ja'; // Default to Japanese for Rakuten
      const htmlElement = document.querySelector('html');
      if (htmlElement && htmlElement.lang) {
        pageLanguage = htmlElement.lang.split('-')[0]; // Get the base language code
      }
      // Convert to 'japanese' if it's 'ja'
      if (pageLanguage === 'ja') {
        pageLanguage = 'japanese';
      }
      
      return {
        title,
        price,
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

async function scrapeRakuten(keywordOrUrl) {
  console.log(`[SCRAPER] Scraping Rakuten for: ${keywordOrUrl}`);
  
  // Get browser configuration from settings
  const browserConfig = await getBrowserConfig();
  
  // Launch browser
  const browser = await puppeteer.launch(browserConfig);
  
  try {
    const page = await browser.newPage();
    
    // Set viewport and user agent
    await page.setViewport({
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
    });
    
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36');
    
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
        
        // Supplement with better meta description if available
        if (metaData?.description && metaData.description.length > (primaryData.description?.length || 0)) {
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
            
            // Supplement with better meta description if available
            if (metaData?.description && metaData.description.length > (primaryData.description?.length || 0)) {
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
            console.log(`[SCRAPER] Skipping product due to no data available`);
            continue; // Skip this product if both failed
          }
          
          console.log(`[SCRAPER] Successfully processed product: ${finalData.title}`);
          products.push(finalData);
        } catch (error) {
          console.error(`Failed to scrape product ${linkData.productLink}: ${error.message}`);
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
    return [];
  }
}

async function scrapeProductData(keywordOrUrl, source) {
  if (!keywordOrUrl) {
    throw new ScraperError('No keyword or URL provided for scraping');
  }

  let results = [];
  const isUrl = keywordOrUrl.startsWith('http://') || keywordOrUrl.startsWith('https://');

  try {
    // Get settings
    const settings = await Settings.getSettings();
    const { scraperSettings } = settings;
    
    // Apply wait time between scraping operations
    const waitTime = scraperSettings?.waitTime || 2000;
    
    if (source === 'amazon' || source === 'all') {
      console.log(`[SCRAPER] Starting Amazon scraping for: ${keywordOrUrl}`);
      const amazonResults = await scrapeAmazon(keywordOrUrl);
      results = results.concat(amazonResults);
      
      // Wait between scraping operations if multiple sources
      if (source === 'all' && waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    if (source === 'rakuten' || source === 'all') {
      console.log(`[SCRAPER] Starting Rakuten scraping for: ${keywordOrUrl}`);
      const rakutenResults = await scrapeRakuten(keywordOrUrl);
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
    
    // Default config
    const config = {
      headless: 'new',
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
    
    return config;
  } catch (error) {
    logError(error, 'getBrowserConfig');
    // Return default config if there's an issue
    return {
      headless: 'new',
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
};
