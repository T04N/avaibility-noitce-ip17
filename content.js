// Content script for monitoring iPhone 17 Pro availability
class iPhoneAvailabilityMonitor {
  constructor() {
    this.isMonitoring = false;
    this.lastAvailability = null;
    this.lastStoreData = null;
    this.storeNotificationSent = false;
    this.checkInterval = null;
    this.init();
  }

  init() {
    console.log('iPhone 17 Pro Availability Monitor initialized');
    this.startMonitoring();
    this.autoSelectOptions();
  }

  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    console.log('Starting availability monitoring...');
    
    // Check immediately
    this.checkAvailability();
    
    // Check every 2 seconds
    this.checkInterval = setInterval(() => {
      this.checkAvailability();
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
        console.log('Availability changed:', availabilityData);
        this.notifyBackgroundScript(availabilityData);
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
    console.log('Auto-selecting iPhone options...');
    
    // Wait for page to load completely
    setTimeout(() => {
      this.selectColor();
      this.selectCapacity();
      this.selectPaymentMethod();
      this.selectAppleCare();
      this.retryStoreAvailabilityCheck(0);
    }, 2000);
  }

  retryStoreAvailabilityCheck(attempt) {
    const maxAttempts = 31;
    const delay = 3000; // 3 seconds between attempts

    if (attempt >= maxAttempts) {
      console.log('Max attempts reached for finding store button');
      return;
    }

    setTimeout(() => {
      console.log(`Looking for store button (attempt ${attempt + 1}/${maxAttempts})...`);
      const found = this.checkStoreAvailability();
      
      if (!found && attempt < maxAttempts - 1) {
        console.log('Store button not found, retrying...');
        this.retryStoreAvailabilityCheck(attempt + 1);
      }
    }, delay);
  }

  selectColor() {
    try {
      // Try to select Cosmic Orange color (コズミックオレンジ)
      const cosmicOrangeInput = document.querySelector('input[data-autom="dimensionColorcosmicorange"]');
      if (cosmicOrangeInput && !cosmicOrangeInput.checked) {
        console.log('Selecting Cosmic Orange color...');
        cosmicOrangeInput.click();
        this.notifyBackgroundScript({
          type: 'COLOR_SELECTED',
          color: 'cosmicorange',
          timestamp: new Date().toISOString()
        });
      } else if (cosmicOrangeInput && cosmicOrangeInput.checked) {
        console.log('Cosmic Orange already selected');
      } else {
        // Fallback to Silver if Cosmic Orange not available
        const silverInput = document.querySelector('input[data-autom="dimensionColorsilver"]');
        if (silverInput && !silverInput.checked) {
          console.log('Selecting Silver color as fallback...');
          silverInput.click();
          this.notifyBackgroundScript({
            type: 'COLOR_SELECTED',
            color: 'silver',
            timestamp: new Date().toISOString()
          });
        }
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
        this.notifyBackgroundScript({
          type: 'CAPACITY_SELECTED',
          capacity: '256gb',
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
        this.notifyBackgroundScript({
          type: 'PAYMENT_SELECTED',
          payment: 'fullprice',
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
        this.notifyBackgroundScript({
          type: 'APPLECARE_SELECTED',
          applecare: 'none',
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
      // Look for Apple Ginza store availability button with multiple selectors
      const selectors = [
        'button[data-ase-overlay="buac-overlay"]',
        'button.as-retailavailabilitytrigger-infobutton',
        'button.retail-availability-search-trigger',
        'button[data-ase-click="show"]',
        'button:contains("Apple 銀座")',
        'button:contains("銀座")'
      ];

      let appleGinzaButton = null;
      for (const selector of selectors) {
        appleGinzaButton = document.querySelector(selector);
        if (appleGinzaButton) break;
      }

      // If not found with selectors, look for any button containing "Apple" or "銀座"
      if (!appleGinzaButton) {
        const allButtons = document.querySelectorAll('button');
        appleGinzaButton = Array.from(allButtons).find(btn => {
          const text = btn.textContent?.toLowerCase() || '';
          return text.includes('apple') || text.includes('銀座') || text.includes('ginza');
        });
      }

      if (appleGinzaButton) {
        console.log('Found Apple Ginza store button, clicking to check availability...');
        appleGinzaButton.click();
        
        this.notifyBackgroundScript({
          type: 'STORE_AVAILABILITY_CHECK',
          store: 'Apple Ginza',
          timestamp: new Date().toISOString()
        });

        // Try multiple times to check for availability results
        this.retryAvailabilityCheck(0);
        
        // Also retry store data analysis 30 times
        this.retryStoreDataAnalysis(0);
        return true; // Found and clicked
      } else {
        console.log('Apple Ginza store button not found');
        return false; // Not found
      }
    } catch (error) {
      console.error('Error checking store availability:', error);
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
      console.log(`Checking availability results (attempt ${attempt + 1}/${maxAttempts})...`);
      const hasResults = this.checkAvailabilityResults();
      
      if (!hasResults && attempt < maxAttempts - 1) {
        console.log('No results found, retrying...');
        this.retryAvailabilityCheck(attempt + 1);
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
      console.log(`Analyzing store data (attempt ${attempt + 1}/${maxAttempts})...`);
      const hasStoreData = this.analyzeStoreData();
      
      if (!hasStoreData && attempt < maxAttempts - 1) {
        console.log('No store data found, retrying...');
        this.retryStoreDataAnalysis(attempt + 1);
      }
    }, delay);
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
          stores: [],
          summary: '',
          hasAvailability: false,
          analysisAttempt: 'success'
        };

        // Check for "no pickup stores" message
        if (noPickupStores) {
          const noPickupButton = noPickupStores.querySelector('.rf-productlocator-nopickupstores-btn');
          if (noPickupButton) {
            const summaryText = noPickupButton.querySelector('.rf-productlocator-buttontitle')?.textContent?.trim();
            if (summaryText) {
              availabilityData.summary = summaryText;
              console.log('No pickup stores message found:', summaryText);
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
          'h3:contains("次の地域のApple Storeで受け取る")',
          'h3:contains("104-0061")'
        ];

        let regionText = null;
        for (const selector of regionSelectors) {
          const element = document.querySelector(selector);
          if (element) {
            regionText = element.textContent?.trim();
            if (regionText && regionText.includes('次の地域のApple Storeで受け取る')) {
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

        console.log(`Store data analysis complete: ${availabilityData.stores.length} stores found`);
        console.log('Full availability data:', availabilityData);
        
        // Only send notification if we have meaningful store data and haven't sent it yet
        if ((availabilityData.stores.length > 0 || availabilityData.summary) && !this.storeNotificationSent) {
          console.log('Sending store availability notification with data:', availabilityData);
          this.notifyBackgroundScript({
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

  notifyBackgroundScript(availabilityData) {
    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'AVAILABILITY_CHANGE',
      data: availabilityData
    }).catch(error => {
      console.error('Failed to send message to background script:', error);
    });
  }
}

// Initialize the monitor when the page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new iPhoneAvailabilityMonitor();
  });
} else {
  new iPhoneAvailabilityMonitor();
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
