/**
 * Chrome Installation Helper
 * 
 * This script attempts to install Chrome for Puppeteer to use.
 */

console.log('Starting Chrome installation for web scraping...');

async function installChrome() {
  try {
    console.log('Attempting to install Chrome via puppeteer...');
    const { execSync } = require('child_process');
    execSync('npx puppeteer browsers install chrome', { stdio: 'inherit' });
    console.log('✅ Chrome installation completed successfully');
  } catch (error) {
    console.error('❌ Chrome installation failed:', error.message);
    console.log('\nTrying alternative installation method...');
    
    try {
      const puppeteer = require('puppeteer');
      console.log('Installing Chrome via puppeteer import...');
      console.log('This may take a few minutes...');
      // Force puppeteer to download Chrome
      await puppeteer.launch({ headless: true }).then(browser => browser.close());
      console.log('✅ Chrome installation completed successfully');
    } catch (secondError) {
      console.error('❌ Alternative installation also failed:', secondError.message);
      console.log('\nPlease install Chrome manually and set the path in your scraper settings.');
    }
  }
}

installChrome().catch(console.error);
