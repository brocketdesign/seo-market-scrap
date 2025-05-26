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
    
    const newProduct = new Product({
      ...productData,
      contentLanguage,
      // Ensure all required fields from ProductSchema are present or have defaults
      // category and tags might need to be derived or set manually later
      category: productData.category || 'Uncategorized', 
      tags: productData.tags || [],
      // SEO fields can be auto-generated or set manually
      seoTitle: productData.seoTitle || productData.title,
      seoDescription: productData.seoDescription || productData.description.substring(0, 160),
      seoKeywords: productData.seoKeywords || productData.title.split(' '),
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);

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
