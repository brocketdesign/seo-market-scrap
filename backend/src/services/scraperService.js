const puppeteer = require('puppeteer');

async function extractAmazonProductData(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for necessary elements to load
    await page.waitForSelector('#productTitle', { timeout: 10000 }).catch(() => console.log('Title selector not found'));
    
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
      
      // Get product images
      const images = [];
      const imgElements = document.querySelectorAll('#altImages img, #imageBlock img');
      imgElements.forEach(img => {
        if (img.src && !img.src.includes('transparent') && !img.src.includes('pixel')) {
          // Try to get the large version of the image
          const src = img.src.replace(/_[S]C_/, '_AC_SL1500_');
          images.push(src);
        }
      });
      
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

      // Extract category
      const categoryElements = document.querySelectorAll('#wayfinding-breadcrumbs_container .a-link-normal');
      const categories = Array.from(categoryElements).map(a => a.textContent.trim()).filter(Boolean);
      const category = categories.length > 0 ? categories[categories.length - 1] : 'Uncategorized';
      
      // Extract product tags/keywords
      const keywords = [];
      document.querySelectorAll('.zg_hrsr_item, .a-link-normal[href*="keywords="]').forEach(el => {
        const text = el.textContent.trim();
        if (text) keywords.push(text);
      });
      
      return {
        title,
        price,
        description,
        images,
        ratings: { score: ratingValue || 0, count: countValue || 0 },
        reviews,
        category,
        tags: keywords,
      };
    });
    
    return {
      ...productData,
      source: 'amazon',
      sourceUrl: productUrl,
    };
  } catch (error) {
    console.error(`Error extracting Amazon product data: ${error.message}`);
    throw error;
  }
}

async function scrapeAmazon(keywordOrUrl) {
  console.log(`Scraping Amazon for: ${keywordOrUrl}`);
  
  // Launch browser with stealth mode to avoid detection
  const browser = await puppeteer.launch({
    headless: 'new', // Using the new headless mode
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
      '--user-agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/99.0.4844.84 Safari/537.36"',
    ]
  });
  
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
    console.error(`Amazon scraping error: ${error.message}`);
    await browser.close();
    // Return empty array to indicate no products found
    return [];
  }
}

async function extractRakutenProductData(page, productUrl) {
  try {
    await page.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for necessary elements to load
    await page.waitForSelector('.item_name, .productTitle', { timeout: 10000 }).catch(() => console.log('Title selector not found'));
    
    // Extract product details
    const productData = await page.evaluate(() => {
      const getTextContent = (selector) => {
        const element = document.querySelector(selector);
        return element ? element.textContent.trim() : '';
      };
      
      // Get product title
      const title = getTextContent('.item_name') || getTextContent('.productTitle');
      
      // Get product price
      let price = '';
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
      
      // Get product description
      const description = getTextContent('#itemDescription, .itemDescription, .item_desc, .mdItemDescription') || '';
      
      // Get product images
      const images = [];
      const imgElements = document.querySelectorAll('#imageDisplay img, .rakutenLimitedId_ImageMain1-3 img');
      imgElements.forEach(img => {
        if (img.src && !img.src.includes('transparent') && !img.src.includes('pixel')) {
          images.push(img.src);
        }
      });
      
      // Get product ratings
      const ratingElement = document.querySelector('.revEvaluate span');
      let ratingValue = 0;
      if (ratingElement) {
        const ratingMatch = ratingElement.textContent.match(/\d+(\.\d+)?/);
        ratingValue = ratingMatch ? parseFloat(ratingMatch[0]) : 0;
      }
      
      const ratingCount = getTextContent('.revEvaluate');
      const countValue = ratingCount ? parseInt(ratingCount.replace(/[^0-9]/g, '')) : 0;
      
      // Get reviews (sample)
      const reviews = [];
      const reviewElements = document.querySelectorAll('.revRvwUserSec');
      reviewElements.forEach((review, index) => {
        if (index < 5) { // Limit to 5 reviews
          const reviewText = review.querySelector('.revRvwUserEntryComment')?.textContent.trim() || '';
          const author = review.querySelector('.revRvwUserEntryUserName')?.textContent.trim() || 'Anonymous';
          reviews.push({ author, text: reviewText });
        }
      });

      // Extract category
      const categoryElements = document.querySelectorAll('.breadcrumbs a');
      const categories = Array.from(categoryElements).map(a => a.textContent.trim()).filter(Boolean);
      const category = categories.length > 0 ? categories[categories.length - 1] : 'Uncategorized';
      
      return {
        title,
        price,
        description,
        images,
        ratings: { score: ratingValue || 0, count: countValue || 0 },
        reviews,
        category,
        tags: categories, // Using breadcrumbs as tags by default
      };
    });
    
    return {
      ...productData,
      source: 'rakuten',
      sourceUrl: productUrl,
    };
  } catch (error) {
    console.error(`Error extracting Rakuten product data: ${error.message}`);
    throw error;
  }
}

async function scrapeRakuten(keywordOrUrl) {
  console.log(`Scraping Rakuten for: ${keywordOrUrl}`);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-infobars',
      '--window-position=0,0',
      '--ignore-certifcate-errors',
      '--ignore-certifcate-errors-spki-list',
    ]
  });
  
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
      const productData = await extractRakutenProductData(page, keywordOrUrl);
      await browser.close();
      return [productData];
    } else {
      // If it's a keyword, search on Rakuten
      const searchUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(keywordOrUrl)}/`;
      await page.goto(searchUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for search results to load
      await page.waitForSelector('.searchresultitem, .dui-card', { timeout: 10000 }).catch(() => console.log('Search results not found'));
      
      // Extract product links from search results
      const productLinks = await page.evaluate(() => {
        const links = [];
        const products = document.querySelectorAll('.searchresultitem, .dui-card');
        
        products.forEach(product => {
          const linkElement = product.querySelector('a[href*="/item/"]');
          if (linkElement && linkElement.href) {
            links.push(linkElement.href);
          }
        });
        
        return links.slice(0, 5); // Limit to first 5 products
      });
      
      // Scrape each product
      const products = [];
      for (const link of productLinks) {
        try {
          const productData = await extractRakutenProductData(page, link);
          products.push(productData);
        } catch (error) {
          console.error(`Failed to scrape product ${link}: ${error.message}`);
        }
      }
      
      await browser.close();
      return products;
    }
  } catch (error) {
    console.error(`Rakuten scraping error: ${error.message}`);
    await browser.close();
    return [];
  }
}

async function scrapeProductData(keywordOrUrl, source) {
  let results = [];
  const isUrl = keywordOrUrl.startsWith('http://') || keywordOrUrl.startsWith('https://');

  // Basic URL detection to decide if it's a direct product page or search keyword
  // More sophisticated URL parsing would be needed for actual product pages

  if (source === 'amazon' || source === 'all') {
    const amazonResults = await scrapeAmazon(keywordOrUrl);
    results = results.concat(amazonResults);
  }
  if (source === 'rakuten' || source === 'all') {
    const rakutenResults = await scrapeRakuten(keywordOrUrl);
    results = results.concat(rakutenResults);
  }
  return results;
}

module.exports = {
  scrapeProductData,
};
