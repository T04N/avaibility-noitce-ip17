// Content script for monitoring iPhone 17 and iPhone 17 Pro availability
class iPhoneAvailabilityMonitor {
  constructor() {
    this.isMonitoring = false;
    this.lastAvailability = null;
    this.lastStoreData = null;
    this.storeNotificationSent = false;
    this.checkInterval = null;
    this.currentModel = this.detectCurrentModel();
    this.init();
  }

  detectCurrentModel() {
    const url = window.location.href;
    if (url.includes('iphone-17-pro')) {
      return 'iPhone 17 Pro';
    } else if (url.includes('iphone-17')) {
      return 'iPhone 17';
    } else {
      return 'iPhone 17/17 Pro';
    }
  }

  init() {
    console.log(`${this.currentModel} Availability Monitor initializing...`);
    
    // Check if extension context is available before starting
    if (!this.isExtensionContextValid()) {
      console.error('Extension context not available, retrying in 2 seconds...');
      setTimeout(() => {
        this.init();
      }, 2000);
      return;
    }
    
    console.log(`${this.currentModel} Availability Monitor initialized`);
    this.startMonitoring();
    this.autoSelectOptions();
    this.startPopupMonitor();
    
    // Reload page after 3 seconds
    this.schedulePageReload();
  }

  schedulePageReload() {
    console.log('Scheduling page reload in 3 seconds...');
    setTimeout(() => {
      console.log('Reloading page...');
      window.location.reload();
    }, 12000);
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

  isExtensionContextValid() {
    try {
      return !!(chrome && chrome.runtime && chrome.runtime.sendMessage);
    } catch (error) {
      console.error('Error checking extension context:', error);
      return false;
    }
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    // Check if extension context is still valid
    if (!this.isExtensionContextValid()) {
      console.error('Extension context invalid, cannot start monitoring');
      return;
    }
    
    this.isMonitoring = true;
    console.log('Starting availability monitoring...');
    
    // Check immediately
    this.checkAvailability();
    
    // Check every 2 seconds
    this.checkInterval = setInterval(() => {
      try {
        this.checkAvailability();
      } catch (error) {
        console.error('Error in monitoring interval:', error);
        if (error.message && error.message.includes('Extension context invalidated')) {
          this.handleContextInvalidation();
        }
      }
    }, 2000);
  }

  stopMonitoring() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    this.isMonitoring = false;
    console.log('Stopped availability monitoring');
  }

  checkAvailability() {
    try {
      // Ensure options are still selected
      this.ensureOptionsSelected();
      
      // Look for availability indicators on the page
      const availabilityData = this.extractAvailabilityData();
      
      if (availabilityData && this.hasAvailabilityChanged(availabilityData)) {
        console.log('Availability changed (legacy format):', availabilityData);
        // Don't send notification from legacy format to avoid spam
        // Only store availability results should send notifications
        console.log('Skipping legacy availability notification to avoid spam');
        this.lastAvailability = availabilityData;
      }
    } catch (error) {
      console.error('Error checking availability:', error);
    }
  }

  extractAvailabilityData() {
    const data = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      availability: {}
    };

    // Look for different availability indicators
    const selectors = [
      // Apple's typical availability selectors
      '[data-autom="buy-button"]',
      '.as-button-fullwidth',
      '.rf-pdp-button',
      '.rf-pdp-button-primary',
      '[data-autom="add-to-cart"]',
      '.rf-pdp-button-secondary',
      '.rf-pdp-button-disabled'
    ];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const text = element.textContent?.trim();
        const isAvailable = !element.disabled && 
                           !element.classList.contains('disabled') && 
                           !text?.toLowerCase().includes('unavailable') &&
                           !text?.toLowerCase().includes('sold out') &&
                           !text?.toLowerCase().includes('coming soon');
        
        data.availability[`${selector}_${index}`] = {
          text: text,
          isAvailable: isAvailable,
          disabled: element.disabled,
          classes: Array.from(element.classList)
        };
      });
    }

    // Look for specific iPhone 17 Pro model availability
    const modelElements = document.querySelectorAll('[data-autom*="iphone-17-pro"], [data-autom*="iPhone-17-Pro"]');
    modelElements.forEach((element, index) => {
      const modelText = element.textContent?.trim();
      const isInStock = !modelText?.toLowerCase().includes('unavailable') && 
                       !modelText?.toLowerCase().includes('sold out');
      
      data.availability[`model_${index}`] = {
        text: modelText,
        isAvailable: isInStock
      };
    });

    // Check for any "Add to Bag" or "Buy" buttons that are enabled
    const buyButtons = document.querySelectorAll('button[data-autom*="buy"], button[data-autom*="add"]');
    data.availability.buyButtons = Array.from(buyButtons).map(btn => ({
      text: btn.textContent?.trim(),
      isAvailable: !btn.disabled && !btn.classList.contains('disabled'),
      disabled: btn.disabled
    }));

    return data;
  }

  autoSelectOptions() {
    console.log(`Auto-selecting ${this.currentModel} options...`);
    
    // Check if extension context is still valid
    if (!this.isExtensionContextValid()) {
      console.error('Extension context invalid, cannot auto-select options');
      return;
    }
    
    // Wait for page to load completely
    setTimeout(() => {
      try {
        this.selectScreenSize();    // 1. Select iPhone 17 Pro (6.3 inch)
        this.selectColor();         // 2. Select Cosmic Orange
        this.selectCapacity();      // 3. Select 256GB
        this.selectTradeIn();       // 4. Select no trade-in
        this.selectCarrier();       // 5. Select SIM-free
        this.selectPaymentMethod(); // 6. Select full price payment
        this.selectAppleCare();     // 7. Select no AppleCare+
        this.retryStoreAvailabilityCheck(0);
      } catch (error) {
        console.error('Error in autoSelectOptions:', error);
        if (error.message && error.message.includes('Extension context invalidated')) {
          this.handleContextInvalidation();
        }
      }
    }, 2000);
  }

  retryStoreAvailabilityCheck(attempt) {
    const maxAttempts = 31;
    const delay = 3000; // 3 seconds between attempts

    if (attempt >= maxAttempts) {
      console.log('Max attempts reached for finding store button');
      
      // Send notification that store button was not found
      if (!this.storeNotificationSent) {
        console.log('Store button not found after max attempts, sending notification');
        const noButtonData = {
          timestamp: new Date().toISOString(),
          dialogType: 'no_button_found',
          stores: [],
          summary: 'Store availability button not found after 31 attempts',
          hasAvailability: false,
          analysisAttempt: 'no_button'
        };
        
        this.safeNotifyBackgroundScript({
          type: 'STORE_AVAILABILITY_RESULTS',
          data: noButtonData
        });
        this.lastStoreData = noButtonData;
        this.storeNotificationSent = true;
      }
      return;
    }

    setTimeout(() => {
      try {
        // Check if extension context is still valid
        if (!this.isExtensionContextValid()) {
          console.error('Extension context invalid during retry, stopping');
          return;
        }
        
        console.log(`Looking for store button (attempt ${attempt + 1}/${maxAttempts})...`);
        const found = this.checkStoreAvailability();
        
        if (!found && attempt < maxAttempts - 1) {
          console.log('Store button not found, retrying...');
          this.retryStoreAvailabilityCheck(attempt + 1);
        }
      } catch (error) {
        console.error('Error in retryStoreAvailabilityCheck:', error);
        if (error.message && error.message.includes('Extension context invalidated')) {
          this.handleContextInvalidation();
        }
      }
    }, delay);
  }

  selectScreenSize() {
    try {
      // Select iPhone 17 Pro (6.3 inch) first
      const proInput = document.querySelector('input[data-autom="dimensionScreensize6_3inch"]');
      
      if (proInput && !proInput.checked) {
        console.log('Selecting iPhone 17 Pro (6.3 inch)...');
        proInput.click();
        this.safeNotifyBackgroundScript({
          type: 'SCREEN_SIZE_SELECTED',
          screenSize: 'iPhone 17 Pro (6.3 inch)',
          model: this.currentModel,
          timestamp: new Date().toISOString()
        });
      } else if (proInput && proInput.checked) {
        console.log('iPhone 17 Pro (6.3 inch) already selected');
      } else {
        console.log('iPhone 17 Pro (6.3 inch) option not found');
      }
    } catch (error) {
      console.error('Error selecting screen size:', error);
    }
  }

  selectColor() {
    try {
      let selectedColor = null;
      let colorInput = null;
      
      if (this.currentModel === 'iPhone 17 Pro') {
        // iPhone 17 Pro colors: Cosmic Orange, Silver, Deep Blue
        const colorPriority = [
          'cosmicorange', // Cosmic Orange (コズミックオレンジ)
          'silver',       // Silver (シルバー)
          'deepblue'      // Deep Blue (ディープブルー)
        ];
        
        for (const color of colorPriority) {
          colorInput = document.querySelector(`input[data-autom="dimensionColor${color}"]`);
          if (colorInput) {
            selectedColor = color;
            break;
          }
        }
      } else if (this.currentModel === 'iPhone 17') {
        // iPhone 17 colors: Lavender, Black, White, Sage, Mist Blue
        const colorPriority = [
          'lavender',     // Lavender (ラベンダー)
          'black',        // Black (ブラック)
          'white',        // White (ホワイト)
          'sage',         // Sage (セージ)
          'mistblue'      // Mist Blue (ミストブルー)
        ];
        
        for (const color of colorPriority) {
          colorInput = document.querySelector(`input[data-autom="dimensionColor${color}"]`);
          if (colorInput) {
            selectedColor = color;
            break;
          }
        }
      } else {
        // Fallback for unknown model
        const fallbackColors = ['cosmicorange', 'lavender', 'silver', 'black'];
        for (const color of fallbackColors) {
          colorInput = document.querySelector(`input[data-autom="dimensionColor${color}"]`);
          if (colorInput) {
            selectedColor = color;
            break;
          }
        }
      }
      
      if (colorInput && !colorInput.checked) {
        console.log(`Selecting ${selectedColor} color for ${this.currentModel}...`);
        colorInput.click();
        this.safeNotifyBackgroundScript({
          type: 'COLOR_SELECTED',
          color: selectedColor,
          model: this.currentModel,
          timestamp: new Date().toISOString()
        });
      } else if (colorInput && colorInput.checked) {
        console.log(`${selectedColor} already selected for ${this.currentModel}`);
      } else {
        console.log(`No suitable color found for ${this.currentModel}`);
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
          model: this.currentModel,
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
          model: this.currentModel,
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
          model: this.currentModel,
          timestamp: new Date().toISOString()
        });
      } else if (noAppleCareInput && noAppleCareInput.checked) {
        console.log('No AppleCare+ already selected');
      }
    } catch (error) {
      console.error('Error selecting AppleCare option:', error);
    }
  }

  checkStoreAvailability() {
    try {
      // Check if extension context is still valid
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.error('Extension context invalidated, cannot check store availability');
        return false;
      }

      // Look for Apple Ginza store availability button with multiple selectors
      const selectors = [
        'button[data-ase-overlay="buac-overlay"]',
        'button.as-retailavailabilitytrigger-infobutton',
        'button.retail-availability-search-trigger',
        'button[data-ase-click="show"]'
      ];

      let appleGinzaButton = null;
      for (const selector of selectors) {
        try {
          appleGinzaButton = document.querySelector(selector);
          if (appleGinzaButton) break;
        } catch (selectorError) {
          console.warn('Error with selector:', selector, selectorError);
          continue;
        }
      }

      // If not found with selectors, look for any button containing "Apple" or "銀座"
      if (!appleGinzaButton) {
        try {
          const allButtons = document.querySelectorAll('button');
          appleGinzaButton = Array.from(allButtons).find(btn => {
            try {
              const text = btn.textContent?.toLowerCase() || '';
              return text.includes('apple') || text.includes('銀座') || text.includes('ginza');
            } catch (textError) {
              console.warn('Error reading button text:', textError);
              return false;
            }
          });
        } catch (buttonError) {
          console.warn('Error searching buttons:', buttonError);
        }
      }

      if (appleGinzaButton) {
        console.log('Found Apple Ginza store button, clicking to check availability...');
        
        try {
          appleGinzaButton.click();
          
          // Try to send notification, but don't fail if context is invalid
          this.safeNotifyBackgroundScript({
            type: 'STORE_AVAILABILITY_CHECK',
            store: 'Apple Ginza',
            model: this.currentModel,
            timestamp: new Date().toISOString()
          });

          // Try multiple times to check for availability results
          this.retryAvailabilityCheck(0);
          
          // Also retry store data analysis 30 times
          this.retryStoreDataAnalysis(0);
          return true; // Found and clicked
        } catch (clickError) {
          console.error('Error clicking store button:', clickError);
          return false;
        }
      } else {
        console.log('Apple Ginza store button not found');
        return false; // Not found
      }
    } catch (error) {
      console.error('Error checking store availability:', error);
      
      // If context is invalidated, try to recover
      if (error.message && error.message.includes('Extension context invalidated')) {
        console.log('Extension context invalidated, attempting to recover...');
        this.handleContextInvalidation();
      }
      
      return false;
    }
  }

  retryAvailabilityCheck(attempt) {
    const maxAttempts = 5;
    const delay = 2000; // 2 seconds between attempts

    if (attempt >= maxAttempts) {
      console.log('Max attempts reached for availability check');
      return;
    }

    setTimeout(() => {
      try {
        console.log(`Checking availability results (attempt ${attempt + 1}/${maxAttempts})...`);
        const hasResults = this.checkAvailabilityResults();
        
        if (!hasResults && attempt < maxAttempts - 1) {
          console.log('No results found, retrying...');
          this.retryAvailabilityCheck(attempt + 1);
        }
      } catch (error) {
        console.error('Error in retryAvailabilityCheck:', error);
        
        // If context is invalidated, try to recover
        if (error.message && error.message.includes('Extension context invalidated')) {
          console.log('Extension context invalidated during retry, attempting to recover...');
          this.handleContextInvalidation();
        }
      }
    }, delay);
  }

  checkAvailabilityResults() {
    try {
      // Look for the specific store availability dialog
      const storeAvailabilityDialog = document.querySelector('.rf-productlocator-overlay-content');
      const noPickupStores = document.querySelector('.rf-productlocator-nopickupstores');
      const storeOptions = document.querySelectorAll('.rf-productlocator-storeoption');
      
      if (storeAvailabilityDialog || noPickupStores || storeOptions.length > 0) {
        console.log('Found store availability dialog!');
        
        let availabilityData = {
          timestamp: new Date().toISOString(),
          dialogType: 'store_availability',
          stores: [],
          summary: '',
          hasAvailability: false
        };

        // Check for "no pickup stores" message
        if (noPickupStores) {
          const noPickupButton = noPickupStores.querySelector('.rf-productlocator-nopickupstores-btn');
          if (noPickupButton) {
            const summaryText = noPickupButton.querySelector('.rf-productlocator-buttontitle')?.textContent?.trim();
            if (summaryText) {
              availabilityData.summary = summaryText;
              console.log('No pickup stores message:', summaryText);
            }
          }
        }

        // Check individual store options
        storeOptions.forEach((storeOption, index) => {
          const storeName = storeOption.querySelector('.form-selector-title')?.textContent?.trim();
          const storeLocation = storeOption.querySelector('.form-label-small')?.textContent?.trim();
          const storeStatus = storeOption.querySelector('.form-selector-right-col span')?.textContent?.trim();
          const isDisabled = storeOption.classList.contains('disabled');
          const isAvailable = !isDisabled && !storeStatus?.includes('ご利用いただけません');

          if (storeName) {
            availabilityData.stores.push({
              name: storeName,
              location: storeLocation,
              status: storeStatus,
              isAvailable: isAvailable,
              isDisabled: isDisabled
            });

            if (isAvailable) {
              availabilityData.hasAvailability = true;
            }
          }
        });

        // Check for delivery options
        const deliveryOptions = document.querySelectorAll('.rf-productlocator-deliveryquotesoption');
        deliveryOptions.forEach(option => {
          const deliveryText = option.querySelector('.form-selector-title')?.textContent?.trim();
          if (deliveryText) {
            availabilityData.deliveryOptions = availabilityData.deliveryOptions || [];
            availabilityData.deliveryOptions.push(deliveryText);
          }
        });

        console.log('Store availability data:', availabilityData);
        
        // Don't send notification from checkAvailabilityResults to avoid spam
        // Only analyzeStoreData should send store notifications
        console.log('Store availability dialog found in checkAvailabilityResults, but notification will be sent from analyzeStoreData');
        return true; // Found results
      }

      // Fallback to original logic if dialog not found
      const selectors = [
        '[data-autom*="availability"]',
        '[data-autom*="stock"]',
        '.retail-availability',
        '.store-availability',
        '.rf-pickup-quote-overlay',
        '.buac-overlay',
        '[data-ase-overlay="buac-overlay"]',
        '.as-retailavailabilitytrigger',
        '.retail-availability-search-trigger'
      ];

      let availabilityElements = [];
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        availabilityElements = availabilityElements.concat(Array.from(elements));
      });

      // Also look for any text containing availability keywords
      const allElements = document.querySelectorAll('*');
      const keywordElements = Array.from(allElements).filter(el => {
        const text = el.textContent?.toLowerCase() || '';
        return text.includes('available') || 
               text.includes('in stock') || 
               text.includes('pickup') ||
               text.includes('store') ||
               text.includes('ginza') ||
               text.includes('銀座');
      });

      availabilityElements = availabilityElements.concat(keywordElements);
      
      let availabilityData = {
        timestamp: new Date().toISOString(),
        store: 'Apple Ginza',
        results: [],
        foundElements: availabilityElements.length
      };

      availabilityElements.forEach((element, index) => {
        const text = element.textContent?.trim();
        if (text && text.length > 0) {
          const isAvailable = !text.toLowerCase().includes('unavailable') && 
                             !text.toLowerCase().includes('sold out') &&
                             !text.toLowerCase().includes('not available') &&
                             !text.toLowerCase().includes('out of stock');
          
          availabilityData.results.push({
            text: text,
            isAvailable: isAvailable,
            element: element.tagName,
            selector: this.getElementSelector(element)
          });
        }
      });

      console.log(`Found ${availabilityData.results.length} availability elements`);
      
      if (availabilityData.results.length > 0) {
        console.log('Legacy availability results found, but skipping notification to avoid spam');
        // Don't send notification from legacy format to avoid spam
        return true; // Found results
      } else {
        console.log('No availability results found yet');
        return false; // No results found
      }
    } catch (error) {
      console.error('Error checking availability results:', error);
      return false;
    }
  }

  retryStoreDataAnalysis(attempt) {
    const maxAttempts = 30;
    const delay = 2000; // 2 seconds between attempts

    if (attempt >= maxAttempts) {
      console.log('Max attempts reached for store data analysis');
      return;
    }

    setTimeout(() => {
      try {
        console.log(`Analyzing store data (attempt ${attempt + 1}/${maxAttempts})...`);
        
        // Try to find the no pickup stores button first
        const noPickupButton = this.findNoPickupButton();
        if (noPickupButton) {
          console.log('Found no pickup button, proceeding with analysis...');
        }
        
        const hasStoreData = this.analyzeStoreData();
        
        if (!hasStoreData && attempt < maxAttempts - 1) {
          console.log('No store data found, retrying...');
          this.retryStoreDataAnalysis(attempt + 1);
        }
      } catch (error) {
        console.error('Error in retryStoreDataAnalysis:', error);
        
        // If context is invalidated, try to recover
        if (error.message && error.message.includes('Extension context invalidated')) {
          console.log('Extension context invalidated during store data analysis, attempting to recover...');
          this.handleContextInvalidation();
        }
      }
    }, delay);
  }

  findNoPickupButton() {
    try {
      // Try multiple approaches to find the button
      const approaches = [
        // Approach 1: Direct selectors
        () => {
          const selectors = [
            '.rf-productlocator-nopickupstores-btn',
            'button.rf-productlocator-nopickupstores-btn',
            'button.as-buttonlink.typography-body-reduced',
            'button[aria-expanded="false"]'
          ];
          
          for (const selector of selectors) {
            const button = document.querySelector(selector);
            if (button) {
              console.log('Found button with direct selector:', selector);
              return button;
            }
          }
          return null;
        },
        
        // Approach 2: Search by text content
        () => {
          const allButtons = document.querySelectorAll('button');
          for (const button of allButtons) {
            const text = button.textContent?.trim();
            if (text && text.includes('お近くの') && text.includes('店舗のストアには')) {
              console.log('Found button by text content');
              return button;
            }
          }
          return null;
        },
        
        // Approach 3: Search within no pickup stores container
        () => {
          const container = document.querySelector('.rf-productlocator-nopickupstores');
          if (container) {
            const button = container.querySelector('button');
            if (button) {
              console.log('Found button within no pickup stores container');
              return button;
            }
          }
          return null;
        }
      ];
      
      for (const approach of approaches) {
        const button = approach();
        if (button) {
          return button;
        }
      }
      
      console.log('No pickup button not found with any approach');
      return null;
    } catch (error) {
      console.error('Error finding no pickup button:', error);
      return null;
    }
  }

  analyzeStoreData() {
    try {
      // Look for the specific store availability dialog
      const storeAvailabilityDialog = document.querySelector('.rf-productlocator-overlay-content');
      const noPickupStores = document.querySelector('.rf-productlocator-nopickupstores');
      const storeOptions = document.querySelectorAll('.rf-productlocator-storeoption');
      
      if (storeAvailabilityDialog || noPickupStores || storeOptions.length > 0) {
        console.log('Found store availability dialog for analysis!');
        console.log('Dialog found:', !!storeAvailabilityDialog);
        console.log('No pickup stores found:', !!noPickupStores);
        console.log('Store options found:', storeOptions.length);
        
        let availabilityData = {
          timestamp: new Date().toISOString(),
          dialogType: 'store_availability',
          model: this.currentModel,
          stores: [],
          summary: '',
          hasAvailability: false,
          analysisAttempt: 'success'
        };

        // Check for "no pickup stores" message with multiple attempts
        if (noPickupStores) {
          console.log('Found noPickupStores element, looking for button...');
          
          // Use the dedicated function to find the button
          const noPickupButton = this.findNoPickupButton();
          
          if (noPickupButton) {
            // Try multiple selectors for the title text
            const titleSelectors = [
              '.rf-productlocator-buttontitle',
              'span.rf-productlocator-buttontitle',
              'span[class*="buttontitle"]'
            ];
            
            let summaryText = null;
            for (const selector of titleSelectors) {
              const titleElement = noPickupButton.querySelector(selector);
              if (titleElement) {
                summaryText = titleElement.textContent?.trim();
                if (summaryText) {
                  console.log('Found summary text with selector:', selector);
                  break;
                }
              }
            }
            
            if (summaryText) {
              availabilityData.summary = summaryText;
              console.log('No pickup stores message found:', summaryText);
            } else {
              console.log('Button found but no title text found');
            }
          } else {
            console.log('No pickup button not found with any approach');
          }
        }

        // Check individual store options
        storeOptions.forEach((storeOption, index) => {
          const storeName = storeOption.querySelector('.form-selector-title')?.textContent?.trim();
          const storeLocation = storeOption.querySelector('.form-label-small')?.textContent?.trim();
          const storeStatus = storeOption.querySelector('.form-selector-right-col span')?.textContent?.trim();
          const isDisabled = storeOption.classList.contains('disabled');
          const isAvailable = !isDisabled && !storeStatus?.includes('ご利用いただけません');

          console.log(`Store ${index + 1}:`, {
            name: storeName,
            location: storeLocation,
            status: storeStatus,
            isDisabled: isDisabled,
            isAvailable: isAvailable
          });

          if (storeName) {
            availabilityData.stores.push({
              name: storeName,
              location: storeLocation,
              status: storeStatus,
              isAvailable: isAvailable,
              isDisabled: isDisabled
            });

            if (isAvailable) {
              availabilityData.hasAvailability = true;
            }
          }
        });

        // Check for delivery options
        const deliveryOptions = document.querySelectorAll('.rf-productlocator-deliveryquotesoption');
        deliveryOptions.forEach(option => {
          const deliveryText = option.querySelector('.form-selector-title')?.textContent?.trim();
          if (deliveryText) {
            availabilityData.deliveryOptions = availabilityData.deliveryOptions || [];
            availabilityData.deliveryOptions.push(deliveryText);
          }
        });

        // Check for region information in multiple locations
        const regionSelectors = [
          '.rf-productlocator-pickuploctionheader h3',
          '.rf-productlocator-pickuploctionheader',
          'h3'
        ];

        let regionText = null;
        for (const selector of regionSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            regionText = element.textContent?.trim();
            if (regionText && (regionText.includes('次の地域のApple Storeで受け取る') || regionText.includes('104-0061'))) {
              availabilityData.region = regionText;
              console.log('Region found:', regionText);
              break;
            }
          }
        }

        // Also look for any text containing postal code 104-0061
        if (!regionText) {
          const allElements = document.querySelectorAll('*');
          const regionElement = Array.from(allElements).find(el => {
            const text = el.textContent?.trim() || '';
            return text.includes('次の地域のApple Storeで受け取る') && text.includes('104-0061');
          });
          
          if (regionElement) {
            availabilityData.region = regionElement.textContent?.trim();
            console.log('Region found via text search:', availabilityData.region);
          }
        }

        // Extract full text content from the dialog
        const fullDialogText = this.extractFullDialogText(storeAvailabilityDialog);
        if (fullDialogText) {
          availabilityData.fullDialogText = fullDialogText;
          console.log('Full dialog text extracted:', fullDialogText);
        }

        console.log(`Store data analysis complete: ${availabilityData.stores.length} stores found`);
        console.log('Full availability data:', availabilityData);
        
        // Always send notification for store availability results (even if no stores found)
        if (!this.storeNotificationSent) {
          console.log('Sending store availability notification with data:', availabilityData);
        this.safeNotifyBackgroundScript({
          type: 'STORE_AVAILABILITY_RESULTS',
          data: availabilityData
        });
          this.lastStoreData = availabilityData;
          this.storeNotificationSent = true;
        } else if (this.storeNotificationSent) {
          console.log('Store notification already sent, skipping to avoid spam');
        } else {
          console.log('No meaningful store data found, skipping notification');
        }
        return true; // Found and analyzed store data
      }

      console.log('Store availability dialog not found for analysis');
      
      // Even if no dialog found, try to send a basic notification
      if (!this.storeNotificationSent) {
        console.log('No store dialog found, sending basic notification');
        const basicAvailabilityData = {
          timestamp: new Date().toISOString(),
          dialogType: 'no_dialog_found',
          stores: [],
          summary: 'Store availability dialog not found',
          hasAvailability: false,
          analysisAttempt: 'no_dialog'
        };
        
        this.safeNotifyBackgroundScript({
          type: 'STORE_AVAILABILITY_RESULTS',
          data: basicAvailabilityData
        });
        this.lastStoreData = basicAvailabilityData;
        this.storeNotificationSent = true;
      }
      
      return false; // No store data found
    } catch (error) {
      console.error('Error analyzing store data:', error);
      return false;
    }
  }

  hasStoreDataChanged(newData) {
    if (!this.lastStoreData) return true;
    
    // Compare store data
    const lastStores = this.lastStoreData.stores || [];
    const newStores = newData.stores || [];
    
    if (lastStores.length !== newStores.length) return true;
    
    // Compare each store
    for (let i = 0; i < newStores.length; i++) {
      const lastStore = lastStores[i];
      const newStore = newStores[i];
      
      if (!lastStore || !newStore) return true;
      if (lastStore.name !== newStore.name) return true;
      if (lastStore.isAvailable !== newStore.isAvailable) return true;
      if (lastStore.status !== newStore.status) return true;
    }
    
    // Compare summary
    if (this.lastStoreData.summary !== newData.summary) return true;
    
    return false;
  }

  extractFullDialogText(dialogElement) {
    try {
      if (!dialogElement) {
        console.log('No dialog element provided for text extraction');
        return null;
      }

      // Get all text content from the dialog
      const fullText = dialogElement.textContent || dialogElement.innerText || '';
      
      if (fullText.trim()) {
        console.log('Extracted full dialog text length:', fullText.length);
        return fullText.trim();
      }

      // Fallback: try to get text from specific sections
      const sections = [
        '.rf-productlocator-pickuploctionheader',
        '.rf-productlocator-nopickupstores',
        '.rf-productlocator-stores',
        '.rf-productlocator-deliveryheader',
        '.rf-productlocator-deliveryquotes'
      ];

      let combinedText = '';
      sections.forEach(selector => {
        const element = dialogElement.querySelector(selector);
        if (element) {
          const text = element.textContent || element.innerText || '';
          if (text.trim()) {
            combinedText += text.trim() + '\n\n';
          }
        }
      });

      if (combinedText.trim()) {
        console.log('Extracted text from sections, length:', combinedText.length);
        return combinedText.trim();
      }

      console.log('No text content found in dialog');
      return null;
    } catch (error) {
      console.error('Error extracting full dialog text:', error);
      return null;
    }
  }

  getElementSelector(element) {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  ensureOptionsSelected() {
    // Check if Cosmic Orange is still selected, if not, select it
    const cosmicOrangeInput = document.querySelector('input[data-autom="dimensionColorcosmicorange"]');
    if (cosmicOrangeInput && !cosmicOrangeInput.checked) {
      console.log('Re-selecting Cosmic Orange color...');
      cosmicOrangeInput.click();
    }

    // Check if 256GB is still selected, if not, select it
    const capacity256Input = document.querySelector('input[data-autom="dimensionCapacity256gb"]');
    if (capacity256Input && !capacity256Input.checked) {
      console.log('Re-selecting 256GB capacity...');
      capacity256Input.click();
    }

    // Check if full price payment is still selected, if not, select it
    const fullPriceInput = document.querySelector('input[data-autom="purchaseGroupOptionfullprice"]');
    if (fullPriceInput && !fullPriceInput.checked) {
      console.log('Re-selecting full price payment...');
      fullPriceInput.click();
    }

    // Check if No AppleCare+ is still selected, if not, select it
    const noAppleCareInput = document.querySelector('input[data-autom="noapplecare"]');
    if (noAppleCareInput && !noAppleCareInput.checked) {
      console.log('Re-selecting No AppleCare+...');
      noAppleCareInput.click();
    }
  }

  hasAvailabilityChanged(newData) {
    if (!this.lastAvailability) return true;
    
    // Compare availability states
    const lastStates = this.lastAvailability.availability;
    const newStates = newData.availability;
    
    for (const key in newStates) {
      if (lastStates[key]?.isAvailable !== newStates[key]?.isAvailable) {
        return true;
      }
    }
    
    return false;
  }

  safeNotifyBackgroundScript(message) {
    try {
      // Check if extension context is still valid
      if (!chrome || !chrome.runtime || !chrome.runtime.sendMessage) {
        console.warn('Extension context invalidated, cannot send message:', message);
        return false;
      }

      chrome.runtime.sendMessage(message).catch(error => {
        console.error('Failed to send message to background script:', error);
        
        // If context is invalidated, try to recover
        if (error.message && error.message.includes('Extension context invalidated')) {
          console.log('Extension context invalidated during message send, attempting to recover...');
          this.handleContextInvalidation();
        }
      });
      return true;
    } catch (error) {
      console.error('Error in safeNotifyBackgroundScript:', error);
      return false;
    }
  }

  notifyBackgroundScript(availabilityData) {
    // Send message to background script
    this.safeNotifyBackgroundScript({
      type: 'AVAILABILITY_CHANGE',
      data: availabilityData
    });
  }

  handleContextInvalidation() {
    try {
      console.log('Handling extension context invalidation...');
      
      // Send a fallback notification about context invalidation
      this.sendFallbackNotification();
      
      // Stop current monitoring
      this.stopMonitoring();
      
      // Clear any pending timeouts/intervals
      if (this.checkInterval) {
        clearInterval(this.checkInterval);
        this.checkInterval = null;
      }
      
      if (this.popupMonitorInterval) {
        clearInterval(this.popupMonitorInterval);
        this.popupMonitorInterval = null;
      }
      
      // Reset state
      this.isMonitoring = false;
      this.storeNotificationSent = false;
      this.lastAvailability = null;
      this.lastStoreData = null;
      
      // Try to reinitialize after a delay
      setTimeout(() => {
        console.log('Attempting to reinitialize after context invalidation...');
        try {
          this.init();
        } catch (reinitError) {
          console.error('Failed to reinitialize after context invalidation:', reinitError);
        }
      }, 5000); // Wait 5 seconds before reinitializing
      
    } catch (error) {
      console.error('Error handling context invalidation:', error);
    }
  }

  sendFallbackNotification() {
    try {
      // Try to send a notification about the error
      const fallbackData = {
        timestamp: new Date().toISOString(),
        dialogType: 'context_invalidated',
        stores: [],
        summary: 'Extension context invalidated - monitoring stopped',
        hasAvailability: false,
        analysisAttempt: 'context_error',
        error: 'Extension context invalidated'
      };
      
      // Try to send via background script first
      if (this.isExtensionContextValid()) {
        this.safeNotifyBackgroundScript({
          type: 'STORE_AVAILABILITY_RESULTS',
          data: fallbackData
        });
      } else {
        // If context is invalid, try to send via fetch directly
        this.sendDirectNotification(fallbackData);
      }
    } catch (error) {
      console.error('Error sending fallback notification:', error);
    }
  }

  sendDirectNotification(data) {
    try {
      // Hardcoded webhook URL for direct notification
      const webhookUrl = 'https://discord.com/api/webhooks/1412292401233661952/xsddZeYv18XDHsHAJgfQg0qd4FpBE678v_6ZbXN2nLrHIvo23h30rUozLizY5sbm30fW';
      
      const embed = {
        title: '🚨 iPhone 17 Pro Monitor Error',
        color: 0xff0000,
        timestamp: data.timestamp,
        fields: [
          {
            name: '❌ Error',
            value: data.summary || 'Unknown error',
            inline: false
          },
          {
            name: '🔧 Status',
            value: 'Extension context invalidated - monitoring stopped',
            inline: false
          },
          {
            name: '⏰ Time',
            value: new Date().toLocaleString(),
            inline: false
          }
        ],
        footer: {
          text: 'iPhone 17 Pro Monitor Extension - Error Report',
          icon_url: 'https://www.apple.com/favicon.ico'
        }
      };

      const payload = {
        content: '🚨 **iPhone 17 Pro Monitor Error**',
        embeds: [embed]
      };

      fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      }).then(response => {
        if (response.ok) {
          console.log('Fallback notification sent successfully');
        } else {
          console.error('Failed to send fallback notification:', response.status);
        }
      }).catch(error => {
        console.error('Error sending fallback notification:', error);
      });
    } catch (error) {
      console.error('Error in sendDirectNotification:', error);
    }
  }
}

// Initialize the monitor when the page loads
function initializeMonitor() {
  try {
    new iPhoneAvailabilityMonitor();
  } catch (error) {
    console.error('Error initializing monitor:', error);
    
    // Send fallback notification about initialization error
    if (error.message && error.message.includes('Extension context invalidated')) {
      console.log('Extension context invalidated during initialization, sending fallback notification');
      
      const fallbackData = {
        timestamp: new Date().toISOString(),
        dialogType: 'init_error',
        stores: [],
        summary: 'Extension context invalidated during initialization',
        hasAvailability: false,
        analysisAttempt: 'init_error',
        error: 'Extension context invalidated during initialization'
      };
      
      // Try to send direct notification
      sendDirectNotification(fallbackData);
    }
  }
}

function sendDirectNotification(data) {
  try {
    // Hardcoded webhook URL for direct notification
    const webhookUrl = 'https://discord.com/api/webhooks/1412292401233661952/xsddZeYv18XDHsHAJgfQg0qd4FpBE678v_6ZbXN2nLrHIvo23h30rUozLizY5sbm30fW';
    
    const embed = {
      title: '🚨 iPhone 17 Pro Monitor Error',
      color: 0xff0000,
      timestamp: data.timestamp,
      fields: [
        {
          name: '❌ Error',
          value: data.summary || 'Unknown error',
          inline: false
        },
        {
          name: '🔧 Status',
          value: 'Extension context invalidated - monitoring stopped',
          inline: false
        },
        {
          name: '⏰ Time',
          value: new Date().toLocaleString(),
          inline: false
        }
      ],
      footer: {
        text: 'iPhone 17 Pro Monitor Extension - Error Report',
        icon_url: 'https://www.apple.com/favicon.ico'
      }
    };

    const payload = {
      content: '🚨 **iPhone 17 Pro Monitor Error**',
      embeds: [embed]
    };

    fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    }).then(response => {
      if (response.ok) {
        console.log('Fallback notification sent successfully');
      } else {
        console.error('Failed to send fallback notification:', response.status);
      }
    }).catch(error => {
      console.error('Error sending fallback notification:', error);
    });
  } catch (error) {
    console.error('Error in sendDirectNotification:', error);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeMonitor);
} else {
  initializeMonitor();
}

// Also initialize on navigation changes (for SPA behavior)
let currentUrl = window.location.href;
const observer = new MutationObserver(() => {
  if (window.location.href !== currentUrl) {
    currentUrl = window.location.href;
    // Reinitialize monitor for new page
    setTimeout(() => {
      new iPhoneAvailabilityMonitor();
    }, 1000);
  }
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
