# 🔄 Proxy Rotation Setup Guide

## ✅ **Tại sao dùng Proxy Rotation?**

Proxy rotation là phương pháp **tốt nhất** để tránh bị phát hiện bot vì:

- ✅ **Thay đổi IP thật** mỗi request
- ✅ **Residential IPs** giống người dùng thật
- ✅ **Khó bị detect** hơn VPN
- ✅ **Tốc độ nhanh** và ổn định
- ✅ **Chi phí hợp lý** cho monitoring

## 🛠️ **Các loại Proxy tốt nhất**

### **1. Residential Proxies (Khuyến nghị)**
```
- Bright Data (Luminati)
- Oxylabs
- Smartproxy
- NetNut
- IPRoyal
```

### **2. Datacenter Proxies (Rẻ hơn)**
```
- ProxyMesh
- ProxyRack
- Storm Proxies
- MyPrivateProxy
```

### **3. Mobile Proxies (Tốt nhất)**
```
- Bright Data Mobile
- Oxylabs Mobile
- Smartproxy Mobile
```

## ⚙️ **Setup Proxy trong Extension**

### **Bước 1: Cấu hình Proxy List**
Mở file `bag-monitor.js` và cập nhật:

```javascript
this.proxyList = [
  'proxy1.brightdata.com:22225',
  'proxy2.brightdata.com:22225',
  'proxy3.brightdata.com:22225',
  'proxy4.brightdata.com:22225',
  'proxy5.brightdata.com:22225'
];

this.proxyCredentials = {
  username: 'your_brightdata_username',
  password: 'your_brightdata_password'
};
```

### **Bước 2: Browser Proxy Configuration**

#### **Chrome/Edge:**
1. Mở `chrome://settings/`
2. Tìm "Advanced" → "System"
3. Click "Open proxy settings"
4. Cấu hình proxy cho từng session

#### **Firefox:**
1. Mở `about:preferences#general`
2. Scroll xuống "Network Settings"
3. Click "Settings"
4. Chọn "Manual proxy configuration"

### **Bước 3: Proxy Rotation Settings**
```javascript
// Trong bag-monitor.js
this.rotationInterval = 300000; // 5 phút
this.maxRotations = 10; // Tối đa 10 lần rotation
```

## 🔧 **Proxy Service Setup**

### **Bright Data (Khuyến nghị)**
1. Đăng ký tại [brightdata.com](https://brightdata.com)
2. Tạo Residential Proxy Zone
3. Lấy credentials và endpoint
4. Cấu hình rotation rules

### **Oxylabs**
1. Đăng ký tại [oxylabs.io](https://oxylabs.io)
2. Chọn Residential Proxies
3. Setup session rotation
4. Lấy proxy list

### **Smartproxy**
1. Đăng ký tại [smartproxy.com](https://smartproxy.com)
2. Chọn Residential Proxies
3. Cấu hình sticky session
4. Lấy endpoint list

## 📊 **Monitoring Proxy Performance**

### **Debug Console**
Mở Developer Console để xem:
```
=== PROXY ROTATION INFO ===
Total proxies configured: 5
Current proxy: proxy3.brightdata.com:22225
Rotation count: 3
Last rotation: 1/15/2025, 2:30:45 PM
```

### **Proxy Health Check**
```javascript
// Thêm vào bag-monitor.js để check proxy health
async checkProxyHealth() {
  try {
    const response = await fetch('https://httpbin.org/ip', {
      method: 'GET',
      timeout: 10000
    });
    const data = await response.json();
    console.log('Current IP:', data.origin);
    return true;
  } catch (error) {
    console.error('Proxy health check failed:', error);
    return false;
  }
}
```

## 🚨 **Troubleshooting**

### **Proxy không hoạt động:**
1. Check credentials
2. Verify proxy endpoints
3. Test với curl/Postman
4. Check firewall settings

### **Bị block nhanh:**
1. Tăng rotation interval
2. Sử dụng residential IPs
3. Thêm random delays
4. Rotate User-Agent

### **Tốc độ chậm:**
1. Chọn proxy gần server
2. Sử dụng datacenter proxies
3. Giảm rotation frequency
4. Optimize request timing

## 💰 **Chi phí ước tính**

### **Residential Proxies:**
- Bright Data: $500-1000/tháng
- Oxylabs: $300-800/tháng
- Smartproxy: $200-500/tháng

### **Datacenter Proxies:**
- ProxyMesh: $50-200/tháng
- Storm Proxies: $30-150/tháng

## 🎯 **Best Practices**

1. **Sử dụng Residential IPs** cho monitoring
2. **Rotate mỗi 5-10 phút** để tránh detection
3. **Random delays** giữa các requests
4. **Monitor proxy health** thường xuyên
5. **Backup proxy list** để failover
6. **Test trước khi deploy** production

## 🔒 **Security Notes**

- ✅ **Không share proxy credentials**
- ✅ **Sử dụng HTTPS** cho tất cả requests
- ✅ **Rotate credentials** định kỳ
- ✅ **Monitor usage** để tránh abuse
- ✅ **Comply với ToS** của proxy service

---

**Kết luận:** Proxy rotation là giải pháp tốt nhất để tránh bị Apple detect và block. Đầu tư vào residential proxies sẽ cho kết quả tốt nhất!
