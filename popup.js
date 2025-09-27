// Popup script for iPhone 17 Pro Monitor extension
class PopupController {
  constructor() {
    this.init();
  }

  async init() {
    // Load current settings
    await this.loadSettings();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Update monitoring status
    this.updateMonitoringStatus();
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
      
      if (response) {
        document.getElementById('webhookUrl').value = response.webhookUrl || '';
        document.getElementById('notificationsEnabled').checked = response.isEnabled || false;
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.showStatus('Failed to load settings', 'error');
    }
  }

  setupEventListeners() {
    // Form submission
    document.getElementById('settingsForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveSettings();
    });

    // Test webhook button
    document.getElementById('testWebhook').addEventListener('click', () => {
      this.testWebhook();
    });

    // Real-time validation
    document.getElementById('webhookUrl').addEventListener('input', () => {
      this.validateWebhookUrl();
    });
  }

  async saveSettings() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();
    const checkInterval = parseInt(document.getElementById('checkInterval').value) || 30;
    const isEnabled = document.getElementById('notificationsEnabled').checked;

    // Validate inputs
    if (!webhookUrl) {
      this.showStatus('Please enter a Discord webhook URL', 'error');
      return;
    }

    if (!this.isValidWebhookUrl(webhookUrl)) {
      this.showStatus('Invalid Discord webhook URL format', 'error');
      return;
    }

    if (checkInterval < 10) {
      this.showStatus('Check interval must be at least 10 seconds', 'error');
      return;
    }

    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_SETTINGS',
        settings: {
          webhookUrl: webhookUrl,
          isEnabled: isEnabled,
          checkInterval: checkInterval
        }
      });

      this.showStatus('Settings saved successfully!', 'success');
      this.updateMonitoringStatus();
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.showStatus('Failed to save settings', 'error');
    }
  }

  async testWebhook() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();
    
    if (!webhookUrl) {
      this.showStatus('Please enter a webhook URL first', 'error');
      return;
    }

    if (!this.isValidWebhookUrl(webhookUrl)) {
      this.showStatus('Invalid webhook URL format', 'error');
      return;
    }

    try {
      this.showStatus('Testing webhook...', 'success');
      
      const testPayload = {
        content: '🧪 **Test Notification**',
        embeds: [{
          title: 'iPhone 17 Pro Monitor - Test',
          description: 'This is a test notification from the iPhone 17 Pro Monitor extension.',
          color: 0x00ff00,
          timestamp: new Date().toISOString(),
          footer: {
            text: 'Test successful! Your webhook is working correctly.',
            icon_url: 'https://www.apple.com/favicon.ico'
          }
        }]
      };

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload)
      });

      if (response.ok) {
        this.showStatus('✅ Webhook test successful!', 'success');
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Webhook test failed:', error);
      this.showStatus(`❌ Webhook test failed: ${error.message}`, 'error');
    }
  }

  isValidWebhookUrl(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname === 'discord.com' && 
             urlObj.pathname.startsWith('/api/webhooks/') &&
             urlObj.pathname.split('/').length >= 4;
    } catch {
      return false;
    }
  }

  validateWebhookUrl() {
    const webhookUrl = document.getElementById('webhookUrl').value.trim();
    const isValid = !webhookUrl || this.isValidWebhookUrl(webhookUrl);
    
    const input = document.getElementById('webhookUrl');
    if (webhookUrl && !isValid) {
      input.style.borderColor = '#f44336';
    } else {
      input.style.borderColor = '';
    }
  }

  showStatus(message, type) {
    const statusDiv = document.getElementById('status');
    statusDiv.textContent = message;
    statusDiv.className = `status ${type}`;
    statusDiv.style.display = 'block';
    
    // Auto-hide success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        statusDiv.style.display = 'none';
      }, 3000);
    }
  }

  updateMonitoringStatus() {
    const statusIndicator = document.getElementById('statusIndicator');
    const monitoringText = document.getElementById('monitoringText');
    
    // Check if we're on the Apple website
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const currentTab = tabs[0];
      const isOnAppleSite = currentTab && currentTab.url.includes('apple.com/jp/shop/buy-iphone/iphone-17-pro');
      
      if (isOnAppleSite) {
        statusIndicator.classList.remove('inactive');
        monitoringText.textContent = 'Monitoring iPhone 17 Pro availability...';
      } else {
        statusIndicator.classList.add('inactive');
        monitoringText.textContent = 'Navigate to Apple iPhone 17 Pro page to start monitoring';
      }
    });
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
