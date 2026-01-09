import { motion } from "motion/react";
import { Clock, DollarSign, Users, ArrowRight } from "lucide-react";

interface Benefit {
  icon: typeof Clock;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

export function Scene5Benefits() {
  const benefits: Benefit[] = [
    {
      icon: Clock,
      title: "Cập nhật thời gian thực",
      description: "Nhận cảnh báo ngập và thông tin giao thông ngay khi tình hình thay đổi trên toàn thành phố",
      color: "text-blue-400",
      bgColor: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: DollarSign,
      title: "Chi phí thấp - Cảm biến cộng đồng",
      description: "Tận dụng hạ tầng phương tiện sẵn có - không cần cảm biến chuyên dụng đắt tiền",
      color: "text-green-400",
      bgColor: "from-green-500/20 to-emerald-500/20",
    },
    {
      icon: Users,
      title: "Độ chính xác từ cộng đồng",
      description: "Càng nhiều phương tiện = độ phủ tốt hơn và bản đồ ngập chính xác hơn cho tất cả mọi người",
      color: "text-purple-400",
      bgColor: "from-purple-500/20 to-pink-500/20",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-800 via-blue-900 to-cyan-900 py-20">
      {/* Background circles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-white text-5xl mb-6">Lợi Ích & Tác Động</h2>
          <p className="text-cyan-200 text-xl max-w-3xl mx-auto">
            FloodSense tạo ra thành phố an toàn, thông minh hơn cho mọi người thông qua giám sát ngập lụt từ cộng đồng
          </p>
        </motion.div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {benefits.map((benefit, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              whileHover={{ scale: 1.05, y: -10 }}
              className={`bg-gradient-to-br ${benefit.bgColor} backdrop-blur-sm border border-white/20 rounded-2xl p-8 cursor-pointer`}
            >
              {/* Icon with Animation */}
              <motion.div
                className="mb-6"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <div className={`w-20 h-20 bg-white/10 rounded-full flex items-center justify-center ${benefit.color}`}>
                  <benefit.icon className="w-10 h-10" />
                </div>
              </motion.div>

              <h3 className="text-white text-2xl mb-4">{benefit.title}</h3>
              <p className="text-slate-300">{benefit.description}</p>

              {/* Animated indicator */}
              <motion.div
                className="mt-6 flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.2 }}
                viewport={{ once: true }}
              >
                <motion.div
                  className={`w-2 h-2 rounded-full ${benefit.color.replace('text-', 'bg-')}`}
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
                <span className={`text-sm ${benefit.color}`}>Active</span>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* Statistics Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="bg-white/5 backdrop-blur-sm border border-white/20 rounded-2xl p-8 mb-12"
        >
          <h3 className="text-white text-2xl mb-8 text-center">Tác động cộng đồng</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "10,000+", label: "Phương tiện hoạt động", color: "text-cyan-400" },
              { value: "98%", label: "Độ phủ thành phố", color: "text-green-400" },
              { value: "45 giây", label: "Tần suất cập nhật", color: "text-blue-400" },
              { value: "3.2 triệu", label: "Điểm dữ liệu/ngày", color: "text-purple-400" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <motion.div
                  className={`text-4xl mb-2 ${stat.color}`}
                  animate={{
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    delay: index * 0.5,
                  }}
                >
                  {stat.value}
                </motion.div>
                <p className="text-slate-400 text-sm">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <button className="group bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white px-10 py-4 rounded-full transition-all shadow-lg shadow-cyan-500/50 hover:shadow-xl hover:shadow-cyan-500/70">
              <span className="flex items-center gap-3">
                <span className="text-lg">Tham gia mạng lưới</span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ArrowRight className="w-6 h-6" />
                </motion.div>
              </span>
            </button>
          </motion.div>

          <p className="text-slate-400 text-sm mt-6">
            Giúp thành phố của bạn an toàn hơn - lắp đặt FloodSense lên phương tiện ngay hôm nay
          </p>
        </motion.div>

        {/* Map Network Visualization */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.2 }}
          viewport={{ once: true }}
          className="mt-16 relative h-64 bg-gradient-to-b from-blue-950/50 to-transparent rounded-2xl overflow-hidden"
        >
          <svg className="w-full h-full" viewBox="0 0 1000 300">
            {/* Connection lines */}
            {Array.from({ length: 20 }).map((_, i) => {
              const x1 = Math.random() * 1000;
              const y1 = Math.random() * 300;
              const x2 = Math.random() * 1000;
              const y2 = Math.random() * 300;
              return (
                <motion.line
                  key={i}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="rgba(56, 189, 248, 0.2)"
                  strokeWidth="1"
                  initial={{ pathLength: 0, opacity: 0 }}
                  whileInView={{ pathLength: 1, opacity: 0.3 }}
                  transition={{ duration: 2, delay: i * 0.1 }}
                  viewport={{ once: true }}
                />
              );
            })}

            {/* Sensor nodes */}
            {Array.from({ length: 30 }).map((_, i) => {
              const x = Math.random() * 1000;
              const y = Math.random() * 300;
              return (
                <motion.circle
                  key={i}
                  cx={x}
                  cy={y}
                  r="4"
                  fill="#38BDF8"
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5, delay: i * 0.05 }}
                  viewport={{ once: true }}
                >
                  <animate
                    attributeName="opacity"
                    values="1;0.3;1"
                    dur={`${2 + Math.random() * 2}s`}
                    repeatCount="indefinite"
                  />
                </motion.circle>
              );
            })}
          </svg>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.p
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 1, delay: 1.5 }}
              viewport={{ once: true }}
              className="text-cyan-300 text-lg"
            >
              Mạng lưới kết nối 10,000+ phương tiện
            </motion.p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
