const puppeteer = require('puppeteer');

class SimpleiPhoneMonitor {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async init() {
    try {
      console.log('🚀 Starting Simple iPhone 17 Monitor...');
      
      // Launch browser without extension
      this.browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
        args: [
          '--start-maximized',
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--no-first-run',
          '--no-default-browser-check'
        ]
      });

      // Get all pages
      const pages = await this.browser.pages();
      this.page = pages[0] || await this.browser.newPage();

      // Set user agent
      await this.page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

      console.log('✅ Browser launched successfully');
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
      console.log('📋 Please manually install the extension:');
      console.log('   1. Go to chrome://extensions/');
      console.log('   2. Enable "Developer mode"');
      console.log('   3. Click "Load unpacked"');
      console.log('   4. Select this project folder');
      console.log('   5. The extension will start working automatically');
      
      return true;
    } catch (error) {
      console.error('❌ Failed to navigate to iPhone 17 page:', error);
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

      // Navigate to iPhone 17 page
      await this.navigateToiPhone17();

      console.log('🎉 Simple iPhone 17 Monitor is running!');
      console.log('📋 After installing the extension, it will automatically:');
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
  global.monitor = new SimpleiPhoneMonitor();
  await global.monitor.run();
}

// Run if this file is executed directly
if (require.main === module) {
  start().catch(console.error);
}

module.exports = SimpleiPhoneMonitor;
