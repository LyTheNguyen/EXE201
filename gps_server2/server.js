const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.static("public"));

// Thời gian tồn tại của mỗi điểm nước (1 giờ)
const WATER_POINT_TTL_MS = 60 * 60 * 1000;

// Danh sách các điểm nước: { lat, lng, dist, timestamp }
let waterPoints = [];

// Hàm dọn các điểm đã hết hạn
function cleanupExpiredPoints() {
  const now = Date.now();
  waterPoints = waterPoints.filter(
    (p) => now - p.timestamp < WATER_POINT_TTL_MS
  );
}

// Tính khoảng cách (mét) giữa 2 tọa độ lat/lng (Haversine)
function distanceMeters(lat1, lng1, lat2, lng2) {
  const R = 6371000; // bán kính Trái Đất (m)
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

app.get("/gps", (req, res) => {
  // Khi ESP gửi dữ liệu lên
  if (req.query.lat !== undefined && req.query.lng !== undefined) {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);

    // Có nước → thêm điểm mới (nếu có khoảng cách hợp lệ và không quá gần điểm đã có)
    if (lat !== 0 || lng !== 0) {
      let dist = null;
      if (req.query.dist !== undefined) {
        const d = parseFloat(req.query.dist);
        dist = isNaN(d) ? null : d;
      }

      // Nếu không có khoảng cách hợp lệ thì bỏ qua luôn
      if (dist === null) {
        cleanupExpiredPoints();
        console.log(
          "⚪ Bỏ qua điểm vì không có khoảng cách hợp lệ (dist null/NaN):",
          { lat, lng, rawDist: req.query.dist }
        );
        return res.send("OK");
      }

      cleanupExpiredPoints();

      // Nếu điểm mới cách 1 điểm hiện có < 10 m thì bỏ qua để tránh trùng
      const isTooClose = waterPoints.some((p) => {
        const dMeters = distanceMeters(lat, lng, p.lat, p.lng);
        return dMeters < 5; // ngưỡng 10 m
      });

      if (isTooClose) {
        console.log(
          "⚪ Bỏ qua điểm CÓ nước quá gần (<5m) với điểm đã tồn tại:",
          { lat, lng, dist }
        );
      } else {
        const point = { lat, lng, dist, timestamp: Date.now() };
        waterPoints.push(point);
        console.log("📍 Thêm điểm CÓ nước:", point);
      }
    } else {
      // 0,0: chỉ báo không nước hiện tại, không thêm/xóa điểm
      cleanupExpiredPoints();
      console.log(
        "📍 Nhận tín hiệu KHÔNG nước – giữ các điểm hiện tại, dọn điểm hết hạn",
        waterPoints
      );
    }

    return res.send("OK");
  }

  // Khi trình duyệt yêu cầu lấy danh sách điểm
  cleanupExpiredPoints();
  return res.json({
    points: waterPoints.map(({ lat, lng, dist }) => ({ lat, lng, dist })),
  });
});

app.listen(8080, () =>
  console.log("✅ Server chạy tại http://localhost:8080")
);
