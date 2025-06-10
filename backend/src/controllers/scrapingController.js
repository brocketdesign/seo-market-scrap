const Product = require('../models/Product');
const { scrapeProductData } = require('../services/scraperService');

// @desc    Manually scrape products based on keyword/URL and source
// @route   POST /api/scrape/manual
// @access  Private (Admin only)
const manualScrape = async (req, res) => {
  const { keywordOrUrl, source } = req.body; // source can be 'amazon', 'rakuten', or 'all'

  if (!keywordOrUrl || !source) {
    return res.status(400).json({ message: 'Keyword/URL and source are required' });
  }

  try {
    const scrapedProducts = await scrapeProductData(keywordOrUrl, source);
    
    if (scrapedProducts.length === 0) {
      return res.status(404).json({ message: 'No products found for the given criteria.' });
    }

    // For now, just return the scraped data. 
    // Later, you might want to add a step to preview and then save.
    res.json(scrapedProducts);

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ message: 'Server error during scraping process.' });
  }
};

// @desc    Save a scraped product to the database
// @route   POST /api/scrape/save
// @access  Private (Admin only)
const saveScrapedProduct = async (req, res) => {
  // Expects a single product object in the request body
  const productData = req.body;

  if (!productData || typeof productData !== 'object' || !productData.title || !productData.source) {
    return res.status(400).json({ message: 'Valid product data is required.' });
  }

  try {
    // Add additional processing or validation if needed
    // Check for duplicates before saving using sourceUrl instead of url
    const existingProduct = await Product.findOne({ sourceUrl: productData.sourceUrl, source: productData.source });
    if (existingProduct) {
      return res.status(409).json({ message: 'Product already exists in the database.', productId: existingProduct._id });
    }

    let contentLanguage = productData.contentLanguage || 'english'; // Default to English if not specified
    if (contentLanguage === 'ja') {
      contentLanguage = 'japanese';
    } else if (contentLanguage === 'en') {
      contentLanguage = 'english';
    }
    
    // Safety check for all string fields before processing
    // This prevents substring errors on undefined values
    const safeString = (str) => typeof str === 'string' ? str : '';
    
    // Sanitize product data before saving
    const sanitizedProduct = {
      title: safeString(productData.title),
      description: safeString(productData.description),
      price: safeString(productData.price),
      source: safeString(productData.source),
      sourceUrl: safeString(productData.sourceUrl),
      category: safeString(productData.category),
      contentLanguage: safeString(productData.contentLanguage || 'japanese'), // Default to japanese for Rakuten
      tags: Array.isArray(productData.tags) ? productData.tags.map(safeString) : [],
      images: Array.isArray(productData.images) ? productData.images.filter(img => typeof img === 'string') : [],
      ratings: {
        score: typeof productData.ratings?.score === 'number' ? productData.ratings.score : 0,
        count: typeof productData.ratings?.count === 'number' ? productData.ratings.count : 0
      },
      reviews: Array.isArray(productData.reviews) ? productData.reviews.map(review => ({
        author: safeString(review.author),
        text: safeString(review.text),
        rating: typeof review.rating === 'number' ? review.rating : 5
      })) : []
    };
    
    // Create a new product with the sanitized data
    const product = new Product(sanitizedProduct);
    await product.save();
    
    res.status(201).json(product);

  } catch (error) {
    console.error('Error saving product:', error);
    // Check for Mongoose validation errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    res.status(500).json({ message: 'Server error while saving product.' });
  }
};

module.exports = {
  manualScrape,
  saveScrapedProduct,
};
