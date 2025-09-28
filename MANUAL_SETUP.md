# 📱 Manual Setup Guide - iPhone 17/17 Pro Monitor

Vì Puppeteer có vấn đề trên hệ thống này, hãy làm theo hướng dẫn manual sau:

## 🚀 **Cách 1: Chạy Extension Manual (Recommended)**

### **Bước 1: Mở Chrome**
```bash
# Mở Chrome browser
open -a "Google Chrome"
```

### **Bước 2: Cài Extension**
1. Vào `chrome://extensions/`
2. Bật **"Developer mode"** (góc trên bên phải)
3. Click **"Load unpacked"**
4. Chọn folder project này: `/Users/tev/workplace/availability-noitice-ip17`
5. Extension sẽ xuất hiện trong danh sách

### **Bước 3: Mở trang iPhone 17**
```
https://www.apple.com/jp/shop/buy-iphone/iphone-17
```

### **Bước 4: Extension tự động chạy**
Extension sẽ tự động:
- ✅ Chọn màu Lavender
- ✅ Chọn 256GB
- ✅ Chọn no trade-in
- ✅ Chọn SIM-free
- ✅ Chọn full price payment
- ✅ Chọn no AppleCare+
- ✅ Check store availability
- ✅ Đóng popups
- ✅ Reload trang mỗi 12 giây

## 🔔 **Discord Notifications**

Extension sẽ gửi thông báo Discord cho:
- 🎨 Color selection
- 💾 Capacity selection
- 💳 Payment selection
- 🛡️ AppleCare+ selection
- 🏪 Store availability results
- 🚫 Popup closing

## 📊 **Monitor Console Logs**

Mở **Developer Tools** (F12) để xem logs:
- Console sẽ hiển thị tất cả hoạt động
- Extension logs với màu sắc
- Error messages nếu có

## 🔄 **Auto-Reload Cycle**

Extension sẽ:
1. **0-2s**: Auto-select options
2. **2-12s**: Check store availability
3. **12s**: Reload page
4. **Repeat**: Lặp lại cycle

## 🛠️ **Troubleshooting**

### **Extension không hoạt động:**
1. Refresh trang
2. Check console logs (F12)
3. Reload extension trong `chrome://extensions/`

### **Discord không nhận notification:**
1. Check webhook URL trong `background.js`
2. Check console logs cho errors

### **Store button không tìm thấy:**
1. Đảm bảo trang đã load hoàn toàn
2. Check console logs
3. Thử refresh trang

## 📱 **Supported URLs**

- **iPhone 17**: `https://www.apple.com/jp/shop/buy-iphone/iphone-17`
- **iPhone 17 Pro**: `https://www.apple.com/jp/shop/buy-iphone/iphone-17-pro`

## 🎯 **Quick Start Commands**

```bash
# Mở Chrome
open -a "Google Chrome"

# Mở trang iPhone 17
open "https://www.apple.com/jp/shop/buy-iphone/iphone-17"

# Mở Developer Tools (F12)
# Mở Extensions page
open "chrome://extensions/"
```

## 📋 **Checklist**

- [ ] Chrome browser mở
- [ ] Extension loaded trong `chrome://extensions/`
- [ ] Developer mode enabled
- [ ] Trang iPhone 17 mở
- [ ] Console logs hiển thị
- [ ] Discord notifications hoạt động

## 🔧 **Configuration**

### **Thay đổi reload interval:**
Edit `content.js` line 50:
```javascript
}, 12000); // Thay đổi số này (ms)
```

### **Thay đổi target store:**
Edit `content.js` trong function `checkStoreAvailability()`

### **Disable notifications:**
Comment out trong `background.js`

## 🎉 **Success Indicators**

Khi extension hoạt động đúng, bạn sẽ thấy:
- Console logs với màu sắc
- Discord notifications
- Auto-selection hoạt động
- Page reload mỗi 12 giây
- Popups tự động đóng

---

**Lưu ý**: Extension sẽ chạy liên tục cho đến khi bạn đóng tab hoặc disable extension.
