const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: String, // Storing as string to accommodate various formats/currencies initially
    required: true,
  },
  description: {
    type: String,
    trim: true,
  },
  images: [
    {
      type: String, // URLs to the images
    },
  ],
  ratings: {
    // Aggregate rating value, e.g., 4.5
    score: { type: Number, min: 0, max: 5, default: 0 },
    count: { type: Number, default: 0 }, // Number of reviews/ratings
  },
  // Store shop/seller information
  shop: {
    type: String,
    trim: true,
  },
  // Store shipping info
  shipping: {
    type: String,
    trim: true,
  },
  // Store points information
  points: {
    type: String,
    trim: true,
  },
  source: {
    type: String, // e.g., 'Amazon', 'Rakuten'
    required: true,
  },
  sourceProductId: {
    type: String, // Product ID on the source platform
    unique: true,
    sparse: true, // Allows multiple nulls if not all products have it, but unique if present
  },
  sourceUrl: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    trim: true,
  },
  tags: [
    {
      type: String,
      trim: true,
    },
  ],
  // SEO specific fields
  metaTitle: String,
  metaDescription: String,
  metaKeywords: [String],
  seoTitle: String,
  seoDescription: String,
  seoKeywords: [String],
  // Tracking
  scrapedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  language: {
    type: String,
    trim: true,
    default: 'english',  // Default to English if not specified
  },
  contentLanguage: {
    type: String,
    trim: true,
    default: 'japanese', // Default to Japanese for Rakuten
  },
  // You might want to add fields for stock status, variations, etc.
});

ProductSchema.index(
  { 
    title: 'text', 
    description: 'text', 
    tags: 'text', 
    category: 'text',
    seoTitle: 'text',
    seoDescription: 'text',
    seoKeywords: 'text',
    metaTitle: 'text',
    metaDescription: 'text',
    metaKeywords: 'text'
  },
  { default_language: 'english' }
);
ProductSchema.index({ source: 1, sourceProductId: 1 }, { unique: true, partialFilterExpression: { sourceProductId: { $exists: true } } });

module.exports = mongoose.model('Product', ProductSchema);
