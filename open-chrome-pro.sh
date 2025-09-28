#!/bin/bash

echo "🚀 Opening Chrome for iPhone 17 Pro Monitor..."
echo ""

# Open Chrome
echo "📱 Opening Chrome browser..."
open -a "Google Chrome"

# Wait a moment for Chrome to open
sleep 3

echo "✅ Chrome opened successfully!"
echo ""
echo "📋 Next steps:"
echo "   1. Go to: chrome://extensions/"
echo "   2. Enable 'Developer mode' (top right toggle)"
echo "   3. Click 'Load unpacked'"
echo "   4. Select this folder: $(pwd)"
echo "   5. Go to: https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro"
echo ""
echo "🎯 Extension will automatically:"
echo "   • Select Cosmic Orange color"
echo "   • Select 256GB capacity"
echo "   • Select no trade-in"
echo "   • Select SIM-free"
echo "   • Select full price payment"
echo "   • Select no AppleCare+"
echo "   • Check store availability"
echo "   • Auto-close popups"
echo "   • Reload page every 12 seconds"
echo ""
echo "🔔 Discord notifications will be sent automatically!"
echo ""

# Try to open the extensions page (may not work on all systems)
echo "🔧 Attempting to open extensions page..."
osascript -e 'tell application "Google Chrome" to open location "chrome://extensions/"' 2>/dev/null || echo "   Please manually go to chrome://extensions/"

# Wait a moment then try to open iPhone 17 Pro page
sleep 2
echo "📱 Attempting to open iPhone 17 Pro page..."
osascript -e 'tell application "Google Chrome" to open location "https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro"' 2>/dev/null || echo "   Please manually go to: https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro"

echo ""
echo "🎉 Setup complete! Extension should start working automatically."
