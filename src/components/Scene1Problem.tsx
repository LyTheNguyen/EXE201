import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { AlertTriangle, Droplets, Activity } from "lucide-react";
import { ImageWithFallback } from "./ui/utils";

interface Vehicle {
  id: number;
  x: number;
  type: "car" | "motorcycle";
  stopped: boolean;
  waterDepth: number;
}

export function Scene1Problem() {
  const [hoveredVehicle, setHoveredVehicle] = useState<number | null>(null);
  const [waterLevel, setWaterLevel] = useState(0);
  const [selectedVehicle, setSelectedVehicle] = useState<number | null>(1);

  useEffect(() => {
    const interval = setInterval(() => {
      setWaterLevel((prev) => (prev >= 35 ? 0 : prev + 0.3));
    }, 50);
    return () => clearInterval(interval);
  }, []);

  const vehicles: Vehicle[] = [
    { id: 1, x: 20, type: "car", stopped: true, waterDepth: 28 },
    { id: 2, x: 45, type: "motorcycle", stopped: true, waterDepth: 32 },
    { id: 3, x: 70, type: "car", stopped: false, waterDepth: 15 },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-slate-800 via-blue-900 to-cyan-900 pt-16">

      {/* Content Container */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <AlertTriangle className="w-12 h-12 text-red-400" />
            <h1 className="text-white text-5xl">Vấn Đề</h1>
          </div>

          <p className="text-blue-100 text-xl max-w-3xl mx-auto mb-12">
            Mỗi mùa mưa, ngập úng đô thị gây tắc nghẽn giao thông và hư hại
            phương tiện
          </p>
        </motion.div>

        {/* Main Illustration Area */}
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Left: Detailed Vehicle with Sensor */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-600 p-8"
            >
              <h3 className="text-white text-xl mb-6 text-center">
                Minh họa cảm biến trên phương tiện
              </h3>

              {/* Detailed Vehicle Illustration */}
              <div className="relative h-80 bg-gradient-to-b from-slate-700 to-slate-800 rounded-xl overflow-hidden">
                {/* Road surface */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gray-700" />

                {/* Water Level Animation */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 bg-blue-500/60 backdrop-blur-sm"
                  animate={{
                    height: [
                      `${waterLevel}%`,
                      `${waterLevel + 2}%`,
                      `${waterLevel}%`,
                    ],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  {/* Water surface effect */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-blue-400/80" />
                  <motion.div
                    className="absolute top-0 left-0 right-0 h-1 bg-white/30"
                    animate={{
                      x: [0, 100],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  />
                </motion.div>

                {/* Water depth indicator */}
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                  <div className="w-px h-40 bg-cyan-400 relative">
                    <motion.div
                      className="absolute bottom-0 w-3 h-3 bg-cyan-400 rounded-full -left-1.5"
                      animate={{
                        bottom: `${waterLevel * 4}px`,
                      }}
                    />
                    <div className="absolute top-0 w-3 h-3 bg-slate-400 rounded-full -left-1.5" />
                  </div>
                  <motion.div
                    className="bg-black/80 text-cyan-400 px-2 py-1 rounded text-xs whitespace-nowrap"
                    animate={{
                      opacity: [1, 0.7, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                    }}
                  >
                    {Math.round(waterLevel * 0.9)} cm
                  </motion.div>
                </div>

                {/* Car with detailed sensor */}
                <motion.div
                  className="absolute left-1/2 -translate-x-1/2 cursor-pointer"
                  style={{
                    bottom: "25%",
                  }}
                  animate={{
                    y: waterLevel > 20 ? [0, -2, 0] : 0,
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  onClick={() =>
                    setSelectedVehicle(selectedVehicle === 1 ? null : 1)
                  }
                >
                  {/* Car body */}
                  <div className="relative">
                    {/* Car top */}
                    <div className="relative z-10 w-40 h-16 bg-gradient-to-b from-blue-600 to-blue-700 rounded-t-2xl rounded-b-lg border-2 border-blue-400">
                      {/* Windows */}
                      <div className="absolute top-2 left-4 right-4 h-8 bg-blue-300/40 rounded-t-xl flex gap-2 p-1">
                        <div className="flex-1 bg-slate-200/30 rounded" />
                        <div className="flex-1 bg-slate-200/30 rounded" />
                      </div>
                    </div>

                    {/* Wheels */}
                    <div className="absolute -bottom-3 left-4 w-8 h-8 bg-gray-900 rounded-full border-4 border-gray-700">
                      <div className="absolute inset-1 bg-gray-600 rounded-full" />
                    </div>
                    <div className="absolute -bottom-3 right-4 w-8 h-8 bg-gray-900 rounded-full border-4 border-gray-700">
                      <div className="absolute inset-1 bg-gray-600 rounded-full" />
                    </div>

                    {/* Sensor under car */}
                    <motion.div
                      className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20"
                      animate={{
                        scale: [1, 1.1, 1],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    >
                      <div className="relative">
                        {/* Sensor device */}
                        <div className="w-6 h-8 bg-cyan-400 rounded border-2 border-cyan-300 shadow-lg shadow-cyan-400/50">
                          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-green-400 rounded-full" />
                        </div>

                        {/* Sensor waves */}
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="absolute top-full left-1/2 -translate-x-1/2 w-12 h-12 border-2 border-cyan-400 rounded-full"
                            initial={{ scale: 0, opacity: 0.8 }}
                            animate={{
                              scale: 2 + i * 0.5,
                              opacity: 0,
                              y: 10 + i * 5,
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              delay: i * 0.4,
                            }}
                          />
                        ))}
                      </div>
                    </motion.div>

                    {/* Alert icon */}
                    {waterLevel > 25 && (
                      <motion.div
                        className="absolute -top-6 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <AlertTriangle className="w-5 h-5 text-white" />
                      </motion.div>
                    )}
                  </div>
                </motion.div>

                {/* Annotations */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="absolute top-4 right-4 space-y-2"
                >
                  <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-lg">
                    <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                    <span className="text-white text-xs">
                      Cảm biến đo mực nước
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-black/70 px-3 py-2 rounded-lg">
                    <Activity className="w-4 h-4 text-green-400" />
                    <span className="text-white text-xs">
                      Truyền dữ liệu real-time
                    </span>
                  </div>
                </motion.div>
              </div>

              {/* Explanation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
                className="mt-6 bg-cyan-500/20 border border-cyan-400/30 rounded-lg p-4"
              >
                <div className="flex items-start gap-3">
                  <Droplets className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-1" />
                  <div>
                    <p className="text-cyan-100 text-sm">
                      <span className="text-cyan-300">
                        Cảm biến siêu âm/áp suất
                      </span>{" "}
                      được gắn ở gầm xe, đo khoảng cách đến mặt nước. Khi nước
                      ngập lên cao, cảm biến phát hiện và gửi dữ liệu về độ sâu
                      ngập ngay lập tức.
                    </p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Right: Real scenarios */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
            >
              <h3 className="text-white text-lg mb-4">Tình huống thực tế</h3>

              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle.id}
                  className="bg-slate-800/50 backdrop-blur-sm border-2 border-slate-600 rounded-xl p-4 mb-3 cursor-pointer hover:border-cyan-400/50 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedVehicle(vehicle.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className={`w-12 h-8 rounded ${
                        vehicle.type === "car" ? "bg-blue-600" : "bg-red-600"
                      } flex items-center justify-center`}
                    >
                      <div
                        className={`${
                          vehicle.type === "car" ? "w-6 h-3" : "w-4 h-2"
                        } bg-white/30 rounded`}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        {vehicle.type === "car" ? "Ô tô" : "Xe máy"}
                      </p>
                    </div>
                    {vehicle.stopped && (
                      <motion.div
                        className="w-2 h-2 bg-red-500 rounded-full"
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      />
                    )}
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Độ sâu ngập:</span>
                      <span
                        className={`${
                          vehicle.waterDepth > 25
                            ? "text-red-400"
                            : "text-yellow-400"
                        }`}
                      >
                        {vehicle.waterDepth} cm
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Trạng thái:</span>
                      <span
                        className={
                          vehicle.stopped ? "text-red-400" : "text-green-400"
                        }
                      >
                        {vehicle.stopped ? "Dừng xe" : "Di chuyển chậm"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 mt-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-xs">
                    Ngập {">"}25cm gây nguy hiểm cho xe máy và ô tô sedan. Cần
                    thông tin real-time để tránh khu vực ngập!
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
