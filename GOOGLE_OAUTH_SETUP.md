# Hướng dẫn cài đặt Google OAuth

## Bước 1: Tạo Google OAuth Client

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project có sẵn
3. Đi đến **APIs & Services** > **Credentials**
4. Nhấp vào **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Cấu hình **Authorized redirect URIs**:
   - `http://localhost:5000/api/auth/google/callback`
7. Lưu lại **Client ID** và **Client Secret**

## Bước 2: Cấu hình Backend

Tạo file `.env` trong thư mục `backend` với nội dung:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
SESSION_SECRET=your_session_secret_here

# MongoDB
MONGODB_URI=mongodb://127.0.0.1:27017/floodsense

# JWT
JWT_SECRET=your_jwt_secret_here
```

Thay thế:
- `your_google_client_id_here` bằng Client ID từ Google
- `your_google_client_secret_here` bằng Client Secret từ Google
- `your_session_secret_here` và `your_jwt_secret_here` bằng chuỗi ngẫu nhiên

## Bước 3: Chạy ứng dụng

1. Khởi động backend:
   ```bash
   cd backend
   npm run dev
   ```

2. Khởi động frontend:
   ```bash
   npm run dev
   ```

## Bước 4: Sử dụng

- Truy cập trang đăng nhập
- Nhấp vào nút Google (logo Google)
- Đăng nhập bằng tài khoản Google
- Hệ thống sẽ tự động tạo tài khoản hoặc đăng nhập nếu đã tồn tại

## Lưu ý

- Email `admin@gmail.com` sẽ tự động được cấp quyền admin
- Các email khác sẽ có quyền user thông thường
- Backend phải chạy trên port 5000
- Frontend phải chạy trên port 5173 (hoặc cập nhật URL trong code)
