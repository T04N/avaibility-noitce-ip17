// Background script for Discord webhook integration
class DiscordNotifier {
  constructor() {
    this.webhookUrl = 'https://discord.com/api/webhooks/1412292401233661952/xsddZeYv18XDHsHAJgfQg0qd4FpBE678v_6ZbXN2nLrHIvo23h30rUozLizY5sbm30fW';
    this.isEnabled = true;
    this.lastNotificationTime = null;
    this.notificationCooldown = 2000; // 2 seconds cooldown
    this.init();
  }

  async init() {
    // Load settings from storage
    await this.loadSettings();
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });

    console.log('Discord Notifier initialized');
    
    // Send test notification on startup
    setTimeout(() => {
      this.sendStartupNotification();
    }, 2000);
  }

  async loadSettings() {
    try {
      // Hard-coded settings - no need to load from storage
      console.log('Using hard-coded webhook URL');
      console.log('Settings loaded:', { webhookUrl: !!this.webhookUrl, isEnabled: this.isEnabled });
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.type) {
      case 'AVAILABILITY_CHANGE':
        await this.handleAvailabilityChange(message.data);
        break;
      case 'COLOR_SELECTED':
        await this.handleColorSelection(message);
        break;
      case 'CAPACITY_SELECTED':
        await this.handleCapacitySelection(message);
        break;
      case 'PAYMENT_SELECTED':
        await this.handlePaymentSelection(message);
        break;
      case 'APPLECARE_SELECTED':
        await this.handleAppleCareSelection(message);
        break;
      case 'STORE_AVAILABILITY_CHECK':
        await this.handleStoreAvailabilityCheck(message);
        break;
      case 'STORE_AVAILABILITY_RESULTS':
        await this.handleStoreAvailabilityResults(message);
        break;
      case 'GET_SETTINGS':
        sendResponse({
          webhookUrl: this.webhookUrl,
          isEnabled: this.isEnabled
        });
        break;
      case 'UPDATE_SETTINGS':
        await this.updateSettings(message.settings);
        sendResponse({ success: true });
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  async updateSettings(settings) {
    try {
      await chrome.storage.sync.set({
        discordWebhookUrl: settings.webhookUrl,
        notificationsEnabled: settings.isEnabled
      });
      
      this.webhookUrl = settings.webhookUrl;
      this.isEnabled = settings.isEnabled;
      
      console.log('Settings updated:', { webhookUrl: !!this.webhookUrl, isEnabled: this.isEnabled });
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  }

  async handleAvailabilityChange(availabilityData) {
    if (!this.isEnabled || !this.webhookUrl) {
      console.log('Notifications disabled or webhook URL not set');
      return;
    }

    // Check cooldown to avoid spam (2 seconds)
    const now = Date.now();
    if (this.lastNotificationTime && (now - this.lastNotificationTime) < this.notificationCooldown) {
      console.log('Notification on cooldown');
      return;
    }

    try {
      await this.sendDiscordNotification(availabilityData);
      this.lastNotificationTime = now;
    } catch (error) {
      console.error('Failed to send Discord notification:', error);
    }
  }

  async sendDiscordNotification(availabilityData) {
    const embed = this.createDiscordEmbed(availabilityData);
    
    const payload = {
      content: '🍎 **iPhone 17 Pro Availability Alert**',
      embeds: [embed]
    };

    const response = await fetch(this.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Discord webhook failed: ${response.status} ${response.statusText}`);
    }

    console.log('Discord notification sent successfully');
  }

  createDiscordEmbed(availabilityData) {
    const availableItems = [];
    const unavailableItems = [];

    // Analyze availability data
    for (const [key, item] of Object.entries(availabilityData.availability)) {
      if (item.isAvailable) {
        availableItems.push(`✅ ${item.text || key}`);
      } else {
        unavailableItems.push(`❌ ${item.text || key}`);
      }
    }

    const embed = {
      title: 'iPhone 17 Pro Availability Update',
      url: availabilityData.url,
      color: availableItems.length > 0 ? 0x00ff00 : 0xff0000, // Green if available, red if not
      timestamp: availabilityData.timestamp,
      fields: [
        {
          name: '📱 Available Items',
          value: availableItems.length > 0 ? availableItems.join('\n') : 'None available',
          inline: false
        }
      ],
      footer: {
        text: 'iPhone 17 Pro Monitor Extension',
        icon_url: 'https://www.apple.com/favicon.ico'
      }
    };

    if (unavailableItems.length > 0) {
      embed.fields.push({
        name: '🚫 Unavailable Items',
        value: unavailableItems.slice(0, 10).join('\n'), // Limit to 10 items
        inline: false
      });
    }

    // Add buy buttons status
    if (availabilityData.availability.buyButtons) {
      const buyButtonStatus = availabilityData.availability.buyButtons
        .map(btn => `${btn.isAvailable ? '✅' : '❌'} ${btn.text}`)
        .join('\n');
      
      embed.fields.push({
        name: '🛒 Buy Buttons',
        value: buyButtonStatus || 'No buy buttons found',
        inline: false
      });
    }

    return embed;
  }

  async sendStartupNotification() {
    try {
      const payload = {
        content: '🚀 **iPhone 17 Pro Monitor Started**',
        embeds: [{
          title: 'Extension Activated',
          description: 'iPhone 17 Pro availability monitor is now active and checking every 2 seconds!',
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Ready to monitor iPhone 17 Pro availability',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Startup notification sent successfully');
      } else {
        console.error('Failed to send startup notification:', response.status);
      }
    } catch (error) {
      console.error('Error sending startup notification:', error);
    }
  }

  async handleColorSelection(message) {
    try {
      const payload = {
        content: `🎨 **Color Selected: ${message.color}**`,
        embeds: [{
          title: 'iPhone Color Selection',
          description: `Automatically selected color: **${message.color}**`,
          color: 0xffa500,
          timestamp: message.timestamp,
          footer: {
            text: 'Auto-selection completed',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Color selection notification sent');
      }
    } catch (error) {
      console.error('Failed to send color selection notification:', error);
    }
  }

  async handleCapacitySelection(message) {
    try {
      const payload = {
        content: `💾 **Capacity Selected: ${message.capacity}**`,
        embeds: [{
          title: 'iPhone Capacity Selection',
          description: `Automatically selected capacity: **${message.capacity}**`,
          color: 0x00bfff,
          timestamp: message.timestamp,
          footer: {
            text: 'Auto-selection completed',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Capacity selection notification sent');
      }
    } catch (error) {
      console.error('Failed to send capacity selection notification:', error);
    }
  }

  async handlePaymentSelection(message) {
    try {
      const payload = {
        content: `💳 **Payment Method Selected: ${message.payment}**`,
        embeds: [{
          title: 'iPhone Payment Selection',
          description: `Automatically selected payment method: **${message.payment}**`,
          color: 0x00ff00,
          timestamp: message.timestamp,
          footer: {
            text: 'Auto-selection completed',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Payment selection notification sent');
      }
    } catch (error) {
      console.error('Failed to send payment selection notification:', error);
    }
  }

  async handleAppleCareSelection(message) {
    try {
      const payload = {
        content: `🛡️ **AppleCare+ Selected: ${message.applecare}**`,
        embeds: [{
          title: 'iPhone AppleCare+ Selection',
          description: `Automatically selected AppleCare+ option: **${message.applecare}**`,
          color: 0xff6b6b,
          timestamp: message.timestamp,
          footer: {
            text: 'Auto-selection completed',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('AppleCare+ selection notification sent');
      }
    } catch (error) {
      console.error('Failed to send AppleCare+ selection notification:', error);
    }
  }

  async handleStoreAvailabilityCheck(message) {
    try {
      const payload = {
        content: `🏪 **Checking Store Availability: ${message.store}**`,
        embeds: [{
          title: 'Store Availability Check',
          description: `Checking iPhone 17 Pro availability at **${message.store}**`,
          color: 0x3498db,
          timestamp: message.timestamp,
          footer: {
            text: 'Store availability check initiated',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Store availability check notification sent');
      }
    } catch (error) {
      console.error('Failed to send store availability check notification:', error);
    }
  }

  async handleStoreAvailabilityResults(message) {
    try {
      console.log('Received store availability results message:', message);
      
      const data = message.data;
      
      // Validate data structure
      if (!data) {
        console.error('No data provided in message');
        return;
      }
      
      if (typeof data !== 'object') {
        console.error('Data is not an object:', typeof data);
        return;
      }
      
      console.log('Processing store availability results:', data);
      
      // Handle new store availability dialog format
      if (data.dialogType === 'store_availability') {
        // Ensure stores array exists and is valid
        const stores = Array.isArray(data.stores) ? data.stores : [];
        console.log('Processing stores:', stores.length, 'stores found');
        
        const availableStores = stores.filter(store => {
          if (!store || typeof store !== 'object') return false;
          return store.isAvailable === true;
        });
        
        const unavailableStores = stores.filter(store => {
          if (!store || typeof store !== 'object') return false;
          return store.isAvailable === false;
        });
        
        console.log('Available stores:', availableStores.length);
        console.log('Unavailable stores:', unavailableStores.length);

        const embed = {
          title: `🏪 iPhone 17 Pro Store Availability Results`,
          color: availableStores.length > 0 ? 0x00ff00 : 0xff0000,
          timestamp: data.timestamp,
          fields: []
        };

        // Add region information if available
        if (data.region && typeof data.region === 'string' && data.region.trim()) {
          embed.fields.push({
            name: '📍 Region',
            value: data.region.trim(),
            inline: false
          });
        }

        // Add summary if available
        if (data.summary && typeof data.summary === 'string' && data.summary.trim()) {
          embed.fields.push({
            name: '📋 Summary',
            value: data.summary.trim(),
            inline: false
          });
        }

        // Add available stores
        if (availableStores.length > 0) {
          embed.fields.push({
            name: '✅ Available Stores',
            value: availableStores.map(store => {
              if (!store || typeof store !== 'object') return '• **Invalid Store Data**';
              
              const name = (store.name && typeof store.name === 'string') ? store.name.trim() : 'Unknown Store';
              const location = (store.location && typeof store.location === 'string') ? store.location.trim() : 'Unknown Location';
              const status = (store.status && typeof store.status === 'string') ? store.status.trim() : 'Available';
              
              return `• **${name}**\n  📍 ${location}\n  📱 ${status}`;
            }).join('\n\n'),
            inline: false
          });
        } else {
          embed.fields.push({
            name: '❌ No Available Stores',
            value: 'No stores have iPhone 17 Pro in stock today',
            inline: false
          });
        }

        // Add unavailable stores
        if (unavailableStores.length > 0) {
          embed.fields.push({
            name: '🚫 Unavailable Stores',
            value: unavailableStores.slice(0, 6).map(store => {
              if (!store || typeof store !== 'object') return '• **Invalid Store Data**';
              
              const name = (store.name && typeof store.name === 'string') ? store.name.trim() : 'Unknown Store';
              const status = (store.status && typeof store.status === 'string') ? store.status.trim() : 'Not available';
              
              return `• **${name}** - ${status}`;
            }).join('\n'),
            inline: false
          });
        }

        // Add delivery options if available
        if (data.deliveryOptions && Array.isArray(data.deliveryOptions) && data.deliveryOptions.length > 0) {
          embed.fields.push({
            name: '🚚 Delivery Options',
            value: data.deliveryOptions.map(option => {
              if (typeof option === 'string' && option.trim()) {
                return `• ${option.trim()}`;
              }
              return '• Unknown option';
            }).join('\n'),
            inline: false
          });
        }

        embed.footer = {
          text: `Checked ${stores.length} stores • ${data.hasAvailability ? 'Some availability found' : 'No availability'}`,
          icon_url: 'https://www.apple.com/favicon.ico'
        };

        const payload = {
          content: `📱 **iPhone 17 Pro Store Availability Check Complete**`,
          embeds: [embed]
        };

        const response = await fetch(this.webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          console.log('Store availability results notification sent');
        }
        return;
      }

      // Handle legacy format
      const results = data.results || [];
      const availableItems = results.filter(item => item && item.isAvailable);
      const unavailableItems = results.filter(item => item && !item.isAvailable);

      const embed = {
        title: `🏪 Store Availability Results - ${data.store}`,
        color: availableItems.length > 0 ? 0x00ff00 : 0xff0000,
        timestamp: data.timestamp,
        fields: [
          {
            name: '✅ Available Items',
            value: availableItems.length > 0 ? 
              availableItems.map(item => `• ${item.text || 'Unknown item'}`).join('\n') : 
              'No items available',
            inline: false
          }
        ],
        footer: {
          text: 'Store availability results',
          icon_url: 'https://www.apple.com/favicon.ico'
        }
      };

      if (unavailableItems.length > 0) {
        embed.fields.push({
          name: '❌ Unavailable Items',
          value: unavailableItems.slice(0, 5).map(item => `• ${item.text || 'Unknown item'}`).join('\n'),
          inline: false
        });
      }

      const payload = {
        content: `📱 **Store Availability Results for iPhone 17 Pro**`,
        embeds: [embed]
      };

      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Store availability results notification sent');
      }
    } catch (error) {
      console.error('Failed to send store availability results notification:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        messageData: message
      });
    }
  }
}

// Initialize the Discord notifier
new DiscordNotifier();
