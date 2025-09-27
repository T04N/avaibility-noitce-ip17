# iPhone 17 Pro Availability Monitor

A browser extension that monitors iPhone 17 Pro availability on Apple's Japanese website and sends Discord notifications when availability changes.

## Features

- 🔍 **Real-time Monitoring**: Automatically monitors iPhone 17 Pro availability on Apple Japan
- 📱 **Discord Notifications**: Sends rich notifications to Discord when availability changes
- ⚙️ **Configurable**: Customizable check intervals and notification settings
- 🎨 **Modern UI**: Beautiful popup interface for configuration
- 🛡️ **Spam Protection**: Built-in cooldown to prevent notification spam

## Installation

1. Download or clone this repository
2. Open Chrome/Edge and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension will appear in your browser toolbar

## Setup

1. **Get Discord Webhook URL**:
   - Go to your Discord server
   - Server Settings → Integrations → Webhooks
   - Create a new webhook
   - Copy the webhook URL

2. **Configure Extension**:
   - Click the extension icon in your browser toolbar
   - Paste your Discord webhook URL
   - Set your preferred check interval (minimum 10 seconds)
   - Enable notifications
   - Click "Save Settings"

3. **Test Setup**:
   - Click "Test Webhook" to verify your Discord integration
   - Navigate to the Apple iPhone 17 Pro page to start monitoring

## Usage

1. Navigate to [Apple iPhone 17 Pro page](https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro/)
2. The extension will automatically start monitoring
3. When availability changes, you'll receive a Discord notification
4. The extension includes spam protection (5-minute cooldown between notifications)

## Files Structure

```
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script for monitoring
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
└── README.md             # This file
```

## Discord Notification Format

The extension sends rich Discord embeds with:
- ✅ Available items
- ❌ Unavailable items  
- 🛒 Buy button status
- Direct links to the Apple page
- Timestamps and status indicators

## Privacy

- No data is collected or stored externally
- All monitoring happens locally in your browser
- Discord webhook URL is stored locally in browser storage
- No tracking or analytics

## Troubleshooting

**Extension not working?**
- Make sure you're on the correct Apple page
- Check that your Discord webhook URL is valid
- Verify notifications are enabled in the popup

**No notifications?**
- Test your webhook URL using the "Test Webhook" button
- Check Discord server permissions for the webhook
- Ensure the extension has proper permissions

**High CPU usage?**
- Increase the check interval in settings
- The extension respects a minimum 10-second interval

## Development

To modify the extension:
1. Edit the source files
2. Go to `chrome://extensions/`
3. Click the refresh icon on the extension
4. Test your changes

## License

MIT License - Feel free to modify and distribute.
# avaibility-noitce-ip17
