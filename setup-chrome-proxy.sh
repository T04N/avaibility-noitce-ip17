#!/bin/bash

echo "========================================"
echo "    Chrome Proxy Setup Script"
echo "========================================"
echo

echo "Starting Chrome with proxy configuration..."
echo "Proxy: choip.mproxy.vn:12271"
echo "Username: tev"
echo

# Kill existing Chrome instances
pkill -f "Google Chrome" 2>/dev/null

# Detect OS and Chrome path
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CHROME_PATH="google-chrome"
else
    echo "Unsupported OS: $OSTYPE"
    exit 1
fi

# Start Chrome with proxy
"$CHROME_PATH" \
  --proxy-server="http://tev:B4a9yGhNsiNre0B@choip.mproxy.vn:12271" \
  --disable-web-security \
  --disable-features=VizDisplayCompositor \
  --user-data-dir="/tmp/chrome-proxy-profile" \
  --no-first-run \
  --no-default-browser-check \
  "https://www.apple.com/jp/shop/bag" &

echo
echo "Chrome started with proxy configuration!"
echo
echo "To test proxy:"
echo "1. Go to https://httpbin.org/ip"
echo "2. Check if IP is different from your real IP"
echo "3. If different, proxy is working!"
echo
