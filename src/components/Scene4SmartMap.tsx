import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { MapPin, Navigation, AlertCircle, CheckCircle, Car, Lock } from "lucide-react";
import { ImageWithFallback } from "./ui/utils";
import { MapComponent } from "./MapComponent";

interface Street {
  id: number;
  name: string;
  path: string;
  floodLevel: "mild" | "heavy" | "dangerous" | "safe";
  depth: number;
  sensors: number;
  lastUpdate: string;
}

export function Scene4SmartMap() {
  const [selectedStreet, setSelectedStreet] = useState<Street | null>(null);
  const [showRoute, setShowRoute] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [hasMapAccess, setHasMapAccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserAccess = async () => {
      const userStr = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      
      if (userStr && token) {
        try {
          const userData = JSON.parse(userStr);
          setUser(userData);
          
          // If user is not admin, check latest status from server
          if (userData.role !== 'admin') {
            try {
              const { upgradeAPI } = await import("../services/api");
              const response = await upgradeAPI.getStatus();
              if (response.success) {
                // Check if access has expired
                let hasAccess = response.hasMapAccess || false;
                if (hasAccess && response.mapAccessExpiresAt) {
                  const now = new Date().getTime();
                  const expiresAt = new Date(response.mapAccessExpiresAt).getTime();
                  if (now > expiresAt) {
                    hasAccess = false;
                  }
                }
                
                // Update user data in localStorage
                const updatedUser = {
                  ...userData,
                  hasMapAccess: hasAccess,
                  upgradeStatus: response.upgradeStatus || 'none',
                  mapAccessExpiresAt: response.mapAccessExpiresAt
                };
                localStorage.setItem("user", JSON.stringify(updatedUser));
                setUser(updatedUser);
                setHasMapAccess(hasAccess);
              } else {
                // Check expiration from localStorage
                let hasAccess = userData.hasMapAccess || false;
                if (hasAccess && userData.mapAccessExpiresAt) {
                  const now = new Date().getTime();
                  const expiresAt = new Date(userData.mapAccessExpiresAt).getTime();
                  if (now > expiresAt) {
                    hasAccess = false;
                  }
                }
                setHasMapAccess(hasAccess);
              }
            } catch (error) {
              console.error("Error fetching upgrade status:", error);
              // Check expiration from localStorage
              let hasAccess = userData.hasMapAccess || false;
              if (hasAccess && userData.mapAccessExpiresAt) {
                const now = new Date().getTime();
                const expiresAt = new Date(userData.mapAccessExpiresAt).getTime();
                if (now > expiresAt) {
                  hasAccess = false;
                }
              }
              setHasMapAccess(hasAccess);
            }
          } else {
            // Admin automatically has map access
            setHasMapAccess(true);
          }
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      }
    };

    checkUserAccess();

    // Listen for userLogin event to refresh access
    const handleUserLogin = () => {
      checkUserAccess();
    };

    window.addEventListener("userLogin", handleUserLogin);
    
    // Also check periodically (every 5 seconds) if user doesn't have access
    const interval = setInterval(() => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const userData = JSON.parse(userStr);
          if (userData.role !== 'admin' && !userData.hasMapAccess) {
            checkUserAccess();
          }
        } catch (e) {
          // Ignore
        }
      }
    }, 5000);

    return () => {
      window.removeEventListener("userLogin", handleUserLogin);
      clearInterval(interval);
    };
  }, []);

  const streets: Street[] = [
    // Main horizontal streets
    { id: 1, name: "Đường 3/2", path: "M50,150 L450,150", floodLevel: "safe", depth: 4, sensors: 892, lastUpdate: "1 phút trước" },
    { id: 2, name: "Đường Mậu Thân", path: "M50,250 L450,250", floodLevel: "dangerous", depth: 38, sensors: 3247, lastUpdate: "30 giây trước" },
    { id: 3, name: "Đường Trần Hưng Đạo", path: "M50,350 L450,350", floodLevel: "heavy", depth: 24, sensors: 2156, lastUpdate: "45 giây trước" },
    { id: 4, name: "Đường Nguyễn Trãi", path: "M50,450 L350,450", floodLevel: "mild", depth: 11, sensors: 567, lastUpdate: "2 phút trước" },
    // Main vertical streets
    { id: 5, name: "Đường Nguyễn Văn Cừ", path: "M150,50 L150,480", floodLevel: "heavy", depth: 22, sensors: 1834, lastUpdate: "1 phút trước" },
    { id: 6, name: "Đường Ngô Quyền", path: "M280,50 L280,480", floodLevel: "mild", depth: 9, sensors: 445, lastUpdate: "3 phút trước" },
    { id: 7, name: "Đường Nguyễn Văn Linh", path: "M400,80 L400,380", floodLevel: "safe", depth: 2, sensors: 234, lastUpdate: "2 phút trước" },
  ];

  const getFloodColor = (level: string) => {
    switch (level) {
      case "mild": return "#FCD34D"; // yellow
      case "heavy": return "#EF4444"; // red
      case "dangerous": return "#1F2937"; // black
      case "safe": return "#10B981"; // green
      default: return "#6B7280";
    }
  };

  const getFloodLabel = (level: string) => {
    switch (level) {
      case "mild": return "Ngập nhẹ 5-15cm";
      case "heavy": return "Ngập nặng 15-30cm";
      case "dangerous": return "Nguy hiểm >30cm";
      case "safe": return "An toàn <5cm";
      default: return "";
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-900 via-slate-900 to-slate-800 py-20">
      <div className="absolute inset-0 opacity-40">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1576749288264-207936efb479?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx1cmJhbiUyMGZsb29kaW5nJTIwcmFpbiUyMGNpdHl8ZW58MXx8fHwxNzYwNDM2Mjc2fDA&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Flooded city"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 50 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-0.5 h-12 bg-blue-300 opacity-30"
            style={{
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: ["0vh", "100vh"],
            }}
            transition={{
              duration: Math.random() * 1 + 0.5,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-white text-5xl mb-6">Bản Đồ Thông Minh</h2>
          <p className="text-slate-300 text-xl mb-6">
            Giám sát ngập lụt thời gian thực trên toàn thành phố
          </p>

          {/* Toggle Route */}
          <div className="flex items-center gap-4 justify-center">
            <button
              onClick={() => setShowRoute(!showRoute)}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <Navigation className="w-4 h-4" />
              {showRoute ? "Ẩn" : "Hiện"} đường đi an toàn
            </button>
            <div className="text-slate-300 text-sm">
              💡 Nhấp vào đường để xem chi tiết
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Center: Interactive Map - First on mobile */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="w-full lg:col-span-2 h-[400px] lg:h-[600px] bg-slate-800 rounded-2xl border-2 border-slate-600 overflow-hidden relative lg:order-2 order-1"
            style={{ minHeight: '400px', height: '400px' }}
          >
            {/* Overlay for users without map access */}
            {!hasMapAccess && (
              <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center p-8 rounded-2xl"
                 style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center max-w-2xl px-6 py-4"
                >
                  <Lock className="w-16 h-16 text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-white text-2xl font-bold mb-2">Cần nâng cấp tài khoản</h3>
                  <p className="text-slate-300 mb-6">
                    Để xem bản đồ thông minh và các tính năng nâng cao, vui lòng nâng cấp tài khoản của bạn.
                  </p>
                  <motion.button
                    onClick={() => navigate("/upgrade")}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Nâng cấp ngay
                  </motion.button>
                </motion.div>
              </div>
            )}
            {/* Real GPS Map */}
            <MapComponent />

            {/* Street Info Popup */}
            {selectedStreet && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-6 right-6 bg-black/90 backdrop-blur-sm border border-white/30 rounded-xl p-6"
              >
                <button
                  onClick={() => setSelectedStreet(null)}
                  className="absolute top-2 right-2 text-white hover:text-red-400"
                >
                  ✕
                </button>
                <div className="flex items-start gap-3 mb-3">
                  <h4 className="text-white text-lg">{selectedStreet.name}</h4>
                  {selectedStreet.sensors >= 3000 && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="bg-red-500 text-white px-2 py-1 rounded text-xs"
                    >
                      Nguy hiểm cao
                    </motion.div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                  <div>
                    <p className="text-slate-400">Độ sâu ngập</p>
                    <p className="text-white">{selectedStreet.depth} cm</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Trạng thái</p>
                    <p style={{ color: getFloodColor(selectedStreet.floodLevel) }}>
                      {getFloodLabel(selectedStreet.floodLevel)}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400">Phương tiện báo cáo</p>
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-cyan-400" />
                      <p className={`${selectedStreet.sensors >= 3000 ? 'text-red-400' : selectedStreet.sensors >= 1000 ? 'text-orange-400' : 'text-cyan-400'}`}>
                        {selectedStreet.sensors.toLocaleString()} xe
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-slate-400">Cập nhật lần cuối</p>
                    <p className="text-green-400">{selectedStreet.lastUpdate}</p>
                  </div>
                </div>
                {selectedStreet.sensors >= 3000 && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mt-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-400 text-sm">
                          Khu vực ngập nghiêm trọng với {selectedStreet.sensors.toLocaleString()}+ phương tiện báo cáo.
                          Hệ thống khuyến nghị sử dụng đường thay thế.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Left: Map Legend - Second on mobile */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-4 lg:order-1 order-2"
          >
            <div className="bg-black/40 backdrop-blur-sm border border-slate-600 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Chú giải mức độ ngập</h3>
              <div className="space-y-3">
                {[
                  { level: "safe", label: "An toàn (<5cm)", color: "#10B981" },
                  { level: "mild", label: "Ngập nhẹ (5-15cm)", color: "#FCD34D" },
                  { level: "heavy", label: "Ngập nặng (15-30cm)", color: "#EF4444" },
                  { level: "dangerous", label: "Nguy hiểm (>30cm)", color: "#1F2937" },
                ].map((item) => (
                  <div key={item.level} className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded border-2 border-white/30"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-white text-sm">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/40 backdrop-blur-sm border border-slate-600 rounded-xl p-6">
              <h3 className="text-white text-lg mb-4">Trạng thái hệ thống</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Tổng phương tiện</span>
                  <motion.span
                    className="text-green-400"
                    animate={{ opacity: [1, 0.6, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    9,425
                  </motion.span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Cập nhật dữ liệu</span>
                  <span className="text-cyan-400">Thời gian thực</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Độ phủ sóng</span>
                  <span className="text-purple-400">98%</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-600">
                <p className="text-slate-400 text-xs mb-2">Khu vực nguy hiểm</p>
                <div className="space-y-2">
                  {streets.filter(s => s.sensors >= 3000).map(s => (
                    <div key={s.id} className="flex items-center gap-2 text-xs">
                      <AlertCircle className="w-3 h-3 text-red-400" />
                      <span className="text-red-400">{s.name}</span>
                      <span className="text-red-300 ml-auto">{s.sensors.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
