@echo off
echo ========================================
echo    Chrome Proxy Setup Script
echo ========================================
echo.

echo Starting Chrome with proxy configuration...
echo Proxy: choip.mproxy.vn:12271
echo Username: tev
echo.

REM Close any existing Chrome instances
taskkill /f /im chrome.exe 2>nul

REM Start Chrome with proxy
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --proxy-server="http://tev:B4a9yGhNsiNre0B@choip.mproxy.vn:12271" ^
  --disable-web-security ^
  --disable-features=VizDisplayCompositor ^
  --user-data-dir="%TEMP%\chrome-proxy-profile" ^
  --no-first-run ^
  --no-default-browser-check ^
  "https://www.apple.com/jp/shop/bag"

echo.
echo Chrome started with proxy configuration!
echo.
echo To test proxy:
echo 1. Go to https://httpbin.org/ip
echo 2. Check if IP is different from your real IP
echo 3. If different, proxy is working!
echo.
pause
