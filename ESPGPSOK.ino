#include <WiFi.h>
#include <HTTPClient.h>
#include <TinyGPSPlus.h>
#include <HardwareSerial.h>
#include <Arduino.h>


// ====== WiFi Config ======
const char* ssid = "Tran Tin";
const char* password = "26012004";


// ====== GPS Config ======
HardwareSerial gpsSerial(2);
TinyGPSPlus gps;


// ====== Water Sensor Config ======
#define POWER_PIN 25       // 👈 đổi để không trùng GPS TX
#define SIGNAL_PIN 36
int threshold = 1000;      // Ngưỡng phát hiện có nước
#define TRIG_PIN 27
#define ECHO_PIN 26


// ====== Biến lưu tọa độ hiện tại ======
double currentLat = 0.0;
double currentLng = 0.0;
unsigned long lastGPSUpdate = 0;

bool sentNoWaterReset = false;


// ====== Hàm đọc trung bình cảm biến ======
int readAverage(int pin, int samples = 10) {
  long total = 0;
  for (int i = 0; i < samples; i++) {
    total += analogRead(pin);
    delay(5);
  }
  return total / samples;
}


float readUltrasonicCm() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  unsigned long duration = pulseIn(ECHO_PIN, HIGH, 30000);
  if (duration == 0) return -1.0;
  float dist = (duration * 0.0343f) / 2.0f;
  return dist;
}

// ====== Setup ======
void setup() {
  Serial.begin(115200);
  gpsSerial.begin(4800, SERIAL_8N1, 16, 17); // RX=16, TX=17

  Serial.println("🔄 Đang khởi động...");

  // Kết nối WiFi
  WiFi.begin(ssid, password);
  Serial.print("📶 Đang kết nối WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\n✅ WiFi đã kết nối!");
  Serial.print("🌐 IP ESP32: ");
  Serial.println(WiFi.localIP());

  // Cấu hình cảm biến nước
  analogSetAttenuation(ADC_11db);
  pinMode(POWER_PIN, OUTPUT);
  digitalWrite(POWER_PIN, LOW);
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  digitalWrite(TRIG_PIN, LOW);
}


// ====== Hàm kiểm tra cảm biến nước ======
bool detectWater() {
  int countWater = 0;
  int countNoWater = 0;

  for (int i = 0; i < 15; i++) {
    digitalWrite(POWER_PIN, HIGH);
    delay(10);
    int value = readAverage(SIGNAL_PIN);
    digitalWrite(POWER_PIN, LOW);

    Serial.print("Lần ");
    Serial.print(i + 1);
    Serial.print(": ");
    Serial.print(value);

    if (value > threshold) {
      Serial.println(" -> 💧 Có nước!");
      countWater++;
    } else {
      Serial.println(" -> ❌ Không có nước");
      countNoWater++;
    }
    delay(100);
  }

  Serial.println("----------------------");
  Serial.print("Tổng có nước: ");
  Serial.print(countWater);
  Serial.print(" | Không có nước: ");
  Serial.println(countNoWater);
  Serial.println("======================");

  return (countWater > countNoWater);
}


// ====== Hàm cập nhật GPS ======
void updateGPS() {
  while (gpsSerial.available() > 0) {
    gps.encode(gpsSerial.read());
  }

  if (gps.location.isUpdated()) {
    currentLat = gps.location.lat();
    currentLng = gps.location.lng();
    lastGPSUpdate = millis();  // cập nhật thời gian có dữ liệu mới
  } else {
    // Nếu quá 10 giây không có dữ liệu GPS mới → reset
    if (millis() - lastGPSUpdate > 10000) {
      if (currentLat != 0.0 || currentLng != 0.0) {
        currentLat = 0.0;
        currentLng = 0.0;
        Serial.println("⚠️ Mất tín hiệu GPS - reset về (0,0)");

        // Gửi lên server để map tự reset marker
        if (WiFi.status() == WL_CONNECTED) {
          HTTPClient http;
          String url = "http://192.168.1.5:8080/gps?lat=0&lng=0";
          http.begin(url);
          int code = http.GET();
          if (code > 0)
            Serial.println("📡 Đã gửi (0,0) để reset bản đồ!");
          else
            Serial.println("⚠️ Lỗi gửi reset: " + String(code));
          http.end();
        }
      }
    }
  }
}


// ====== Loop ======
void loop() {
  updateGPS();  // cập nhật tọa độ

  bool hasWater = detectWater();

  if (hasWater) {
    if (currentLat != 0.0 && currentLng != 0.0) {
      Serial.println("👉 Kết luận: 💧 Có nước! Gửi tọa độ...");
      Serial.print("🌍 Lat: "); Serial.println(currentLat, 6);
      Serial.print("🌍 Lng: "); Serial.println(currentLng, 6);

      if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        float distanceCm = readUltrasonicCm();
        if (distanceCm > 0) {
          Serial.print("📏 Khoảng cách: ");
          Serial.print(distanceCm, 1);
          Serial.println(" cm");
        } else {
          Serial.println("📏 Khoảng cách: Không đọc được");
        }
        String url = "http://192.168.1.5:8080/gps?lat=" + String(currentLat, 6) + "&lng=" + String(currentLng, 6);
        if (distanceCm > 0) {
          url += "&dist=" + String(distanceCm, 1);
        }
        http.begin(url);
        int code = http.GET();
        if (code > 0)
          Serial.println("📡 Gửi thành công! HTTP Code: " + String(code));
        else
          Serial.println("⚠️ Lỗi gửi: " + String(code));
        http.end();

        sentNoWaterReset = false;
      } else {
        Serial.println("❌ Mất kết nối WiFi!");
      }
    } else {
      Serial.println("⚠️ Không có tọa độ GPS hợp lệ (đã reset)!");
    }
  } else {
    Serial.println("👉 Kết luận: ❌ Không có nước, không gửi tọa độ.");

    if (WiFi.status() == WL_CONNECTED) {
      if (!sentNoWaterReset) {
        HTTPClient http;
        String url = "http://192.168.1.5:8080/gps?lat=0&lng=0";
        http.begin(url);
        int code = http.GET();
        if (code > 0)
          Serial.println("📡 Đã gửi (0,0) để reset bản đồ!");
        else
          Serial.println("⚠️ Lỗi gửi reset: " + String(code));
        http.end();

        sentNoWaterReset = true;
      }
    } else {
      Serial.println("❌ Mất kết nối WiFi!");
    }
  }

  delay(200);
}