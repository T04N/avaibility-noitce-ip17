# Proxy Setup Guide for iPhone 17/17 Pro Monitor Extension

## Proxy Configuration
- **Proxy Server**: `ip.mproxy.vn:12271`
- **Username**: `tev`
- **Password**: `B4a9yGhNsiNre0B`
- **Full Proxy String**: `tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271`

## How to Apply Proxy

### Method 1: Browser Proxy Settings (Recommended)

#### For Chrome:
1. Open Chrome Settings
2. Go to **Advanced** → **System** → **Open proxy settings**
3. In Windows Settings, click **Manual proxy setup**
4. Enable **Use a proxy server**
5. Enter:
   - **Address**: `ip.mproxy.vn`
   - **Port**: `12271`
6. Click **Save**

#### For Firefox:
1. Open Firefox Settings
2. Go to **General** → **Network Settings**
3. Select **Manual proxy configuration**
4. Enter:
   - **HTTP Proxy**: `ip.mproxy.vn`
   - **Port**: `12271`
5. Check **Use this proxy server for all protocols**
6. Click **OK**

### Method 2: Chrome Extension with Proxy

#### Option A: Use Proxy Extension
1. Install a proxy extension like "Proxy SwitchyOmega"
2. Configure the extension with:
   - **Protocol**: HTTP
   - **Server**: `ip.mproxy.vn`
   - **Port**: `12271`
   - **Username**: `tev`
   - **Password**: `B4a9yGhNsiNre0B`

#### Option B: Launch Chrome with Proxy
```bash
# Windows
chrome.exe --proxy-server="http://tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271"

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --proxy-server="http://tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271"

# Linux
google-chrome --proxy-server="http://tev:B4a9yGhNsiNre0B@ip.mproxy.vn:12271"
```

### Method 3: System-wide Proxy (Windows)

1. Open **Settings** → **Network & Internet** → **Proxy**
2. Under **Manual proxy setup**, toggle **Use a proxy server**
3. Enter:
   - **Address**: `ip.mproxy.vn`
   - **Port**: `12271`
4. Click **Save**

## Extension Proxy Features

The extension includes built-in proxy management:

### 1. Automatic Proxy Rotation
- Rotates proxy every 5 minutes
- Handles proxy failures automatically
- Resets IP when notifications fail

### 2. Proxy Reset API
- **Reset URL**: `https://mproxy.vn/capi/Q7LGuYFGAFFO4F7dJJwx3gxI-8LYe5msQw2U9E6-dig/key/B4a9yGhNsiNre0B/resetIp`
- Automatically called after 3 failed notifications
- Updates proxy server if host changes

### 3. Anti-Detection Features
- User-Agent rotation
- Browser data clearing
- Human-like behavior simulation
- Random delays between actions

## Testing Proxy Connection

### 1. Check Current IP
Visit: `https://httpbin.org/ip` to see your current IP address

### 2. Test Proxy in Extension
The extension will log proxy information in console:
```javascript
// Check proxy status
console.log('Current proxy:', ipRotationManager.getCurrentProxy());
console.log('Proxy stats:', ipRotationManager.getProxyStats());
```

### 3. Verify Proxy Working
- Open browser developer tools (F12)
- Go to **Console** tab
- Look for proxy-related logs from the extension

## Troubleshooting

### Common Issues:

1. **Proxy not working**
   - Check if proxy server is accessible
   - Verify credentials are correct
   - Try different proxy protocol (HTTP/HTTPS/SOCKS5)

2. **Extension not detecting proxy**
   - Restart browser after setting proxy
   - Check if proxy is applied system-wide
   - Verify extension permissions

3. **Connection timeouts**
   - Check proxy server status
   - Try different proxy server
   - Check firewall settings

### Debug Commands:
```javascript
// In browser console
console.log('Extension proxy status:', window.ipRotationManager?.getProxyStats());
console.log('Current proxy:', window.ipRotationManager?.getCurrentProxy());
```

## Security Notes

- Keep proxy credentials secure
- Don't share proxy credentials
- Use HTTPS when possible
- Monitor proxy usage and costs

## Support

If you encounter issues:
1. Check proxy server status
2. Verify credentials
3. Test with different proxy
4. Check browser proxy settings
5. Review extension console logs
