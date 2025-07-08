const Product = require('../models/Product');

// @desc    Get all products with pagination, sorting, and filtering
// @route   GET /api/products
// @access  Private (Admin only)
const getProducts = async (req, res) => {
  console.log('[ProductController] getProducts called with query:', req.query);
  
  try {
    // Prevent caching
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build filter object
    const filter = {};
    
    if (req.query.search) {
      // Text search if MongoDB text index is set up
      filter.$text = { $search: req.query.search };
    }
    
    if (req.query.source && req.query.source !== 'all') {
      filter.source = req.query.source;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) {
        filter.price.$gte = parseFloat(req.query.minPrice);
      }
      if (req.query.maxPrice) {
        filter.price.$lte = parseFloat(req.query.maxPrice);
      }
    }

    // Build sort object
    let sort = {};
    if (req.query.sort) {
      const [field, direction] = req.query.sort.split('_');
      sort[field] = direction === 'desc' ? -1 : 1;
    } else {
      sort = { scrapedAt: -1 }; // Default sort is newest first
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit);
      
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    
    const responseData = {
      products,
      totalProducts,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    };
    
    console.log('[ProductController] Sending response with:', {
      productsCount: products.length,
      totalProducts,
      currentPage: page,
      totalPages
    });
    
    res.json(responseData);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Private (Admin only)
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    
    // Check if error is due to invalid ObjectId
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching product.' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = async (req, res) => {
  try {
    const {
      title,
      price,
      description,
      images,
      category,
      tags,
      metaTitle,
      metaDescription,
      keywords,
    } = req.body;
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    // Update fields
    if (title) product.title = title;
    if (price) product.price = price;
    if (description) product.description = description;
    if (images) product.images = images;
    if (category) product.category = category;
    if (tags) product.tags = tags;
    if (metaTitle) product.metaTitle = metaTitle;
    if (metaDescription) product.metaDescription = metaDescription;
    if (keywords) product.keywords = keywords;

    // Update timestamp
    product.lastUpdatedAt = Date.now();

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({ 
        message: 'Validation Error', 
        errors: error.errors 
      });
    }
    
    res.status(500).json({ message: 'Server error while updating product.' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    console.error('Error deleting product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).json({ message: 'Server error while deleting product.' });
  }
};

// @desc    Get product statistics
// @route   GET /api/products/stats
// @access  Private (Admin only)
const getProductStats = async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments();
    
    const sourceStats = await Product.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } }
    ]);
    
    const categoryStats = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get recently added products count (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentlyAdded = await Product.countDocuments({ 
      scrapedAt: { $gte: thirtyDaysAgo } 
    });
    
    res.json({
      totalProducts,
      sourceStats,
      categoryStats,
      recentlyAdded
    });
  } catch (error) {
    console.error('Error fetching product stats:', error);
    res.status(500).json({ message: 'Server error while fetching product statistics.' });
  }
};

// @desc    Get products for public display with pagination, sorting, and filtering
// @route   GET /api/products/public
// @access  Public
const getPublicProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    
    // Build filter object for public products 
    // We're making sure we only return products that should be visible
    const filter = {};
    
    if (req.query.search) {
      filter.title = { $regex: req.query.search, $options: 'i' };
    }
    
    if (req.query.source && req.query.source !== 'all') {
      filter.source = req.query.source;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.tag) {
      filter.tags = req.query.tag;
    }

    // Filter by content language
    if (req.query.contentLanguage) {
      filter.contentLanguage = req.query.contentLanguage;
    }

    // Debug: log the filter to see what is being sent to MongoDB
    console.log('Public products filter:', filter);

    // Build sort object
    let sort = {};
    if (req.query.sort) {
      if (req.query.sort === 'featured') {
        // Featured products would typically have a specific field or logic
        // For now, just use newest as featured
        sort = { scrapedAt: -1 };
      } else if (req.query.sort === 'newest') {
        sort = { scrapedAt: -1 };
      } else if (req.query.sort === 'price_asc') {
        // Note: This assumes price is stored as a number, not a string
        // You might need to convert string prices to numbers in your schema
        sort = { price: 1 };
      } else if (req.query.sort === 'price_desc') {
        sort = { price: -1 };
      } else if (req.query.sort === 'rating') {
        sort = { 'ratings.value': -1 };
      }
    } else {
      // Default sort
      sort = { scrapedAt: -1 };
    }

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('title price description images ratings source sourceUrl category tags scrapedAt'); // Select only needed fields

    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);
    
    res.json({
      products,
      totalProducts,
      totalPages,
      currentPage: page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1
    });
  } catch (error) {
    console.error('Error fetching public products:', error);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
};

// @desc    Get a single public product
// @route   GET /api/products/public/:id
// @access  Public
const getPublicProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .select('title price description images ratings reviews source sourceUrl category tags scrapedAt lastUpdatedAt language');
    
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching public product:', error);
    
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Product not found' });
    }
    
    res.status(500).json({ message: 'Server error while fetching product.' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  getProductStats,
  getPublicProducts,
  getPublicProductById
};
