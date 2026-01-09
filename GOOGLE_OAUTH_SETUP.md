# Hướng dẫn cấu hình Google OAuth

## 1. Tạo Google OAuth 2.0 Credentials

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Tạo project mới hoặc chọn project hiện có
3. Đi đến **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Chọn **Web application**
6. Thêm các URI được ủy quyền:
   - `http://localhost:3000`
   - `http://127.0.0.1:3000`
7. Click **Create**

## 2. Cấu hình Backend

1. Copy file `.env.example` thành `.env`:
   ```bash
   cp .env.example .env
   ```

2. Thêm thông tin Google OAuth vào file `.env`:
   ```
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

## 3. Khởi động lại Backend

```bash
cd backend
npm run dev
```

## 4. Sử dụng

- Truy cập `/login`
- Click vào icon G+ để đăng nhập bằng Google
- Nếu là lần đầu, hệ thống sẽ tự động tạo tài khoản mới
- Nếu đã có tài khoản, hệ thống sẽ đăng nhập vào tài khoản hiện có

## Lưu ý

- Email `admin@gmail.com` sẽ tự động được cấp quyền admin
- Ảnh đại diện từ Google sẽ tự động được lưu
- Mật khẩu cho tài khoản Google sẽ được tạo ngẫu nhiên
