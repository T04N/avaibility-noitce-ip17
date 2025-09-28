#!/bin/bash

echo "Starting Chrome with Proxy: tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271"
echo

# Kill existing Chrome processes
pkill -f chrome 2>/dev/null

# Get current directory
CURRENT_DIR=$(pwd)

# Start Chrome with proxy (Mac)
if [[ "$OSTYPE" == "darwin"* ]]; then
    /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
      --proxy-server="http://tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271" \
      --user-data-dir="/tmp/chrome-proxy-profile" \
      --disable-web-security \
      --disable-features=VizDisplayCompositor \
      --load-extension="$CURRENT_DIR" \
      --enable-extensions \
      --no-first-run \
      --no-default-browser-check &
fi

# Start Chrome with proxy (Linux)
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    google-chrome \
      --proxy-server="http://tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271" \
      --user-data-dir="/tmp/chrome-proxy-profile" \
      --disable-web-security \
      --disable-features=VizDisplayCompositor \
      --load-extension="$CURRENT_DIR" \
      --enable-extensions \
      --no-first-run \
      --no-default-browser-check &
fi

echo "Chrome started with proxy configuration"
echo "Proxy: ip.mproxy.vn:12271"
echo "Username: tev"
echo
echo "Press Enter to exit..."
read
