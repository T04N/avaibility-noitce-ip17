# 🔧 Browser Proxy Setup Guide

## 📋 **Thông tin Proxy của bạn**

```
Host: choip.mproxy.vn
Port: 12271
Username: tev
Password: B4a9yGhNsiNre0B
```

## 🌐 **Chrome/Edge Setup**

### **Cách 1: Extension Settings**
1. Mở Chrome → Settings → Advanced → System
2. Click "Open proxy settings"
3. Cấu hình:
   - **HTTP Proxy**: `choip.mproxy.vn:12271`
   - **HTTPS Proxy**: `choip.mproxy.vn:12271`
   - **Username**: `tev`
   - **Password**: `B4a9yGhNsiNre0B`

### **Cách 2: Command Line (Khuyến nghị)**
```bash
# Windows
chrome.exe --proxy-server="http://tev:B4a9yGhNsiNre0B@choip.mproxy.vn:12271"

# Mac
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --proxy-server="http://tev:B4a9yGhNsiNre0B@choip.mproxy.vn:12271"

# Linux
google-chrome --proxy-server="http://tev:B4a9yGhNsiNre0B@choip.mproxy.vn:12271"
```

### **Cách 3: Extension (Tự động)**
1. Cài đặt extension "Proxy SwitchyOmega"
2. Tạo profile mới:
   - **Protocol**: HTTP
   - **Server**: `choip.mproxy.vn`
   - **Port**: `12271`
   - **Username**: `tev`
   - **Password**: `B4a9yGhNsiNre0B`

## 🦊 **Firefox Setup**

### **Manual Configuration**
1. Mở Firefox → Settings → General
2. Scroll xuống "Network Settings" → "Settings"
3. Chọn "Manual proxy configuration"
4. Cấu hình:
   - **HTTP Proxy**: `choip.mproxy.vn` Port: `12271`
   - **HTTPS Proxy**: `choip.mproxy.vn` Port: `12271`
   - **Username**: `tev`
   - **Password**: `B4a9yGhNsiNre0B`

### **Auto-config**
1. Tạo file `proxy.pac`:
```javascript
function FindProxyForURL(url, host) {
    return "PROXY choip.mproxy.vn:12271";
}
```

## 🔍 **Test Proxy Connection**

### **Kiểm tra IP**
1. Mở [httpbin.org/ip](https://httpbin.org/ip)
2. Xem IP hiển thị có khác với IP thật không
3. Nếu khác = proxy hoạt động ✅

### **Kiểm tra trong Console**
Mở Developer Console, sẽ thấy:
```
=== PROXY ROTATION INFO ===
Total proxies configured: 1
Current proxy: choip.mproxy.vn:12271
Username: tev
Rotation count: 0
Last rotation: Never
```

## 🚨 **Troubleshooting**

### **Proxy không kết nối được:**
1. ✅ Check credentials: `tev:B4a9yGhNsiNre0B`
2. ✅ Check endpoint: `choip.mproxy.vn:12271`
3. ✅ Test với curl:
```bash
curl -x http://tev:B4a9yGhNsiNre0B@choip.mproxy.vn:12271 http://httpbin.org/ip
```

### **Bị block nhanh:**
1. ✅ Tăng rotation interval lên 10 phút
2. ✅ Thêm random delays
3. ✅ Sử dụng User-Agent rotation
4. ✅ Clear browser data thường xuyên

### **Tốc độ chậm:**
1. ✅ Check proxy server location
2. ✅ Test với different endpoints
3. ✅ Optimize request timing

## 📊 **Monitoring**

### **Extension Logs**
```
Testing proxy connection...
Proxy: choip.mproxy.vn:12271
Username: tev
Proxy test initiated. Check browser network settings for actual proxy configuration.
Expected proxy endpoint: choip.mproxy.vn:12271
```

### **Network Tab**
1. Mở Developer Tools → Network
2. Reload page
3. Check requests có đi qua proxy không
4. Xem response headers

## 🔄 **Auto Rotation**

Extension sẽ tự động:
- ✅ **Rotate mỗi 5 phút**
- ✅ **Clear browser data**
- ✅ **Change User-Agent**
- ✅ **Reload page**
- ✅ **Log rotation status**

## 🎯 **Best Practices**

1. **Test proxy trước** khi chạy monitoring
2. **Monitor logs** thường xuyên
3. **Backup proxy** nếu có
4. **Rotate credentials** định kỳ
5. **Comply với ToS** của proxy service

---

**Lưu ý:** Extension chỉ quản lý rotation logic. Proxy thực tế cần được cấu hình ở browser level!
