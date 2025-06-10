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

async function scrapeAmazon(keywordOrUrl, browserConfig) {
  console.log(`[SCRAPER] Scraping Amazon for: ${keywordOrUrl}`);
  
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

module.exports = {
  scrapeAmazon,
  extractAmazonProductData
};
