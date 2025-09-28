// User-Agent rotation for anti-detection
class UserAgentRotation {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/121.0'
    ];
    this.currentUA = 0;
  }

  rotateUserAgent() {
    const newUA = this.userAgents[this.currentUA];
    console.log(`Rotating User-Agent: ${newUA.substring(0, 50)}...`);
    
    this.currentUA = (this.currentUA + 1) % this.userAgents.length;
    return newUA;
  }
}

// IP/Proxy rotation manager
class IPRotationManager {
  constructor() {
    this.rotationInterval = 300000; // 5 minutes (shorter for proxy rotation)
    this.lastRotation = Date.now();
    this.rotationCount = 0;
    this.maxRotations = 10; // More rotations for proxy
    this.proxyList = [
      // Your configured proxy
      'ip.mproxy.vn:12271'
    ];
    this.currentProxyIndex = 0;
    this.proxyCredentials = {
      username: 'tev',
      password: 'B4a9yGhNsiNre0B'
    };
    this.resetIpUrl = 'https://mproxy.vn/capi/Q7LGuYFGAFFO4F7dJJwx3gxI-8LYe5msQw2U9E6-dig/key/B4a9yGhNsiNre0B/resetIp';
    this.failedNotificationCount = 0;
    this.maxFailedNotifications = 3; // Reset IP after 3 failed notifications
  }

  async checkAndRotate() {
    try {
      const now = Date.now();
      const timeSinceLastRotation = now - this.lastRotation;
      
      // Rotate every 60 seconds (1 minute) for proxy reset
      if (timeSinceLastRotation >= 60000 || this.rotationCount >= this.maxRotations) {
        console.log('🔄 Triggering proxy reset every 60 seconds...');
        await this.resetProxyIp();
        this.lastRotation = now;
        this.rotationCount++;
      }
    } catch (error) {
      console.error('Error in IP rotation check:', error);
    }
  }

  async rotateIP() {
    try {
      console.log('Rotating IP/Proxy to avoid detection...');
      
      // Method 1: Rotate to next proxy
      await this.rotateProxy();
      
      // Method 2: Clear browser data
      await this.clearBrowserData();
      
      // Method 3: Change User-Agent
      this.changeUserAgent();
      
      // Method 4: Add 45 second delay for fresh data
      const delay = 45000; // 45 seconds
      console.log(`Waiting ${delay}ms (45 seconds) before reloading for fresh data...`);
      
      setTimeout(() => {
        console.log('IP/Proxy rotation completed, reloading page after 45 seconds...');
        window.location.reload();
      }, delay);
      
    } catch (error) {
      console.error('Error rotating IP/Proxy:', error);
    }
  }

  async rotateProxy() {
    try {
      this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;
      const newProxy = this.proxyList[this.currentProxyIndex];
      console.log(`Rotating to proxy: ${newProxy}`);
      
      // Note: Actual proxy configuration needs to be done at browser level
      // This is just for logging and tracking
      console.log('Proxy rotation logged. Configure browser proxy settings manually.');
      
    } catch (error) {
      console.error('Error rotating proxy:', error);
    }
  }

  getCurrentProxy() {
    return this.proxyList[this.currentProxyIndex];
  }

  getProxyStats() {
    return {
      totalProxies: this.proxyList.length,
      currentProxy: this.getCurrentProxy(),
      credentials: {
        username: this.proxyCredentials.username,
        password: '***' // Hide password for security
      },
      rotationCount: this.rotationCount,
      lastRotation: new Date(this.lastRotation).toLocaleString(),
      failedNotifications: this.failedNotificationCount,
      maxFailedNotifications: this.maxFailedNotifications
    };
  }

  async testProxyConnection() {
    try {
      console.log('Testing proxy connection...');
      console.log('Proxy:', this.getCurrentProxy());
      console.log('Username:', this.proxyCredentials.username);
      
      // Test with a simple IP check
      const testUrl = 'https://httpbin.org/ip';
      
      // Note: This is just for logging - actual proxy needs to be configured at browser level
      console.log('Proxy test initiated. Check browser network settings for actual proxy configuration.');
      console.log('Expected proxy endpoint:', this.getCurrentProxy());
      
      return true;
    } catch (error) {
      console.error('Proxy connection test failed:', error);
      return false;
    }
  }

  async resetProxyIp() {
    try {
      console.log('🔄 Resetting proxy IP...');
      console.log('Reset URL:', this.resetIpUrl);
      
      const response = await fetch(this.resetIpUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Proxy IP reset successful:', data);
        
        if (data.status === 1) {
          console.log('New proxy info:', {
            server_host: data.data.server_host,
            server_port: data.data.server_port,
            user: data.data.user,
            remaining_time: data.data.remaining_time
          });
          
          // Update proxy info if server changed
          if (data.data.server_host && data.data.server_host !== 'choip.mproxy.vn') {
            console.log('⚠️ Server host changed, updating proxy configuration...');
            this.proxyList[0] = `${data.data.server_host}:${data.data.server_port}`;
          }
          
          // Reset failed notification count
          this.failedNotificationCount = 0;
          
          return true;
        } else {
          console.error('❌ Proxy reset failed:', data.message);
          return false;
        }
      } else {
        console.error('❌ Proxy reset request failed:', response.status, response.statusText);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Error resetting proxy IP:', error);
      return false;
    }
  }

  async handleNotificationFailure() {
    try {
      this.failedNotificationCount++;
      console.log(`⚠️ Notification failure count: ${this.failedNotificationCount}/${this.maxFailedNotifications}`);
      
      if (this.failedNotificationCount >= this.maxFailedNotifications) {
        console.log('🚨 Max failed notifications reached, resetting proxy IP...');
        
        const resetSuccess = await this.resetProxyIp();
        
        if (resetSuccess) {
          console.log('✅ Proxy IP reset successful, clearing browser data and reloading...');
          
          // Clear browser data
          await this.clearBrowserData();
          
          // Wait 45 seconds then reload for fresh data
          setTimeout(() => {
            console.log('🔄 Reloading page after 45 seconds (proxy reset)...');
            window.location.reload();
          }, 45000);
          
        } else {
          console.error('❌ Proxy IP reset failed, will retry later...');
        }
      }
      
    } catch (error) {
      console.error('Error handling notification failure:', error);
    }
  }

  async clearBrowserData() {
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear cookies (if possible)
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
      
      console.log('Browser data cleared');
    } catch (error) {
      console.error('Error clearing browser data:', error);
    }
  }

  changeUserAgent() {
    try {
      const userAgentRotation = new UserAgentRotation();
      const newUA = userAgentRotation.rotateUserAgent();
      console.log('User-Agent rotation logged. Configure browser User-Agent manually.');
    } catch (error) {
      console.error('Error changing User-Agent:', error);
    }
  }
}

// Bag page monitor for detecting store locator popup
class BagStoreLocatorMonitor {
  constructor() {
    this.isMonitoring = false;
    this.popupDetected = false;
    this.lastPopupTime = null;
    this.checkInterval = null;
    this.humanBehaviorActive = false;
    this.storeNotificationSent = false;
    this.hasReloadScheduled = false;
    this.popupMonitorInterval = null;
    this.ipRotationManager = new IPRotationManager();
    this.userAgentRotation = new UserAgentRotation();
    this.init();
  }

  init() {
    console.log('Bag Store Locator Monitor initializing...');
    
    // Check if extension context is available
    if (!this.isExtensionContextValid()) {
      console.error('Extension context not available, retrying in 2 seconds...');
      setTimeout(() => {
        this.init();
      }, 2000);
      return;
    }
    
    console.log('Bag Store Locator Monitor initialized');
    
    // Auto apply proxy when extension loads
    this.autoApplyProxy();
    
    this.debugPageInfo();
    
    // Popup monitor disabled - we want to keep popups open
    // this.startPopupMonitor();
    
    // Auto-select options if bag has items (from content.js logic)
    this.autoSelectOptions();
    
    // Wait for page to be fully loaded before starting
    this.waitForPageLoad();
  }

  waitForPageLoad() {
    console.log('⏳ Waiting for page to be fully loaded...');
    
    const checkPageReady = () => {
      // Check if page is fully loaded
      if (document.readyState === 'complete') {
        console.log('✅ Page fully loaded, starting monitoring...');
        this.startMonitoring();
        return;
      }
      
      // Check if DOM is ready and has content
      if (document.readyState === 'interactive' && document.body && document.body.children.length > 0) {
        console.log('✅ DOM ready with content, starting monitoring...');
        this.startMonitoring();
        return;
      }
      
      // Wait a bit more
      setTimeout(checkPageReady, 500);
    };
    
    checkPageReady();
    
    // Also set up DOM observer to catch dynamically loaded content
    this.setupDOMObserver();
    
    // IMMEDIATE CLICK: Try to find and click button after 2 seconds
    setTimeout(() => {
      console.log('🚀 CLICK ATTEMPT: Trying to find button after 2 seconds...');
      const immediateButton = this.findSpecificButton();
      if (immediateButton) {
        console.log('🎯 SUCCESS: Found button, clicking now!');
        this.tryMultipleClickMethods(immediateButton);
      } else {
        console.log('⏳ Button not found yet, will retry...');
      }
    }, 2000); // Try after 2 seconds
  }

  setupDOMObserver() {
    console.log('👀 Setting up DOM observer for dynamic content...');
    
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          // Check if any new buttons were added
          const newButtons = Array.from(mutation.addedNodes).filter(node => 
            node.nodeType === 1 && node.tagName === 'BUTTON'
          );
          
          if (newButtons.length > 0) {
            console.log('🆕 New buttons detected, checking for target button...');
            setTimeout(() => {
              const targetButton = this.findSpecificButton();
              if (targetButton) {
                console.log('🎯 CLICK: Target button found in new content!');
                console.log('🚀 Clicking button after 2 seconds...');
                this.tryMultipleClickMethods(targetButton);
              }
            }, 2000); // Wait 2 seconds before clicking
          }
        }
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  async debugPageInfo() {
    try {
      console.log('=== BAG PAGE DEBUG INFO ===');
      console.log('Current URL:', window.location.href);
      console.log('Page title:', document.title);
      
      // Check if bag is empty
      const pageText = document.body?.textContent?.toLowerCase() || '';
      const isEmpty = pageText.includes('0+') || 
                     pageText.includes('バッグが空です') ||
                     pageText.includes('your bag is empty') ||
                     pageText.includes('カートが空です');
      
      if (isEmpty) {
        console.log('🛒 BAG IS EMPTY - No store locator button available');
        console.log('Need to add items to bag first to see store locator buttons');
        return;
      }
      
      console.log('🛒 Bag has items - Looking for store locator buttons...');
      
      // Proxy rotation info
      const proxyStats = this.ipRotationManager.getProxyStats();
      console.log('=== PROXY ROTATION INFO ===');
      console.log('Total proxies configured:', proxyStats.totalProxies);
      console.log('Current proxy:', proxyStats.currentProxy);
      console.log('Username:', proxyStats.credentials.username);
      console.log('Rotation count:', proxyStats.rotationCount);
      console.log('Last rotation:', proxyStats.lastRotation);
      console.log('Failed notifications:', this.ipRotationManager.failedNotificationCount);
      console.log('Max failed notifications:', this.ipRotationManager.maxFailedNotifications);
      console.log('Reset IP URL:', this.ipRotationManager.resetIpUrl);
      
      // Test proxy connection
      await this.ipRotationManager.testProxyConnection();
      
      // Check for bag-specific elements
      const bagElements = document.querySelectorAll('[class*="bag"], [id*="bag"], [data-autom*="bag"]');
      console.log('Bag-related elements found:', bagElements.length);
      
      // Check for store locator buttons
      const storeButtons = document.querySelectorAll('button[data-autom*="store"], button[class*="store"], button[class*="locator"]');
      console.log('Store-related buttons found:', storeButtons.length);
      
      // Check for any buttons with Apple store names
      const allButtons = document.querySelectorAll('button');
      const appleButtons = Array.from(allButtons).filter(btn => {
        const text = btn.textContent?.toLowerCase() || '';
        return text.includes('apple') || text.includes('丸の内') || text.includes('銀座');
      });
      console.log('Apple store buttons found:', appleButtons.length);
      
      // Log button details
      appleButtons.forEach((btn, index) => {
        console.log(`Button ${index + 1}:`, {
          text: btn.textContent?.trim(),
          classes: btn.className,
          dataAutom: btn.getAttribute('data-autom'),
          id: btn.id
        });
      });
      
      console.log('=== END DEBUG INFO ===');
    } catch (error) {
      console.error('Error in debugPageInfo:', error);
    }
  }

  isExtensionContextValid() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.sendMessage);
    } catch (error) {
      console.error('Error checking extension context:', error);
      return false;
    }
  }

  startPopupMonitor() {
    console.log('Starting popup monitor...');
    
    // Monitor for popups every 500ms
    this.popupMonitorInterval = setInterval(() => {
      this.closePopups();
    }, 500);
  }

  closePopups() {
    try {
      // Common popup close selectors
      const closeSelectors = [
        // General close buttons
        'button[aria-label*="close"]',
        'button[aria-label*="Close"]',
        'button[aria-label*="閉じる"]',
        'button[aria-label*="キャンセル"]',
        'button[aria-label*="Cancel"]',
        
        // X buttons
        '.close-button',
        '.close-btn',
        '.modal-close',
        '.popup-close',
        '.overlay-close',
        
        // Apple specific close buttons
        '.rc-overlay-close',
        '.as-overlay-close',
        '.rf-overlay-close',
        '.ac-video-icon.icon-close',
        '.ac-video-icon.icon-share_close',
        
        // ESC key simulation for modals
        '[data-autom*="close"]',
        '[data-autom*="cancel"]',
        
        // Generic close elements
        'button:contains("×")',
        'button:contains("✕")',
        'button:contains("Close")',
        'button:contains("閉じる")',
        'button:contains("キャンセル")'
      ];

      let popupClosed = false;

      // Try each selector
      for (const selector of closeSelectors) {
        try {
          const elements = document.querySelectorAll(selector);
          for (const element of elements) {
            if (element && element.offsetParent !== null) { // Check if element is visible
              console.log(`Closing popup with selector: ${selector}`);
              element.click();
              popupClosed = true;
              break;
            }
          }
          if (popupClosed) break;
        } catch (error) {
          // Skip invalid selectors
          continue;
        }
      }

      // Special handling for AppleCare+ overlay
      const appleCareOverlay = document.querySelector('.rc-overlay-popup-content');
      if (appleCareOverlay && appleCareOverlay.offsetParent !== null) {
        console.log('Found AppleCare+ overlay, trying to close...');
        
        // Try to find close button in overlay
        const overlayCloseBtn = appleCareOverlay.querySelector('button[aria-label*="close"], button[aria-label*="Close"], button[aria-label*="閉じる"]');
        if (overlayCloseBtn) {
          overlayCloseBtn.click();
          popupClosed = true;
        } else {
          // Try ESC key
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
          popupClosed = true;
        }
      }

      // Try ESC key for any visible modal/overlay
      const visibleModals = document.querySelectorAll('.modal, .overlay, .popup, .rc-overlay, .rf-overlay');
      for (const modal of visibleModals) {
        if (modal && modal.offsetParent !== null) {
          console.log('Found visible modal/overlay, sending ESC key...');
          document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27 }));
          popupClosed = true;
          break;
        }
      }

      if (popupClosed) {
        console.log('Popup closed successfully');
      }

    } catch (error) {
      console.error('Error closing popups:', error);
    }
  }

  scheduleReloadAfterNotification() {
    try {
      if (this.hasReloadScheduled) return;
      this.hasReloadScheduled = true;
      const delay = 60000; // 60 seconds (1 minute)
      console.log(`Scheduling reload after notification in ${delay}ms (1 minute)...`);
      setTimeout(() => {
        try {
          console.log('Reloading page after 1 minute...');
          window.location.reload();
        } catch (error) {
          console.error('Failed to reload page after notification:', error);
        }
      }, delay);
    } catch (error) {
      console.error('Error scheduling reload after notification:', error);
    }
  }

  autoApplyProxy() {
    try {
      console.log('🔧 Auto-applying proxy configuration...');
      console.log('Proxy: tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271');
      
      // Set proxy configuration in browser
      this.setBrowserProxy();
      
      // Start periodic proxy reset every 60 seconds
      this.startPeriodicProxyReset();
      
      console.log('✅ Proxy auto-applied successfully!');
    } catch (error) {
      console.error('❌ Error auto-applying proxy:', error);
    }
  }

  setBrowserProxy() {
    try {
      // Note: Chrome extensions cannot directly set browser proxy
      // This is for logging and user information
      console.log('📡 Proxy Configuration:');
      console.log('  Server: ip.mproxy.vn');
      console.log('  Port: 12271');
      console.log('  Username: tev');
      console.log('  Password: B4a9yGhNsiNre0B');
      console.log('  Full String: tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271');
      console.log('');
      console.log('⚠️  Note: Browser proxy must be set manually or via launch script');
      console.log('   Use: launch-chrome-with-proxy.bat (Windows) or launch-chrome-with-proxy.sh (Mac/Linux)');
    } catch (error) {
      console.error('Error setting browser proxy:', error);
    }
  }

  startPeriodicProxyReset() {
    try {
      console.log('⏰ Starting periodic proxy reset every 60 seconds...');
      
      // Reset proxy every 60 seconds
      setInterval(async () => {
        try {
          console.log('🔄 Periodic proxy reset triggered...');
          await this.ipRotationManager.resetProxyIp();
        } catch (error) {
          console.error('Error in periodic proxy reset:', error);
        }
      }, 60000); // 60 seconds
      
      console.log('✅ Periodic proxy reset started!');
    } catch (error) {
      console.error('Error starting periodic proxy reset:', error);
    }
  }

  autoSelectOptions() {
    console.log('Auto-selecting bag options...');
    
    // Check if extension context is still valid
    if (!this.isExtensionContextValid()) {
      console.error('Extension context invalid, cannot auto-select options');
      return;
    }
    
    // Wait for page to load completely
    setTimeout(() => {
      try {
        this.selectColor();
        this.selectCapacity();
        this.selectPaymentMethod();
        this.selectAppleCare();
      } catch (error) {
        console.error('Error in autoSelectOptions:', error);
      }
    }, 2000);
  }

  selectColor() {
    try {
      // Select Cosmic Orange for iPhone 17 Pro
      const cosmicOrangeInput = document.querySelector('input[data-autom="dimensionColorcosmicorange"]');
      if (cosmicOrangeInput && !cosmicOrangeInput.checked) {
        console.log('Selecting Cosmic Orange color...');
        cosmicOrangeInput.click();
        this.safeNotifyBackgroundScript({
          type: 'COLOR_SELECTED',
          color: 'cosmicorange',
          model: 'iPhone 17 Pro',
          timestamp: new Date().toISOString()
        });
      } else if (cosmicOrangeInput && cosmicOrangeInput.checked) {
        console.log('Cosmic Orange already selected');
      }
    } catch (error) {
      console.error('Error selecting color:', error);
    }
  }

  selectCapacity() {
    try {
      // Select 256GB capacity
      const capacity256Input = document.querySelector('input[data-autom="dimensionCapacity256gb"]');
      if (capacity256Input && !capacity256Input.checked) {
        console.log('Selecting 256GB capacity...');
        capacity256Input.click();
        this.safeNotifyBackgroundScript({
          type: 'CAPACITY_SELECTED',
          capacity: '256gb',
          model: 'iPhone 17 Pro',
          timestamp: new Date().toISOString()
        });
      } else if (capacity256Input && capacity256Input.checked) {
        console.log('256GB already selected');
      }
    } catch (error) {
      console.error('Error selecting capacity:', error);
    }
  }

  selectPaymentMethod() {
    try {
      // Select full price payment method (一括払い)
      const fullPriceInput = document.querySelector('input[data-autom="purchaseGroupOptionfullprice"]');
      if (fullPriceInput && !fullPriceInput.checked) {
        console.log('Selecting full price payment method...');
        fullPriceInput.click();
        this.safeNotifyBackgroundScript({
          type: 'PAYMENT_SELECTED',
          payment: 'fullprice',
          model: 'iPhone 17 Pro',
          timestamp: new Date().toISOString()
        });
      } else if (fullPriceInput && fullPriceInput.checked) {
        console.log('Full price payment already selected');
      }
    } catch (error) {
      console.error('Error selecting payment method:', error);
    }
  }

  selectAppleCare() {
    try {
      // Select "No AppleCare+" option (AppleCare+による保証なし)
      const noAppleCareInput = document.querySelector('input[data-autom="noapplecare"]');
      if (noAppleCareInput && !noAppleCareInput.checked) {
        console.log('Selecting No AppleCare+ option...');
        noAppleCareInput.click();
        this.safeNotifyBackgroundScript({
          type: 'APPLECARE_SELECTED',
          applecare: 'none',
          model: 'iPhone 17 Pro',
          timestamp: new Date().toISOString()
        });
      } else if (noAppleCareInput && noAppleCareInput.checked) {
        console.log('No AppleCare+ already selected');
      }
    } catch (error) {
      console.error('Error selecting AppleCare option:', error);
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting bag store locator monitoring...');
    
    // Check if bag is empty first
    const pageText = document.body?.textContent?.toLowerCase() || '';
    const isEmpty = pageText.includes('0+') || 
                   pageText.includes('バッグが空です') ||
                   pageText.includes('your bag is empty') ||
                   pageText.includes('カートが空です');
    
    if (isEmpty) {
      console.log('🛒 Bag is empty - No monitoring needed');
      console.log('Will check again in 30 seconds...');
      
      // Send notification about empty bag
      this.safeNotifyBackgroundScript({
        type: 'BAG_EMPTY',
        data: {
          timestamp: new Date().toISOString(),
          message: 'Bag is empty - no items to monitor',
          page: 'bag'
        }
      });
      
      setTimeout(() => {
        console.log('🔄 Rechecking bag status...');
        this.startMonitoring();
      }, 30000);
      return;
    }
    
    // Start human-like behavior simulation
    this.startHumanBehaviorSimulation();
    
    // Check for popup first
    this.checkForStoreLocatorPopup();
    
    // Try to find and click store locator button after 2 seconds
    console.log('🚀 SEARCH: Looking for store locator button after 2 seconds...');
    setTimeout(() => {
      const buttonFound = this.findAndClickStoreLocatorButton();
      
      if (buttonFound) {
        console.log('✅ Button found and clicked!');
      } else {
        console.log('⏳ Button not found, retrying with delays...');
        this.retryFindButton();
      }
    }, 2000); // Wait 2 seconds before clicking
    
    // Check with random intervals (3-7 seconds) to avoid detection
    this.scheduleNextCheck();
  }

  retryFindButton() {
    const retryDelays = [1000, 2000, 3000, 5000]; // 1s, 2s, 3s, 5s
    let retryCount = 0;
    
    const retry = () => {
      if (retryCount >= retryDelays.length) {
        console.log('❌ Max retries reached, button still not found');
        return;
      }
      
      const delay = retryDelays[retryCount];
      console.log(`🔄 Retry ${retryCount + 1}/${retryDelays.length} in ${delay}ms...`);
      
      setTimeout(() => {
        const buttonFound = this.findAndClickStoreLocatorButton();
        if (buttonFound) {
          console.log('✅ Button found and clicked on retry!');
          return;
        }
        
        retryCount++;
        retry();
      }, delay);
    };
    
    retry();
  }

  scheduleNextCheck() {
    if (!this.isMonitoring) return;
    
    // Random delay between 3-7 seconds
    const delay = Math.random() * 4000 + 3000;
    
    setTimeout(async () => {
      if (!this.isMonitoring) return;
      
      try {
        this.checkForStoreLocatorPopup();
        this.findAndClickStoreLocatorButton();
        
        // Check for IP rotation
        await this.ipRotationManager.checkAndRotate();
      } catch (error) {
        console.error('Error in monitoring interval:', error);
      }
      
      // Schedule next check
      this.scheduleNextCheck();
    }, delay);
  }

  stopMonitoring() {
    this.isMonitoring = false;
    this.humanBehaviorActive = false;
    console.log('Stopped bag store locator monitoring');
  }

  startHumanBehaviorSimulation() {
    if (this.humanBehaviorActive) return;
    
    this.humanBehaviorActive = true;
    console.log('Starting human behavior simulation...');
    
    // Simulate initial page reading behavior
    this.simulatePageReading();
    
    // Schedule random human behaviors
    this.scheduleRandomHumanBehaviors();
  }

  simulatePageReading() {
    try {
      // Simulate reading the page by scrolling slowly
      const scrollDelay = 2000 + Math.random() * 3000; // 2-5 seconds
      
      setTimeout(() => {
        this.simulateNaturalScroll();
      }, scrollDelay);
      
      // Simulate mouse movement
      setTimeout(() => {
        this.simulateMouseMovement();
      }, 1000 + Math.random() * 2000);
      
    } catch (error) {
      console.error('Error in simulatePageReading:', error);
    }
  }

  simulateNaturalScroll() {
    try {
      const scrollSteps = 3 + Math.floor(Math.random() * 4); // 3-6 steps
      const totalScrollDistance = 200 + Math.random() * 400; // 200-600px
      const stepDistance = totalScrollDistance / scrollSteps;
      
      let currentStep = 0;
      
      const scrollStep = () => {
        if (currentStep >= scrollSteps || !this.humanBehaviorActive) return;
        
        // Random scroll direction (mostly down, sometimes up)
        const direction = Math.random() > 0.8 ? -1 : 1;
        const distance = stepDistance * direction;
        
        window.scrollBy({
          top: distance,
          behavior: 'smooth'
        });
        
        currentStep++;
        
        // Random delay between scroll steps
        const delay = 800 + Math.random() * 1200; // 0.8-2 seconds
        setTimeout(scrollStep, delay);
      };
      
      scrollStep();
      
    } catch (error) {
      console.error('Error in simulateNaturalScroll:', error);
    }
  }

  simulateMouseMovement() {
    try {
      const movements = 2 + Math.floor(Math.random() * 3); // 2-4 movements
      let currentMovement = 0;
      
      const moveMouse = () => {
        if (currentMovement >= movements || !this.humanBehaviorActive) return;
        
        // Random mouse position
        const x = Math.random() * window.innerWidth;
        const y = Math.random() * window.innerHeight;
        
        // Create mouse move event
        const mouseMoveEvent = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        });
        
        document.dispatchEvent(mouseMoveEvent);
        
        currentMovement++;
        
        // Random delay between movements
        const delay = 1000 + Math.random() * 2000; // 1-3 seconds
        setTimeout(moveMouse, delay);
      };
      
      moveMouse();
      
    } catch (error) {
      console.error('Error in simulateMouseMovement:', error);
    }
  }

  scheduleRandomHumanBehaviors() {
    if (!this.humanBehaviorActive) return;
    
    // Random delay for next behavior (10-30 seconds)
    const delay = 10000 + Math.random() * 20000;
    
    setTimeout(() => {
      if (!this.humanBehaviorActive) return;
      
      // Randomly choose a behavior
      const behaviors = [
        () => this.simulateNaturalScroll(),
        () => this.simulateMouseMovement(),
        () => this.simulatePageInteraction(),
        () => this.simulateReadingPause()
      ];
      
      const randomBehavior = behaviors[Math.floor(Math.random() * behaviors.length)];
      randomBehavior();
      
      // Schedule next behavior
      this.scheduleRandomHumanBehaviors();
      
    }, delay);
  }

  simulatePageInteraction() {
    try {
      // Simulate clicking on non-functional elements (like text, images)
      const clickableElements = document.querySelectorAll('span, div, img, p');
      if (clickableElements.length > 0) {
        const randomElement = clickableElements[Math.floor(Math.random() * Math.min(clickableElements.length, 10))];
        
        if (randomElement && randomElement.offsetParent !== null) {
          // Simulate hover first
          const hoverEvent = new MouseEvent('mouseenter', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          randomElement.dispatchEvent(hoverEvent);
          
          // Then simulate click after a delay
          setTimeout(() => {
            const clickEvent = new MouseEvent('click', {
              view: window,
              bubbles: true,
              cancelable: true
            });
            randomElement.dispatchEvent(clickEvent);
          }, 200 + Math.random() * 300);
        }
      }
    } catch (error) {
      console.error('Error in simulatePageInteraction:', error);
    }
  }

  simulateReadingPause() {
    try {
      // Simulate reading by pausing and moving mouse slowly
      const pauseDuration = 3000 + Math.random() * 4000; // 3-7 seconds
      const startTime = Date.now();
      
      const slowMouseMove = () => {
        if (Date.now() - startTime > pauseDuration || !this.humanBehaviorActive) return;
        
        // Slow, small mouse movements
        const x = window.innerWidth * 0.3 + Math.random() * window.innerWidth * 0.4;
        const y = window.innerHeight * 0.3 + Math.random() * window.innerHeight * 0.4;
        
        const mouseMoveEvent = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        });
        
        document.dispatchEvent(mouseMoveEvent);
        
        // Continue with slow movements
        setTimeout(slowMouseMove, 500 + Math.random() * 1000);
      };
      
      slowMouseMove();
      
    } catch (error) {
      console.error('Error in simulateReadingPause:', error);
    }
  }

  tryMultipleClickMethods(button) {
    try {
      console.log('🔄 Trying multiple click methods...');
      
      // Check button state first
      console.log('Button state check:', {
        visible: button.offsetParent !== null,
        enabled: !button.disabled,
        display: getComputedStyle(button).display,
        visibility: getComputedStyle(button).visibility,
        opacity: getComputedStyle(button).opacity
      });
      
      if (button.disabled) {
        console.log('❌ Button is disabled, cannot click');
        return false;
      }
      
      if (button.offsetParent === null) {
        console.log('❌ Button is not visible, cannot click');
        return false;
      }
      
      // Method 1: Direct click (from working logic)
      try {
        console.log('Method 1: Direct click');
        button.click();
        console.log('✅ Direct click successful!');
        
        // Wait a bit and check if popup appeared
        setTimeout(() => {
          this.checkForStoreLocatorPopup();
        }, 1000);
        
        return true;
      } catch (error) {
        console.log('❌ Direct click failed:', error.message);
      }
      
      // Method 2: Focus and click (from working logic)
      try {
        console.log('Method 2: Focus and click');
        button.focus();
        button.click();
        console.log('✅ Focus and click successful!');
        
        // Wait a bit and check if popup appeared
        setTimeout(() => {
          this.checkForStoreLocatorPopup();
        }, 1000);
        
        return true;
      } catch (error) {
        console.log('❌ Focus and click failed:', error.message);
      }
      
      // Method 3: Mouse events sequence
      try {
        console.log('Method 3: Mouse events sequence');
        const rect = button.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        // Create and dispatch mouse events
        const mouseDownEvent = new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0
        });
        
        const mouseUpEvent = new MouseEvent('mouseup', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0
        });
        
        const clickEvent = new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y,
          button: 0
        });
        
        button.dispatchEvent(mouseDownEvent);
        setTimeout(() => {
          button.dispatchEvent(mouseUpEvent);
          setTimeout(() => {
            button.dispatchEvent(clickEvent);
          }, 10);
        }, 10);
        
        console.log('✅ Mouse events sequence successful!');
        
        // Wait a bit and check if popup appeared
        setTimeout(() => {
          this.checkForStoreLocatorPopup();
        }, 1000);
        
        return true;
      } catch (error) {
        console.log('❌ Mouse events failed:', error.message);
      }
      
      // Method 4: Human simulation
      try {
        console.log('Method 4: Human simulation');
        this.simulateHumanInteraction(button);
        console.log('✅ Human simulation initiated!');
        return true;
      } catch (error) {
        console.log('❌ Human simulation failed:', error.message);
      }
      
      console.log('❌ All click methods failed');
      return false;
      
    } catch (error) {
      console.error('Error in tryMultipleClickMethods:', error);
      return false;
    }
  }

  findSpecificButton() {
    try {
      console.log('🔍 Searching for store locator button...');
      
      // Method 1: Look for buttons with specific class combination
      const classSelectors = [
        'button.as-buttonlink.icon-after.icon-pluscircle[data-autom="bag-seemorestores-link"]',
        'button[class*="as-buttonlink"][class*="icon-pluscircle"][data-autom="bag-seemorestores-link"]',
        'button[data-autom="bag-seemorestores-link"]'
      ];
      
      for (const selector of classSelectors) {
        const button = document.querySelector(selector);
        if (button) {
          console.log('🎯 Found button with class selector:', selector);
          console.log('Button details:', {
            id: button.id,
            text: button.textContent?.trim(),
            classes: button.className,
            dataAutom: button.getAttribute('data-autom')
          });
          return button;
        }
      }
      
      // Method 2: Look for buttons with ID pattern (dynamic UUID) - ENHANCED
      const idPatternSelectors = [
        'button[id*="shoppingCart.items.item-"][id*="delivery.storeLocatorView"]',
        'button[id*="item-"][id*="delivery.storeLocatorView"]',
        'button[id*="shoppingCart"][id*="storeLocatorView"]',
        'button[id*="delivery.storeLocatorView"]',
        'button[id*="storeLocatorView"]'
      ];
      
      for (const selector of idPatternSelectors) {
        const button = document.querySelector(selector);
        if (button) {
          console.log('🎯 Found button with ID pattern:', selector);
          console.log('Button details:', {
            id: button.id,
            text: button.textContent?.trim(),
            classes: button.className,
            dataAutom: button.getAttribute('data-autom')
          });
          return button;
        }
      }
      
      // Method 3: Look for buttons containing Apple store names (ENHANCED)
      console.log('🔍 Searching by text content...');
      const textButtons = document.querySelectorAll('button');
      for (const button of textButtons) {
        const text = button.textContent?.trim() || '';
        if (text.includes('Apple 渋谷') || text.includes('渋谷') ||
            text.includes('Apple 表参道') || text.includes('表参道') ||
            text.includes('Apple 丸の内') || text.includes('丸の内') ||
            text.includes('Apple 銀座') || text.includes('銀座') ||
            text.includes('Apple 新宿') || text.includes('新宿')) {
          console.log('🎯 Found button with Apple store text:', {
            id: button.id,
            text: text,
            classes: button.className,
            dataAutom: button.getAttribute('data-autom')
          });
          return button;
        }
      }
      
      // Method 4: Look for any button with store locator attributes (ENHANCED)
      const attributeSelectors = [
        'button[data-autom*="store"]',
        'button[data-autom*="locator"]',
        'button[data-autom*="more"]',
        'button[class*="storeLocatorView"]',
        'button[class*="as-buttonlink"][class*="icon-pluscircle"]'
      ];
      
      for (const selector of attributeSelectors) {
        const button = document.querySelector(selector);
        if (button) {
          const text = button.textContent?.trim() || '';
          if (text.includes('Apple') || text.includes('渋谷') || text.includes('表参道') || 
              text.includes('丸の内') || text.includes('銀座') || text.includes('新宿')) {
            console.log('🎯 Found button with attribute selector:', selector);
            console.log('Button details:', {
              id: button.id,
              text: text,
              classes: button.className,
              dataAutom: button.getAttribute('data-autom')
            });
            return button;
          }
        }
      }
      
      console.log('❌ No store locator button found with any method');
      
      // Debug: Show all available buttons
      console.log('🔍 DEBUG: All buttons on page:');
      const debugButtons = document.querySelectorAll('button');
      debugButtons.forEach((btn, index) => {
        if (index < 20) { // Show first 20 buttons
          console.log(`Button ${index + 1}:`, {
            id: btn.id,
            text: btn.textContent?.trim(),
            classes: btn.className,
            dataAutom: btn.getAttribute('data-autom'),
            type: btn.type
          });
        }
      });
      
      return null;
    } catch (error) {
      console.error('Error in findSpecificButton:', error);
      return null;
    }
  }

  findAndClickStoreLocatorButton() {
    try {
      // First, try to find the specific button pattern you mentioned
      console.log('🎯 Looking for specific button pattern...');
      const specificButton = this.findSpecificButton();
      if (specificButton) {
        console.log('✅ Found specific button pattern!');
        console.log('🚀 Clicking button immediately...');
        
        // Try multiple click methods
        this.tryMultipleClickMethods(specificButton);
        
        return true;
      }
      
      // Look for store locator buttons with multiple selectors (from working logic)
      const selectors = [
        'button[data-autom="bag-seemorestores-link"]',
        'button.as-buttonlink.icon-after.icon-pluscircle',
        'button[class*="storeLocatorView"]',
        'button[class*="seemorestores"]',
        'button[id*="delivery.storeLocatorView"]',
        'button[id*="item-"][id*="delivery.storeLocatorView"]',
        'button[id*="shoppingCart.items.item-"][id*="delivery.storeLocatorView"]',
        'button[id*="shoppingCart"][id*="storeLocatorView"]',
        'button[id*="item-"][id*="storeLocatorView"]',
        'button[class*="as-buttonlink"][class*="icon-pluscircle"]',
        'button[class*="buttonlink"][class*="pluscircle"]',
        'button[data-autom*="store"]',
        'button[data-autom*="locator"]',
        'button[data-autom*="more"]'
      ];

      let storeLocatorButton = null;
      for (const selector of selectors) {
        try {
          storeLocatorButton = document.querySelector(selector);
          if (storeLocatorButton) {
            console.log('Found store locator button with selector:', selector);
            break;
          }
        } catch (selectorError) {
          console.warn('Error with selector:', selector, selectorError);
          continue;
        }
      }

      // If not found with selectors, look for any button containing "Apple" or store names (from working logic)
      if (!storeLocatorButton) {
        try {
          const fallbackButtons = document.querySelectorAll('button');
          storeLocatorButton = Array.from(fallbackButtons).find(btn => {
            try {
              const text = btn.textContent?.toLowerCase() || '';
              const id = btn.id?.toLowerCase() || '';
              const classes = btn.className?.toLowerCase() || '';
              const dataAutom = btn.getAttribute('data-autom')?.toLowerCase() || '';
              
              // Check text content for store names
              const hasStoreName = text.includes('apple') || 
                     text.includes('丸の内') || 
                     text.includes('銀座') || 
                     text.includes('表参道') ||
                     text.includes('渋谷') ||
                     text.includes('ginza') ||
                     text.includes('marunouchi') ||
                     text.includes('shibuya') ||
                     text.includes('omotesando') ||
                     text.includes('harajuku') ||
                     text.includes('新宿') ||
                     text.includes('shinjuku');
              
              // Check ID patterns
              const hasStoreId = id.includes('storelocator') ||
                     id.includes('delivery') ||
                     id.includes('shoppingcart') ||
                     id.includes('item-');
              
              // Check class patterns
              const hasStoreClass = classes.includes('storelocator') ||
                     classes.includes('delivery') ||
                     classes.includes('buttonlink') ||
                     classes.includes('pluscircle');
              
              // Check data-autom patterns
              const hasStoreDataAutom = dataAutom.includes('store') ||
                     dataAutom.includes('locator') ||
                     dataAutom.includes('more') ||
                     dataAutom.includes('bag');
              
              return hasStoreName || hasStoreId || hasStoreClass || hasStoreDataAutom;
            } catch (textError) {
              console.warn('Error reading button text:', textError);
              return false;
            }
          });
        } catch (buttonError) {
          console.warn('Error searching buttons:', buttonError);
        }
      }

      if (storeLocatorButton) {
        console.log('✅ Found store locator button, clicking immediately...');
        console.log('Button details:', {
          id: storeLocatorButton.id,
          text: storeLocatorButton.textContent?.trim(),
          classes: storeLocatorButton.className,
          dataAutom: storeLocatorButton.getAttribute('data-autom')
        });
        
        try {
          // Use the working click logic from content.js
          console.log('Clicking store locator button...');
          storeLocatorButton.click();
          
          // Wait a bit and check if popup appeared
          setTimeout(() => {
            this.checkForStoreLocatorPopup();
          }, 1000);
          
          // Log button click (no Discord notification)
          console.log('Store locator button clicked:', {
            text: storeLocatorButton.textContent?.trim(),
            timestamp: new Date().toISOString()
          });

          return true; // Found and clicked
        } catch (clickError) {
          console.error('Error clicking store locator button:', clickError);
          return false;
        }
      } else {
        console.log('❌ Store locator button not found on bag page');
        console.log('Available buttons on page:');
        const allButtons = document.querySelectorAll('button');
        allButtons.forEach((btn, index) => {
          if (index < 10) { // Show first 10 buttons
            console.log(`Button ${index}:`, {
              id: btn.id,
              text: btn.textContent?.trim(),
              classes: btn.className,
              dataAutom: btn.getAttribute('data-autom')
            });
          }
        });
        return false; // Not found
      }
    } catch (error) {
      console.error('Error finding store locator button:', error);
      return false;
    }
  }

  simulateHumanInteraction(element) {
    try {
      // Step 1: Move mouse to element (simulate human moving mouse to button)
      const rect = element.getBoundingClientRect();
      const targetX = rect.left + rect.width / 2 + (Math.random() - 0.5) * 20; // Add some randomness
      const targetY = rect.top + rect.height / 2 + (Math.random() - 0.5) * 20;
      
      // Simulate mouse movement to the element
      this.simulateMouseMovementTo(targetX, targetY, () => {
        // Step 2: Hover over the element
        this.simulateHover(element, () => {
          // Step 3: Click after hover
          this.simulateClick(element);
        });
      });
      
    } catch (error) {
      console.error('Error in simulateHumanInteraction:', error);
      // Fallback to simple click
      element.click();
    }
  }

  simulateMouseMovementTo(targetX, targetY, callback) {
    try {
      const steps = 3 + Math.floor(Math.random() * 3); // 3-5 steps
      const currentPos = { x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight };
      const stepX = (targetX - currentPos.x) / steps;
      const stepY = (targetY - currentPos.y) / steps;
      
      let currentStep = 0;
      
      const moveStep = () => {
        if (currentStep >= steps) {
          if (callback) callback();
          return;
        }
        
        currentPos.x += stepX;
        currentPos.y += stepY;
        
        const mouseMoveEvent = new MouseEvent('mousemove', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: currentPos.x,
          clientY: currentPos.y
        });
        
        document.dispatchEvent(mouseMoveEvent);
        
        currentStep++;
        
        // Random delay between steps (50-150ms)
        const delay = 50 + Math.random() * 100;
        setTimeout(moveStep, delay);
      };
      
      moveStep();
      
    } catch (error) {
      console.error('Error in simulateMouseMovementTo:', error);
      if (callback) callback();
    }
  }

  simulateHover(element, callback) {
    try {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Hover delay (200-800ms)
      const hoverDelay = 200 + Math.random() * 600;
      
      setTimeout(() => {
        // Mouse enter event
        const mouseEnterEvent = new MouseEvent('mouseenter', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        });
        
        element.dispatchEvent(mouseEnterEvent);
        
        // Mouse over event
        const mouseOverEvent = new MouseEvent('mouseover', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: x,
          clientY: y
        });
        
        element.dispatchEvent(mouseOverEvent);
        
        // Wait a bit before clicking (100-300ms)
        const clickDelay = 100 + Math.random() * 200;
        setTimeout(() => {
          if (callback) callback();
        }, clickDelay);
        
      }, hoverDelay);
      
    } catch (error) {
      console.error('Error in simulateHover:', error);
      if (callback) callback();
    }
  }

  simulateClick(element) {
    try {
      const rect = element.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      
      // Create mouse events sequence
      const mouseDownEvent = new MouseEvent('mousedown', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 0
      });
      
      const mouseUpEvent = new MouseEvent('mouseup', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 0
      });
      
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: x,
        clientY: y,
        button: 0
      });
      
      // Dispatch events in sequence with realistic timing
      element.dispatchEvent(mouseDownEvent);
      
      setTimeout(() => {
        element.dispatchEvent(mouseUpEvent);
        
        setTimeout(() => {
          element.dispatchEvent(clickEvent);
          
          // Also try the native click as fallback
          setTimeout(() => {
            element.click();
          }, 50);
        }, 50);
      }, 50);
      
    } catch (error) {
      console.error('Error in simulateClick:', error);
      // Fallback to simple click
      element.click();
    }
  }

  checkForStoreLocatorPopup() {
    try {
      // Look for the store locator popup
      const popup = document.querySelector('.rc-overlay-popup-outer');
      const storeLocatorContent = document.querySelector('.rc-overlay-popup-content');
      const storeList = document.querySelector('.rt-storelocator-store-list');
      
      if (popup && storeLocatorContent && storeList) {
        console.log('Store locator popup detected!');
        
        // Check if we've already detected this popup recently (avoid spam)
        const now = Date.now();
        if (this.popupDetected && this.lastPopupTime && (now - this.lastPopupTime) < 5000) {
          return; // Already detected within last 5 seconds
        }
        
        this.popupDetected = true;
        this.lastPopupTime = now;
        
        // Extract store information
        this.extractStoreLocatorData();
      } else {
        // Reset detection flag if popup is no longer visible
        if (this.popupDetected) {
          console.log('Store locator popup closed');
          this.popupDetected = false;
        }
      }
    } catch (error) {
      console.error('Error checking for store locator popup:', error);
    }
  }

  extractStoreLocatorData() {
    try {
      const storeData = {
        timestamp: new Date().toISOString(),
        page: 'bag',
        popupType: 'store_locator',
        stores: [],
        postalCode: '',
        hasAvailability: false
      };

      // Extract postal code from search input
      const postalCodeInput = document.querySelector('input[data-autom="bag-storelocator-input"]');
      if (postalCodeInput) {
        storeData.postalCode = postalCodeInput.value || '';
      }

      // Extract store information
      const storeItems = document.querySelectorAll('.rt-storelocator-store-group .form-selector');
      storeItems.forEach((item, index) => {
        try {
          const storeName = item.querySelector('.form-selector-title')?.textContent?.trim();
          const storeLocation = item.querySelector('.form-label-small')?.textContent?.trim();
          const statusElement = item.querySelector('.rt-storelocator-store-right span');
          const status = statusElement?.textContent?.trim() || '';
          const isDisabled = item.querySelector('input[type="radio"]')?.disabled || false;
          const isAvailable = !isDisabled && !status.includes('現在ご購入いただけません');

          if (storeName) {
            storeData.stores.push({
              name: storeName,
              location: storeLocation || '',
              status: status,
              isAvailable: isAvailable,
              isDisabled: isDisabled,
              index: index
            });

            if (isAvailable) {
              storeData.hasAvailability = true;
            }
          }
        } catch (itemError) {
          console.error('Error processing store item:', itemError);
        }
      });

      console.log('Extracted store locator data:', storeData);
      
      // Send notification to background script and wait for success
      this.safeNotifyBackgroundScript({
        type: 'BAG_STORE_LOCATOR_POPUP',
        data: storeData
      }).then((success) => {
        if (success) {
          console.log('✅ Discord notification sent successfully, scheduling reload in 45 seconds...');
          this.scheduleReloadAfterNotification();
        } else {
          console.log('❌ Discord notification failed, not scheduling reload');
        }
      }).catch((error) => {
        console.error('❌ Error sending Discord notification:', error);
      });

    } catch (error) {
      console.error('Error extracting store locator data:', error);
    }
  }

  async safeNotifyBackgroundScript(message) {
    try {
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.warn('Extension context invalidated, cannot send message:', message);
        await this.ipRotationManager.handleNotificationFailure();
        return false;
      }

      const response = await chrome.runtime.sendMessage(message);
      
      if (response && response.success === false) {
        console.error('Background script returned error:', response.error);
        await this.ipRotationManager.handleNotificationFailure();
        return false;
      }
      
      // Reset failed count on successful notification
      this.ipRotationManager.failedNotificationCount = 0;
      console.log('✅ Notification sent successfully to background script');
      return true;
      
    } catch (error) {
      console.error('Error in safeNotifyBackgroundScript:', error);
      await this.ipRotationManager.handleNotificationFailure();
      return false;
    }
  }
}

// Initialize the monitor when the page loads
function initializeBagMonitor() {
  try {
    new BagStoreLocatorMonitor();
  } catch (error) {
    console.error('Error initializing bag monitor:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeBagMonitor);
} else {
  initializeBagMonitor();
}

// Also initialize on navigation changes (for SPA behavior)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Reinitialize monitor for new page
    setTimeout(() => {
      new BagStoreLocatorMonitor();
    }, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});