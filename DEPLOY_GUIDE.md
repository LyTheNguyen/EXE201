# Hướng Dẫn Deploy và Cập Nhật

## ✅ Đã Hoàn Thành

### 1. Tự Động Nâng Cấp Sau Thanh Toán

**Trước đây:** 
- User thanh toán → Gửi yêu cầu → Admin xác nhận → Nâng cấp

**Bây giờ:**
- User thanh toán → **TỰ ĐỘNG** nâng cấp ngay lập tức ✨

### 2. Các Gói Nâng Cấp

| Số Tiền | Thời Gian | Tên Gói |
|---------|-----------|---------|
| ≥ 60,000 VNĐ | 180 ngày | Gói 6 tháng |
| ≥ 30,000 VNĐ | 90 ngày | Gói 3 tháng |
| ≥ 10,000 VNĐ | 30 ngày | Gói 1 tháng |
| ≥ 2,000 VNĐ | 2 ngày | Gói 2 ngày |
| ≥ 1,000 VNĐ | 1 ngày | Gói 1 ngày |

### 3. Thay Đổi Code

#### Đã sửa các file:
- ✅ `backend/models/User.js` - Xóa field duplicate `mapAccessExpiresAt`
- ✅ `backend/routes/payment.js` - Cải thiện auto-upgrade với description chi tiết
- ✅ `backend/routes/auth.js` - Thống nhất dùng `mapAccessExpiry`
- ✅ `backend/routes/admin.js` - Thống nhất dùng `mapAccessExpiry`
- ✅ `backend/routes/user.js` - Thống nhất dùng `mapAccessExpiry`
- ✅ `backend/routes/upgrade.js` - Thống nhất dùng `mapAccessExpiry`

#### Đã tạo script migration:
- ✅ `backend/scripts/migrate-expiry-field.js` - Chuyển đổi database

---

## 🚀 Cách Deploy Lên Render

### Bước 1: Commit và Push Code

```bash
cd backend
git add .
git commit -m "feat: auto-upgrade after payment + unify mapAccessExpiry field"
git push origin main
```

### Bước 2: Render Tự Động Deploy

Render sẽ tự động phát hiện thay đổi và deploy lại backend.

### Bước 3: Chạy Migration Script (Quan Trọng!)

Sau khi deploy xong, chạy migration để cập nhật database:

```bash
# Kết nối SSH vào Render shell hoặc chạy local với connection string từ Render
node backend/scripts/migrate-expiry-field.js
```

Hoặc thêm vào Render dashboard:
1. Vào Render Dashboard
2. Chọn service backend
3. Chọn "Shell"
4. Chạy: `node scripts/migrate-expiry-field.js`

---

## 🧪 Test Chức Năng

### 1. Test Payment Webhook

```bash
# Gửi test webhook (thay USER_ID bằng ID thực)
curl -X POST https://floodsense-backend-z4z0.onrender.com/api/payment/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "orderCode": "1234567890",
      "amount": 10000,
      "status": "PAID",
      "description": "USER_675a1234567890abcd_Test",
      "buyerEmail": "test@example.com"
    }
  }'
```

### 2. Kiểm Tra Frontend

1. Chạy frontend local:
```bash
npm run dev
```

2. Đăng nhập vào tài khoản test

3. Thử thanh toán qua PayOS

4. Sau khi thanh toán thành công, kiểm tra:
   - Tài khoản được nâng cấp tự động
   - `hasMapAccess = true`
   - `upgradeStatus = 'approved'`
   - `mapAccessExpiry` có ngày hết hạn đúng

---

## 📝 Lưu Ý Quan Trọng

### CORS Configuration
Backend đã được cấu hình cho phép:
- ✅ `localhost:5173` (Vite default port)
- ✅ Tất cả origins khi `NODE_ENV=production`

### Environment Variables Cần Thiết

Đảm bảo trên Render có các biến môi trường:

```env
NODE_ENV=production
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
CLIENT_URL=http://localhost:5173
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key
```

### Webhook PayOS

Đảm bảo PayOS webhook URL được cấu hình:
```
https://floodsense-backend-z4z0.onrender.com/api/payment/webhook
```

---

## ✨ Tính Năng Mới

1. **Tự động nâng cấp** - Không cần admin duyệt
2. **Transaction history** - Lưu lịch sử giao dịch với description chi tiết
3. **Gia hạn thông minh** - Nếu còn hạn, sẽ cộng dồn thời gian
4. **Log rõ ràng** - Console log chi tiết mọi bước

---

## 🐛 Debug

Nếu có vấn đề, kiểm tra logs trên Render:

```bash
# View logs
render logs --tail
```

Hoặc trong Render Dashboard → Logs tab

---

## 📞 Support

Nếu có vấn đề gì, hãy kiểm tra:
1. Logs trên Render
2. CORS configuration
3. PayOS webhook configuration
4. MongoDB connection
5. Environment variables

---

**Happy Coding! 🎉**
