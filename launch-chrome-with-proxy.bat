@echo off
echo Starting Chrome with Proxy: tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271
echo.

REM Kill existing Chrome processes
taskkill /f /im chrome.exe 2>nul

REM Start Chrome with proxy
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" ^
  --proxy-server="http://tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271" ^
  --user-data-dir="%TEMP%\chrome-proxy-profile" ^
  --disable-web-security ^
  --disable-features=VizDisplayCompositor ^
  --load-extension="%CD%" ^
  --enable-extensions ^
  --no-first-run ^
  --no-default-browser-check

echo Chrome started with proxy configuration
echo Proxy: ip.mproxy.vn:12271
echo Username: tev
echo.
echo Press any key to exit...
pause >nul
