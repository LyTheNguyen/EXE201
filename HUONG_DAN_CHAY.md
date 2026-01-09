# Hướng dẫn chạy Backend và Frontend

## 1. Tạo file .env cho Backend

Tạo file `backend/.env` với nội dung:
```
MONGODB_URI=mongodb://localhost:27017/floodsense
JWT_SECRET=floodsense-secret-key-2025
PORT=5000
```

## 2. Chạy Backend Server

Mở terminal mới và chạy:
```bash
cd backend
npm start
```

Bạn sẽ thấy:
- ✅ Connected to MongoDB
- 🚀 Server running on port 5000

## 3. Chạy Frontend

Mở terminal khác và chạy:
```bash
npm run dev
```

Frontend sẽ chạy trên `http://localhost:3000`

## 4. Kiểm tra Database

Sau khi chạy backend, MongoDB sẽ tự động tạo database `floodsense` nếu chưa có.

Bạn có thể kiểm tra trong MongoDB Compass hoặc Data Modeling:
- Database: `floodsense`
- Collection: `users` (sẽ được tạo khi có user đầu tiên đăng ký)

## 5. Test API

Mở browser và truy cập:
- Health check: http://localhost:5000/api/health
- Nếu thấy `{"status":"OK","message":"Server is running"}` là OK!

## Lưu ý

- Đảm bảo MongoDB đang chạy (LocalMongoDB trong hình của bạn)
- Backend phải chạy trước khi test đăng nhập/đăng ký
- Nếu có lỗi kết nối MongoDB, kiểm tra lại connection string trong `.env`

