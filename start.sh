#!/bin/bash

echo "🚀 Starting iPhone 17/17 Pro Availability Monitor..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Start the monitor
echo "🎯 Launching browser with extension..."
echo "📱 Extension will monitor iPhone 17/17 Pro availability"
echo "🔔 Discord notifications will be sent automatically"
echo "🔄 Page will reload every 12 seconds"
echo ""
echo "Press Ctrl+C to stop monitoring"
echo ""

node puppeteer-runner.js
