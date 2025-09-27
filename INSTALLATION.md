# Installation Guide

## Quick Setup (5 minutes)

### Step 1: Create Discord Webhook
1. Go to your Discord server
2. Click server name → Server Settings
3. Go to Integrations → Webhooks
4. Click "Create Webhook"
5. Choose a channel for notifications
6. Copy the webhook URL (starts with `https://discord.com/api/webhooks/`)

### Step 2: Install Extension
1. Open Chrome/Edge browser
2. Go to `chrome://extensions/` (or `edge://extensions/`)
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select this folder (`availability-noitice-ip17`)
6. The extension icon should appear in your toolbar

### Step 3: Configure Extension
1. Click the extension icon in your browser toolbar
2. Paste your Discord webhook URL
3. Set check interval (recommended: 30 seconds)
4. Enable notifications checkbox
5. Click "Save Settings"
6. Click "Test Webhook" to verify it works

### Step 4: Start Monitoring
1. Go to [Apple iPhone 17 Pro page](https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro/)
2. The extension will automatically start monitoring
3. You'll see a green indicator when monitoring is active
4. When availability changes, you'll get a Discord notification

## Troubleshooting

**Extension not loading?**
- Make sure you selected the correct folder
- Check that all files are present (manifest.json, background.js, etc.)
- Try refreshing the extensions page

**No Discord notifications?**
- Verify webhook URL is correct
- Test webhook using the "Test Webhook" button
- Check Discord server permissions
- Make sure notifications are enabled

**Extension not monitoring?**
- Navigate to the correct Apple page
- Check that the page URL contains "iphone-17-pro"
- Refresh the page if needed

## Features

- ✅ Monitors iPhone 17 Pro availability in real-time
- ✅ Sends rich Discord notifications with availability status
- ✅ Spam protection (5-minute cooldown between notifications)
- ✅ Configurable check intervals
- ✅ Beautiful popup interface
- ✅ Works on Apple Japan website

## Support

If you encounter issues:
1. Check that all files are present
2. Verify webhook URL format
3. Test with the built-in test function
4. Check browser console for errors
