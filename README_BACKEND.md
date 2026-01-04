# Backend Setup - MongoDB Authentication

## Cài đặt và chạy Backend

### 1. Cài đặt MongoDB
- Cài đặt MongoDB trên máy của bạn hoặc sử dụng MongoDB Atlas (cloud)
- Nếu dùng local: MongoDB sẽ chạy trên `mongodb://localhost:27017`

### 2. Cấu hình Environment Variables
Tạo file `.env` trong thư mục `backend/`:

```env
MONGODB_URI=mongodb://localhost:27017/floodsense
JWT_SECRET=your-secret-key-here-change-this-in-production
PORT=5000
```

**Nếu dùng MongoDB Atlas:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/floodsense
JWT_SECRET=your-secret-key-here-change-this-in-production
PORT=5000
```

### 3. Chạy Backend Server
```bash
cd backend
npm start
```

Server sẽ chạy trên `http://localhost:5000`

### 4. Cấu hình Frontend
Tạo file `.env` trong thư mục gốc (cùng cấp với `package.json`):

```env
VITE_API_URL=http://localhost:5000/api
```

### 5. API Endpoints

#### Sign Up
```
POST /api/auth/signup
Body: {
  "name": "Tên người dùng",
  "email": "email@example.com",
  "password": "password123"
}
```

#### Sign In
```
POST /api/auth/signin
Body: {
  "email": "email@example.com",
  "password": "password123"
}
```

### 6. Response Format

**Success:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "name": "Tên người dùng",
    "email": "email@example.com"
  }
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error message here"
}
```

## Lưu ý
- Token được lưu trong localStorage sau khi đăng nhập/đăng ký thành công
- Token có thời hạn 7 ngày
- Password được hash bằng bcrypt trước khi lưu vào database

