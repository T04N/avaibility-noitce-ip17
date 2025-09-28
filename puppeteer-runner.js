const puppeteer = require('puppeteer');
const path = require('path');

class AppleiPhoneMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
    this.extensionPath = path.join(__dirname);
  }

  async init() {
    try {
      console.log('🚀 Starting Apple iPhone 17 Monitor with Puppeteer...');
      
      // Launch browser with extension
      this.browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          `--load-extension=${this.extensionPath}`,
          '--disable-extensions-except=' + this.extensionPath,
          '--disable-dev-shm-usage',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-gpu',
          '--disable-dev-tools',
          '--no-first-run',
          '--no-default-browser-check',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding'
        ],
        ignoreDefaultArgs: ['--disable-extensions'],
        timeout: 60000
      });

      // Get all pages
      const pages = await this.browser.pages();
      this.page = pages[0] || await this.browser.newPage();

      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log('✅ Browser launched successfully with extension loaded');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize browser:', error);
      return false;
    }
  }

  async navigateToiPhone17() {
    try {
      console.log('📱 Navigating to iPhone 17 page...');
      
      const url = 'https://www.apple.com/jp/shop/buy-iphone/iphone-17';
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      console.log('✅ Successfully navigated to iPhone 17 page');
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate to iPhone 17 page:', error);
      return false;
    }
  }

  async navigateToiPhone17Pro() {
    try {
      console.log('📱 Navigating to iPhone 17 Pro page...');
      
      const url = 'https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro';
      await this.page.goto(url, { 
        waitUntil: 'networkidle2',
        timeout: 30000 
      });

      console.log('✅ Successfully navigated to iPhone 17 Pro page');
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate to iPhone 17 Pro page:', error);
      return false;
    }
  }

  async waitForExtension() {
    try {
      console.log('⏳ Waiting for extension to load...');
      
      // Wait for extension to be ready
      await this.page.waitForFunction(() => {
        return window.chrome && window.chrome.runtime;
      }, { timeout: 10000 });

      console.log('✅ Extension is ready');
      return true;
    } catch (error) {
      console.error('❌ Extension not ready:', error);
      return false;
    }
  }

  async monitorConsole() {
    try {
      console.log('👂 Monitoring console logs...');
      
      this.page.on('console', msg => {
        const type = msg.type();
        const text = msg.text();
        
        // Color code console messages
        const colors = {
          'log': '\x1b[36m',    // Cyan
          'info': '\x1b[32m',   // Green
          'warn': '\x1b[33m',   // Yellow
          'error': '\x1b[31m',  // Red
          'debug': '\x1b[35m'   // Magenta
        };
        
        const color = colors[type] || '\x1b[37m'; // White
        const reset = '\x1b[0m';
        
        console.log(`${color}[${type.toUpperCase()}]${reset} ${text}`);
      });

      console.log('✅ Console monitoring started');
      return true;
    } catch (error) {
      console.error('❌ Failed to start console monitoring:', error);
      return false;
    }
  }

  async run() {
    try {
      // Initialize browser
      const initSuccess = await this.init();
      if (!initSuccess) {
        throw new Error('Failed to initialize browser');
      }

      // Start console monitoring
      await this.monitorConsole();

      // Wait for extension to load
      await this.waitForExtension();

      // Navigate to iPhone 17 page
      await this.navigateToiPhone17();

      console.log('🎉 Apple iPhone 17 Monitor is running!');
      console.log('📋 Extension will automatically:');
      console.log('   • Select Lavender color');
      console.log('   • Select 256GB capacity');
      console.log('   • Select no trade-in');
      console.log('   • Select SIM-free');
      console.log('   • Select full price payment');
      console.log('   • Select no AppleCare+');
      console.log('   • Check store availability');
      console.log('   • Auto-close any popups');
      console.log('   • Reload page every 12 seconds');
      console.log('');
      console.log('🔄 Press Ctrl+C to stop monitoring');

      // Keep the browser open
      await new Promise(() => {});

    } catch (error) {
      console.error('❌ Monitor failed:', error);
      await this.cleanup();
    }
  }

  async cleanup() {
    try {
      if (this.browser) {
        console.log('🧹 Cleaning up...');
        await this.browser.close();
        console.log('✅ Browser closed');
      }
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down monitor...');
  if (global.monitor) {
    await global.monitor.cleanup();
  }
  process.exit(0);
});

// Start the monitor
async function start() {
  global.monitor = new AppleiPhoneMonitor();
  await global.monitor.run();
}

// Run if this file is executed directly
if (require.main === module) {
  start().catch(console.error);
}

module.exports = AppleiPhoneMonitor;
