const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { scrapeRakuten } = require('../services/rakutenScraper');
const connectDB = require('../config/db');

// Add Product model import (assuming it exists)
const Product = require('../models/Product');

// Load env vars from root .env file
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Categories with their corresponding Rakuten search terms
const categories = [
  { name: "総合", searchTerm: "人気", icon: "🛍️" },
  { name: "ファッション", searchTerm: "ファッション", icon: "👕" },
  { name: "食品", searchTerm: "食品", icon: "🍎" },
  { name: "アウトドア・釣り・旅行用品", searchTerm: "アウトドア", icon: "🏕️" },
  { name: "ダイエット・健康グッズ", searchTerm: "健康", icon: "💪" },
  { name: "コスメ・美容・ヘアケア", searchTerm: "美容", icon: "💄" },
  { name: "スマホ・タブレット・パソコン", searchTerm: "デジタル", icon: "📱" },
  { name: "テレビ・オーディオ・カメラ", searchTerm: "家電", icon: "📺" },
  { name: "家電", searchTerm: "家電", icon: "🔌" },
  { name: "家具・インテリア用品", searchTerm: "インテリア", icon: "🪑" },
  { name: "花・ガーデニング用品", searchTerm: "ガーデニング", icon: "🌻" },
  { name: "キッチン・日用品・文具", searchTerm: "キッチン", icon: "🍴" },
  { name: "DIY・工具", searchTerm: "DIY", icon: "🔧" },
  { name: "ペット用品・生き物", searchTerm: "ペット", icon: "🐶" },
  { name: "楽器・手芸・コレクション", searchTerm: "趣味", icon: "🎸" },
  { name: "ゲーム・おもちゃ", searchTerm: "ゲーム", icon: "🎮" },
  { name: "ベビー・キッズ・マタニティ", searchTerm: "ベビー", icon: "👶" },
  { name: "スポーツ用品", searchTerm: "スポーツ", icon: "⚽" },
  { name: "車・バイク・自転車", searchTerm: "自動車", icon: "🚗" },
  { name: "CD・音楽ソフト", searchTerm: "音楽", icon: "🎵" },
  { name: "DVD・映像ソフト", searchTerm: "映像", icon: "📀" },
  { name: "本・雑誌・コミック", searchTerm: "本", icon: "📚" },
];

// Browser configuration for scraping
const browserConfig = {
  headless: process.env.NODE_ENV === 'production',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-web-security',
    '--lang=ja-JP'
  ]
};

// Delay function to avoid rate limiting
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Format time for logging
const formatTime = () => new Date().toISOString().replace('T', ' ').substring(0, 19);

// Main scraping function
const scrapeAllCategories = async () => {
  const startTime = Date.now();
  let totalProductsScraped = 0;
  let successfulCategories = 0;
  let failedCategories = 0;
  
  console.log(`\n🚀 [${formatTime()}] STARTING CATEGORY SCRAPING SCRIPT`);
  console.log(`📊 Total categories to process: ${categories.length}`);
  console.log(`🎯 Target products per category: 20`);
  console.log(`⏱️  Expected total time: ~${Math.ceil(categories.length * 2)} minutes\n`);

  try {
    await connectDB();
    console.log(`✅ [${formatTime()}] Database connected successfully\n`);

    // Process each category
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      const categoryStartTime = Date.now();
      
      console.log(`\n${'='.repeat(80)}`);
      console.log(`📦 [${formatTime()}] PROCESSING CATEGORY ${i + 1}/${categories.length}`);
      console.log(`${category.icon} Category: ${category.name}`);
      console.log(`🔍 Search term: ${category.searchTerm}`);
      console.log(`${'='.repeat(80)}\n`);

      try {
        // Scrape products for this category
        console.log(`🔄 [${formatTime()}] Starting scrape for "${category.name}"...`);
        
        const products = await scrapeRakuten(category.searchTerm, browserConfig);
        
        const categoryEndTime = Date.now();
        const categoryDuration = Math.round((categoryEndTime - categoryStartTime) / 1000);
        
        if (products && products.length > 0) {
          console.log(`✅ [${formatTime()}] Successfully scraped ${products.length} products from "${category.name}"`);
          console.log(`⏱️  Category scraping time: ${categoryDuration}s`);
          
          // Add category information to products
          const categorizedProducts = products.map(product => ({
            ...product,
            category: category.name,
            categoryIcon: category.icon,
            scrapedAt: new Date()
          }));
          
          // Log sample products
          console.log(`📋 Sample products from "${category.name}":`);
          categorizedProducts.slice(0, 3).forEach((product, index) => {
            console.log(`   ${index + 1}. ${product.title.substring(0, 60)}... - ${product.price}`);
          });
          
          // Save products to database
          try {
            console.log(`💾 [${formatTime()}] Saving ${categorizedProducts.length} products to database...`);
            const savedProducts = await Product.insertMany(categorizedProducts, { ordered: false });
            console.log(`✅ [${formatTime()}] Successfully saved ${savedProducts.length} products to database`);
          } catch (saveError) {
            // Handle duplicate key errors gracefully
            if (saveError.code === 11000) {
              const duplicateCount = saveError.writeErrors ? saveError.writeErrors.length : 0;
              const savedCount = categorizedProducts.length - duplicateCount;
              console.log(`⚠️  [${formatTime()}] Saved ${savedCount} new products (${duplicateCount} duplicates skipped)`);
            } else {
              console.error(`❌ [${formatTime()}] Error saving products to database:`, saveError.message);
              throw saveError; // Re-throw if it's not a duplicate error
            }
          }
          
          totalProductsScraped += products.length;
          successfulCategories++;
          
        } else {
          console.log(`⚠️  [${formatTime()}] No products found for "${category.name}"`);
          failedCategories++;
        }

      } catch (error) {
        const categoryEndTime = Date.now();
        const categoryDuration = Math.round((categoryEndTime - categoryStartTime) / 1000);
        
        console.error(`❌ [${formatTime()}] Error scraping "${category.name}":`, error.message);
        console.log(`⏱️  Failed after: ${categoryDuration}s`);
        failedCategories++;
        
        // Log error details for debugging
        if (error.stack) {
          console.error(`🔍 Error stack trace:`);
          console.error(error.stack.split('\n').slice(0, 5).join('\n'));
        }
      }

      // Progress update
      const remainingCategories = categories.length - (i + 1);
      const estimatedRemainingTime = Math.ceil(remainingCategories * 2);
      
      console.log(`\n📈 PROGRESS UPDATE:`);
      console.log(`   ✅ Completed: ${i + 1}/${categories.length} categories`);
      console.log(`   📦 Total products scraped: ${totalProductsScraped}`);
      console.log(`   ⏱️  Estimated remaining time: ${estimatedRemainingTime} minutes`);

      // Add delay between categories to avoid rate limiting
      if (i < categories.length - 1) {
        const delayTime = 5000; // 5 seconds
        console.log(`\n⏳ [${formatTime()}] Waiting ${delayTime/1000}s before next category...`);
        await delay(delayTime);
      }
    }

    // Final summary
    const totalTime = Math.round((Date.now() - startTime) / 1000);
    const averageProductsPerCategory = Math.round(totalProductsScraped / successfulCategories) || 0;
    
    console.log(`\n${'='.repeat(80)}`);
    console.log(`🎉 [${formatTime()}] SCRAPING COMPLETED!`);
    console.log(`${'='.repeat(80)}`);
    console.log(`📊 FINAL STATISTICS:`);
    console.log(`   ✅ Successful categories: ${successfulCategories}/${categories.length}`);
    console.log(`   ❌ Failed categories: ${failedCategories}/${categories.length}`);
    console.log(`   📦 Total products scraped: ${totalProductsScraped}`);
    console.log(`   📈 Average products per successful category: ${averageProductsPerCategory}`);
    console.log(`   ⏱️  Total execution time: ${Math.floor(totalTime / 60)}m ${totalTime % 60}s`);
    console.log(`   🚀 Success rate: ${Math.round((successfulCategories / categories.length) * 100)}%`);
    console.log(`${'='.repeat(80)}\n`);

    process.exit(0);

  } catch (error) {
    console.error(`\n💥 [${formatTime()}] CRITICAL ERROR:`, error.message);
    console.error('Script terminated unexpectedly.');
    process.exit(1);
  } finally {
    try {
      await mongoose.disconnect();
      console.log(`🔌 [${formatTime()}] Database connection closed.`);
    } catch (disconnectError) {
      console.error(`⚠️  [${formatTime()}] Error closing database connection:`, disconnectError.message);
    }
  }
};

// Handle process termination gracefully
process.on('SIGINT', async () => {
  console.log(`\n\n⏹️  [${formatTime()}] Received SIGINT. Gracefully shutting down...`);
  try {
    await mongoose.disconnect();
    console.log(`🔌 [${formatTime()}] Database connection closed.`);
  } catch (error) {
    console.error(`⚠️  [${formatTime()}] Error during shutdown:`, error.message);
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log(`\n\n⏹️  [${formatTime()}] Received SIGTERM. Gracefully shutting down...`);
  try {
    await mongoose.disconnect();
    console.log(`🔌 [${formatTime()}] Database connection closed.`);
  } catch (error) {
    console.error(`⚠️  [${formatTime()}] Error during shutdown:`, error.message);
  }
  process.exit(0);
});

// Start the scraping process
console.log(`🎯 [${formatTime()}] Initializing Rakuten category scraper...`);
scrapeAllCategories();
