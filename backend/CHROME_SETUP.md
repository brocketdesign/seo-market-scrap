# Chrome Setup for Web Scraping

This application uses Puppeteer for web scraping, which requires a Chrome or Chromium browser to be installed.

## Automatic Installation

Run the following command to install a compatible Chrome version:

```bash
npx puppeteer browsers install chrome
```

## Manual Installation Options

If the automatic installation doesn't work, you can:

1. Install Chrome on your system using the standard installer
2. Configure the app to use your existing Chrome installation

## Configuration

You can configure the path to Chrome in the admin settings interface under "Scraper Settings".

Common Chrome locations:
- Mac: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- Windows: `C:\Program Files\Google\Chrome\Application\chrome.exe`
- Linux: `/usr/bin/google-chrome`

## Troubleshooting

If you see errors about Chrome not being found, try:

1. Running `npx puppeteer browsers install chrome`
2. Setting the Chrome path explicitly in the settings
3. Installing Chrome manually on your system
