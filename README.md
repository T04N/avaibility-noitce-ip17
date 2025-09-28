# iPhone 17/17 Pro Availability Monitor

Automated monitoring system for iPhone 17 and iPhone 17 Pro availability on Apple Japan website with Discord notifications.

## 🚀 Features

- **Auto-selection**: Automatically selects iPhone configuration options
- **Store availability check**: Monitors in-store availability at Apple Ginza
- **Discord notifications**: Sends real-time updates to Discord channel
- **Auto-popup closer**: Automatically closes any popups that appear
- **Auto-reload**: Refreshes page every 12 seconds for latest data
- **Puppeteer integration**: Automated browser control

## 📱 Supported Models

- **iPhone 17**: Lavender, Sage, Mist Blue, White, Black
- **iPhone 17 Pro**: Cosmic Orange, Silver, Deep Blue

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Discord Webhook

The Discord webhook URL is already hardcoded in the extension. If you need to change it, edit `background.js`:

```javascript
this.webhookUrl = 'https://discord.com/api/webhooks/YOUR_WEBHOOK_URL';
```

### 3. Run the Monitor

```bash
# Run with visible browser
npm start

# Run in headless mode (background)
npm run start:headless
```

## 🔧 Manual Extension Installation

If you prefer to install the extension manually in Chrome:

1. Open Chrome and go to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked"
4. Select the project folder
5. Navigate to `https://www.apple.com/jp/shop/buy-iphone/iphone-17`

## 📋 Auto-Selection Process

The extension automatically:

1. **Selects color**: Lavender (iPhone 17) / Cosmic Orange (iPhone 17 Pro)
2. **Selects capacity**: 256GB
3. **Selects trade-in**: No trade-in
4. **Selects carrier**: SIM-free
5. **Selects payment**: Full price
6. **Selects AppleCare+**: None
7. **Checks store availability**: Apple Ginza
8. **Closes popups**: Any overlays or modals
9. **Reloads page**: Every 12 seconds

## 🔔 Discord Notifications

The system sends notifications for:

- ✅ **Auto-selection steps** (color, capacity, payment, etc.)
- 🏪 **Store availability results** (available/unavailable stores)
- ❌ **Errors** (context invalidation, popup issues)

## 🛠️ Configuration

### Change Reload Interval

Edit `content.js`:

```javascript
// Change from 12000ms (12 seconds) to your preferred interval
setTimeout(() => {
  window.location.reload();
}, 12000); // Your interval here
```

### Change Target Store

Edit `content.js` in the `checkStoreAvailability()` function:

```javascript
// Change from "Apple Ginza" to your preferred store
const storeButton = document.querySelector('button:contains("Apple Ginza")');
```

### Enable/Disable Notifications

Edit `background.js`:

```javascript
// Comment out to disable startup notification
// setTimeout(() => {
//   this.sendStartupNotification();
// }, 1000);
```

## 📊 Console Logs

The system provides detailed console logging:

- 🎨 Color selection
- 💾 Capacity selection  
- 💳 Payment selection
- 🛡️ AppleCare+ selection
- 🏪 Store availability checks
- 🚫 Popup closing
- 🔄 Page reloads

## 🚨 Troubleshooting

### Extension Context Invalidated

This error occurs when the extension reloads. The system automatically handles this by:
- Stopping current monitoring
- Clearing intervals
- Attempting reinitialization

### Popup Issues

The system automatically closes common popups including:
- AppleCare+ overlays
- Video players
- Modal dialogs
- Generic close buttons

### Store Button Not Found

If the store availability button isn't found:
- Check if the page has fully loaded
- Verify the store name matches exactly
- Check console for error messages

## 📁 File Structure

```
iphone-17-monitor/
├── manifest.json          # Extension manifest
├── content.js             # Main extension logic
├── background.js          # Discord notifications
├── popup.html             # Extension popup UI
├── popup.js               # Popup functionality
├── puppeteer-runner.js    # Puppeteer automation
├── package.json           # Dependencies
└── README.md              # This file
```

## 🔄 Workflow

1. **Puppeteer launches** Chrome with extension loaded
2. **Navigates** to iPhone 17/17 Pro page
3. **Extension initializes** and starts monitoring
4. **Auto-selects** all configuration options
5. **Checks store availability** at Apple Ginza
6. **Sends Discord notifications** with results
7. **Closes any popups** that appear
8. **Reloads page** every 12 seconds
9. **Repeats** the entire process

## 🎯 Target URLs

- **iPhone 17**: `https://www.apple.com/jp/shop/buy-iphone/iphone-17`
- **iPhone 17 Pro**: `https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro`

## 📝 Notes

- The system is designed for Japanese Apple Store
- All text and selectors are optimized for Japanese locale
- Discord webhook is pre-configured
- Extension works with both iPhone 17 and iPhone 17 Pro models
- Auto-popup closing prevents interruptions
- 12-second reload cycle ensures fresh data

## 🛑 Stopping the Monitor

Press `Ctrl+C` in the terminal to gracefully stop the monitor and close the browser.