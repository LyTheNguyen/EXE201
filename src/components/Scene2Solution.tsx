import { useState } from "react";
import { motion } from "motion/react";
import { Waves, Radio, Cloud, Wifi } from "lucide-react";

interface InfoBox {
  id: number;
  text: string;
  delay: number;
}

export function Scene2Solution() {
  const [activeIcon, setActiveIcon] = useState<string | null>(
    null,
  );

  const infoBoxes: InfoBox[] = [
    {
      id: 1,
      text: "Cảm biến đo mực nước IoT đo độ sâu ngập theo thời gian thực.",
      delay: 0.3,
    },
    {
      id: 2,
      text: "GPS + 4G/LoRa truyền dữ liệu về FloodSense Cloud.",
      delay: 0.6,
    },
  ];

  const iconDetails = {
    sensor:
      "Loại cảm biến: Siêu âm / Áp suất - Đo độ sâu nước với độ chính xác ±2cm",
    gps: "Module GPS - Cung cấp định vị chính xác cho bản đồ ngập real-time",
    signal:
      "Kết nối 4G/LoRa - Truyền dữ liệu tầm xa, tiết kiệm năng lượng",
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-600 via-blue-900 to-blue-950 py-20">
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white text-5xl mb-6">
            Giải Pháp
          </h2>
          <p className="text-blue-200 text-xl">
            Cảm biến IoT thông minh biến mỗi phương tiện thành
            trạm giám sát ngập lụt
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Vehicle with Sensors Visualization */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative flex justify-center"
          >
            <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 backdrop-blur-sm rounded-2xl p-12 border border-blue-400/30 relative w-[420px] md:w-[480px] lg:w-[520px] mx-auto">
              {/* Cloud */}
              <motion.div
                className="absolute -top-12 left-1/2 -translate-x-1/2 z-20"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.8 }}
              >
                <div className="relative flex flex-col items-center">
                  <Cloud className="w-28 h-28 text-gray-400 drop-shadow-2xl opacity-90" />
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-white font-bold text-sm">
                      FloodSense
                    </p>
                    <p className="text-white text-[11px]">
                      Cloud
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Vehicle */}
              <div className="relative mx-auto w-72 h-44 bg-blue-600 rounded-xl border-4 border-blue-400 flex items-center justify-center mt-10">
                <div className="w-36 h-16 bg-blue-300 rounded-lg" />

                {/* Sensor */}
                <motion.div
                  className="absolute -bottom-6 left-1/2 -translate-x-1/2 cursor-pointer"
                  onClick={() =>
                    setActiveIcon(
                      activeIcon === "sensor" ? null : "sensor",
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="relative">
                    <div className="w-12 h-12 bg-cyan-400 rounded-full flex items-center justify-center shadow-lg shadow-cyan-400/50">
                      <Waves className="w-6 h-6 text-blue-900" />
                    </div>
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="absolute inset-0 rounded-full border-2 border-cyan-400"
                        initial={{ scale: 1, opacity: 0.8 }}
                        animate={{
                          scale: 2 + i * 0.5,
                          opacity: 0,
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

                {/* GPS Icon */}
                <motion.div
                  className="absolute top-3 right-3 cursor-pointer"
                  onClick={() =>
                    setActiveIcon(
                      activeIcon === "gps" ? null : "gps",
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-10 h-10 bg-green-400 rounded-full flex items-center justify-center shadow-lg shadow-green-400/50">
                    <Radio className="w-5 h-5 text-green-900" />
                  </div>
                </motion.div>

                {/* Signal Icon */}
                <motion.div
                  className="absolute top-3 left-3 cursor-pointer"
                  onClick={() =>
                    setActiveIcon(
                      activeIcon === "signal" ? null : "signal",
                    )
                  }
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="w-10 h-10 bg-purple-400 rounded-full flex items-center justify-center shadow-lg shadow-purple-400/50">
                    <Wifi className="w-5 h-5 text-purple-900" />
                  </div>
                </motion.div>
              </div>

              {/* Data Particles */}
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
                  style={{
                    left: "50%",
                    top: "60%",
                  }}
                  animate={{
                    x: [0, 0],
                    y: [0, -200],
                    opacity: [1, 0],
                    scale: [1, 0.3],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Active Icon Detail */}
              {activeIcon && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -bottom-28 left-0 right-0 bg-black/90 text-white p-4 rounded-lg text-sm"
                >
                  {
                    iconDetails[
                      activeIcon as keyof typeof iconDetails
                    ]
                  }
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Information Boxes */}
          <div className="space-y-6">
            {infoBoxes.map((box) => (
              <motion.div
                key={box.id}
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: box.delay }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-cyan-400/30 rounded-xl p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-blue-900">
                      {box.id}
                    </span>
                  </div>
                  <p className="text-white text-lg">
                    {box.text}
                  </p>
                </div>
              </motion.div>
            ))}

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.9 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-400/30 rounded-xl p-6"
            >
              <p className="text-green-200 text-center">
                💡 Nhấp vào biểu tượng cảm biến để tìm hiểu thêm
                về công nghệ
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}