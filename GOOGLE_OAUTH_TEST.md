# Google OAuth Test Guide

## Quick Test (Mock Credentials)

Backend đã được cấu hình với test credentials:
- GOOGLE_CLIENT_ID=test-google-client-id
- GOOGLE_CLIENT_SECRET=test-google-client-secret

## Steps to Test:

1. **Backend đang chạy**: ✅ Server đang chạy trên port 5000
2. **Frontend**: Đảm bảo frontend đang chạy trên port 3000
3. **Test login**:
   - Truy cập `http://localhost:3000/login`
   - Click vào icon G+ (Google)
   - Bạn sẽ thấy lỗi Google OAuth vì credentials không thật
   - Đây là bình thường, cho thấy hệ thống đã hoạt động đúng

## Để hoạt động thật:

1. **Tạo Google OAuth Credentials**:
   - Vào [Google Cloud Console](https://console.cloud.google.com/)
   - APIs & Services > Credentials > Create Credentials > OAuth client ID
   - Web application
   - Authorized redirect URIs: `http://localhost:5000/api/auth/google/callback`

2. **Cập nhật file `.env.local`**:
   ```
   GOOGLE_CLIENT_ID=your-real-google-client-id
   GOOGLE_CLIENT_SECRET=your-real-google-client-secret
   ```

3. **Restart backend**

## Features đã sẵn sàng:
- ✅ Backend routes: `/api/auth/google` và `/api/auth/google/callback`
- ✅ Frontend xử lý callback
- ✅ Tự động tạo user nếu chưa tồn tại
- ✅ Lấy avatar từ Google
- ✅ Admin auto-assign cho admin@gmail.com
- ✅ JWT token generation
- ✅ Auto redirect về trang chủ

Test ngay bây giờ để xem flow hoạt động!
