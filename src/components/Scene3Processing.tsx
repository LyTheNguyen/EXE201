import { useState } from "react";
import { motion } from "motion/react";
import { Cloud, Database, Zap, Filter } from "lucide-react";

interface DataRow {
  id: number;
  vehicle: string;
  waterLevel: number;
  gps: string;
  timestamp: string;
}

export function Scene3Processing() {
  const [showCloud, setShowCloud] = useState(false);
  const [dataCount, setDataCount] = useState(3247);

  const sampleData: DataRow[] = [
    { id: 1, vehicle: "VH-0157", waterLevel: 18, gps: "10.7756°N, 106.7019°E", timestamp: "14:23:15" },
    { id: 2, vehicle: "VH-0892", waterLevel: 25, gps: "10.7612°N, 106.6820°E", timestamp: "14:23:17" },
    { id: 3, vehicle: "VH-1243", waterLevel: 12, gps: "10.7891°N, 106.7123°E", timestamp: "14:23:19" },
    { id: 4, vehicle: "VH-0456", waterLevel: 31, gps: "10.7523°N, 106.6945°E", timestamp: "14:23:21" },
  ];

  const processingSteps = [
    { icon: Database, label: "Tổng hợp dữ liệu", color: "text-blue-400" },
    { icon: Filter, label: "Lọc nhiễu", color: "text-green-400" },
    { icon: Zap, label: "Phát hiện ngập", color: "text-yellow-400" },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-950 via-indigo-900 to-purple-900 py-20">
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white text-5xl mb-6">Xử Lý Dữ Liệu</h2>
          <p className="text-purple-200 text-xl">
            Phân tích đám mây tiên tiến biến dữ liệu thô thành thông tin hữu ích
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Cloud Platform */}
          <div className="flex flex-col items-center justify-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="relative cursor-pointer"
              onMouseEnter={() => setShowCloud(true)}
              onMouseLeave={() => setShowCloud(false)}
              onClick={() => {
                setDataCount((prev) => prev + Math.floor(Math.random() * 100));
              }}
            >
              {/* Central Cloud */}
              <div className="relative">
                <Cloud className="w-64 h-64 text-white drop-shadow-2xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-blue-900 text-sm mb-1">FloodSense</p>
                    <p className="text-blue-900">Cloud</p>
                  </div>
                </div>

                {/* Pulsing Glow */}
                <motion.div
                  className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-30"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.5, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>

              {/* Incoming Data Streams */}
              {Array.from({ length: 12 }).map((_, i) => {
                const angle = (i * 30 * Math.PI) / 180;
                const distance = 200;
                return (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-16 bg-gradient-to-t from-cyan-400 to-transparent"
                    style={{
                      bottom: "50%",
                      left: "50%",
                      transformOrigin: "bottom center",
                      rotate: `${i * 30}deg`,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scaleY: [0, 1, 0],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                );
              })}

              {/* Small Vehicle Icons sending data */}
              {Array.from({ length: 8 }).map((_, i) => {
                const angle = (i * 45 * Math.PI) / 180;
                const distance = 180;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                
                return (
                  <motion.div
                    key={`vehicle-${i}`}
                    className="absolute w-6 h-6 bg-blue-500 rounded"
                    style={{
                      left: `calc(50% + ${x}px)`,
                      top: `calc(50% + ${y}px)`,
                    }}
                    animate={{
                      scale: [1, 1.2, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.25,
                    }}
                  />
                );
              })}

              {/* Tooltip on Hover */}
              {showCloud && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute -bottom-20 left-1/2 -translate-x-1/2 bg-black/90 text-white px-6 py-3 rounded-lg whitespace-nowrap z-20"
                >
                  Tổng hợp {dataCount.toLocaleString()}+ tín hiệu mỗi phút
                </motion.div>
              )}
            </motion.div>

            {/* Processing Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              viewport={{ once: true }}
              className="mt-12 flex flex-col gap-4 w-full max-w-md"
            >
              {processingSteps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.7 + index * 0.2 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05, x: 10 }}
                  className="flex items-center gap-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <step.icon className={`w-6 h-6 ${step.color}`} />
                  </div>
                  <div>
                    <p className="text-white">{step.label}</p>
                  </div>
                  <motion.div
                    className="ml-auto w-2 h-2 bg-green-400 rounded-full"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [1, 0.5, 1],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.3,
                    }}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Right: Live Data Table */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            viewport={{ once: true }}
            className="bg-black/40 backdrop-blur-sm border border-purple-400/30 rounded-2xl p-6 overflow-hidden"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-white text-xl">Luồng dữ liệu thời gian thực</h3>
              <motion.div
                animate={{
                  opacity: [1, 0.5, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                }}
                className="flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-green-400 text-sm">Trực tiếp</span>
              </motion.div>
            </div>

            {/* Data Table */}
            <div className="space-y-3 overflow-y-auto max-h-96">
              {sampleData.map((row, index) => (
                <motion.div
                  key={row.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-400/30 rounded-lg p-4 hover:border-indigo-400/60 transition-colors"
                >
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-purple-300 text-xs">ID Phương tiện</p>
                      <p className="text-white">{row.vehicle}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-xs">Mực nước</p>
                      <p className={`${row.waterLevel > 20 ? "text-red-400" : "text-yellow-400"}`}>
                        {row.waterLevel} cm
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-purple-300 text-xs">Tọa độ GPS</p>
                      <p className="text-white text-xs">{row.gps}</p>
                    </div>
                    <div>
                      <p className="text-purple-300 text-xs">Thời gian</p>
                      <p className="text-cyan-400 text-xs">{row.timestamp}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Chart Visualization */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-6 pt-6 border-t border-purple-400/30"
            >
              <p className="text-purple-300 text-sm mb-3">Luồng dữ liệu (tín hiệu/phút)</p>
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 12 }).map((_, i) => {
                  const height = Math.random() * 80 + 20;
                  return (
                    <motion.div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-cyan-500 to-blue-500 rounded-t"
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      transition={{ duration: 0.5, delay: i * 0.05 }}
                      viewport={{ once: true }}
                    />
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
