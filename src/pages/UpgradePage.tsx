import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Check, Lock, Map, Shield, Zap, QrCode, ArrowLeft } from "lucide-react";
import { upgradeAPI, paymentAPI } from "../services/api";

export function UpgradePage() {
  const [user, setUser] = useState<any>(null);
  const [upgradeStatus, setUpgradeStatus] = useState<string>("none");
  const [loading, setLoading] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const navigate = useNavigate();

  const packages = [
    {
      id: '2-days',
      name: 'Gói 2 ngày',
      price: 2000,
      days: 2,
      description: 'Truy cập bản đồ trong 2 ngày',
      popular: false
    },
    {
      id: '1-day',
      name: 'Gói 1 ngày',
      price: 1000,
      days: 1,
      description: 'Truy cập bản đồ trong 1 ngày',
      popular: false
    },
    {
      id: '1-month',
      name: 'Gói 1 tháng',
      price: 10000,
      days: 30,
      description: 'Truy cập bản đồ trong 30 ngày',
      popular: false
    },
    {
      id: '3-months',
      name: 'Gói 3 tháng',
      price: 30000,
      days: 90,
      description: 'Truy cập bản đồ trong 90 ngày',
      popular: true
    },
    {
      id: '6-months',
      name: 'Gói 6 tháng',
      price: 60000,
      days: 180,
      description: 'Truy cập bản đồ trong 180 ngày',
      popular: false
    }
  ];

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!userStr || !token) {
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      setUpgradeStatus(userData.upgradeStatus || "none");
      
      // Fetch latest upgrade status
      fetchUpgradeStatus();
    } catch (e) {
      console.error("Error parsing user data:", e);
      navigate("/login");
    }
  }, [navigate]);

  // Polling để kiểm tra status sau khi thanh toán
  useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(async () => {
      await fetchUpgradeStatus();
    }, 5000); // Kiểm tra mỗi 5 giây

    return () => clearInterval(interval);
  }, [user]);

  const createPaymentLink = async (pkg: any) => {
    try {
      setQrLoading(true);
      setSelectedPackage(pkg);
      const result = await paymentAPI.createPaymentLink({
        amount: pkg.price,
        description: pkg.name
      });
      
      if (result.success) {
        setPaymentData(result.data);
      }
    } catch (error) {
      console.error("Error creating payment link:", error);
    } finally {
      setQrLoading(false);
    }
  };

  const fetchUpgradeStatus = async () => {
    try {
      const response = await upgradeAPI.getStatus();
      if (response.success) {
        setUpgradeStatus(response.upgradeStatus || "none");
        // Update user in localStorage
        const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
        const updatedUser = { 
          ...currentUser, 
          upgradeStatus: response.upgradeStatus || "none", 
          hasMapAccess: response.hasMapAccess || false 
        };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Nếu status là approved, dispatch event để các component khác biết
        if (response.upgradeStatus === 'approved') {
          window.dispatchEvent(new Event("userUpgrade"));
        }
      }
    } catch (error) {
      console.error("Error fetching upgrade status:", error);
    }
  };

  const handleRequestUpgrade = async () => {
    setLoading(true);
    try {
      const response = await upgradeAPI.requestUpgrade();
      if (response.success) {
        setUpgradeStatus("pending");
        // Update user in localStorage
        const updatedUser = { ...user, upgradeStatus: "pending" };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setUser(updatedUser);
      }
    } catch (error: any) {
      console.error("Upgrade request error:", error);
      alert(error.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    {
      icon: Map,
      title: "Bản đồ thông minh",
      description: "Xem bản đồ ngập lụt thời gian thực với dữ liệu chính xác",
    },
    {
      icon: Zap,
      title: "Cập nhật nhanh",
      description: "Nhận thông báo ngay lập tức khi có thay đổi về tình trạng ngập",
    },
    {
      icon: Shield,
      title: "An toàn hơn",
      description: "Tìm đường đi an toàn nhất để tránh các khu vực ngập lụt",
    },
  ];

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-cyan-900 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-cyan-100 hover:text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-cyan-400/40 border border-white/20"
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại trang chủ</span>
        </motion.button>

        <motion.div
          className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/60 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8 text-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Lock className="w-16 h-16 text-white mx-auto mb-4" />
              <h1 className="text-3xl font-bold text-white mb-2">Nâng cấp tài khoản</h1>
              <p className="text-cyan-100">Mở khóa toàn bộ tính năng bản đồ thông minh</p>
            </motion.div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Status Display */}
            {upgradeStatus === "none" && (
              <motion.div
                className="mb-8 p-4 bg-yellow-500/20 border border-yellow-400/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="text-yellow-200 text-sm">
                  Bạn chưa nâng cấp tài khoản. Vui lòng quét mã QR để thanh toán.
                </p>
              </motion.div>
            )}

            {upgradeStatus === "pending" && (
              <motion.div
                className="mb-8 p-4 bg-blue-500/20 border border-blue-400/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <p className="text-blue-200 font-medium">
                      Đã nâng cấp - Đang chờ cấp quyền
                    </p>
                  </div>
                  <motion.button
                    onClick={fetchUpgradeStatus}
                    className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Kiểm tra lại
                  </motion.button>
                </div>
                <p className="text-blue-300 text-sm">
                  Yêu cầu của bạn đã được gửi. Admin sẽ xem xét và cấp quyền trong thời gian sớm nhất.
                </p>
              </motion.div>
            )}

            {upgradeStatus === "approved" && (
              <motion.div
                className="mb-8 p-4 bg-green-500/20 border border-green-400/30 rounded-lg"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center gap-2">
                  <Check className="w-5 h-5 text-green-400" />
                  <p className="text-green-200 font-medium">
                    Đã được cấp quyền - Có thể xem map
                  </p>
                </div>
                <p className="text-green-300 text-sm mt-1">
                  Tài khoản của bạn đã được nâng cấp. Bạn có thể sử dụng đầy đủ tính năng bản đồ thông minh.
                </p>
              </motion.div>
            )}

            {/* Benefits */}
            <h2 className="text-2xl font-bold text-white mb-6">Quyền lợi khi nâng cấp</h2>
            <div className="grid md:grid-cols-3 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  className="p-6 bg-slate-800/70 rounded-lg border border-cyan-400/30"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                >
                  <benefit.icon className="w-8 h-8 text-cyan-400 mb-3" />
                  <h3 className="font-semibold text-white mb-2">{benefit.title}</h3>
                  <p className="text-sm text-slate-300">{benefit.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Package Selection */}
            {!paymentData && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Chọn gói nâng cấp</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {packages.map((pkg, index) => (
                    <motion.div
                      key={pkg.id}
                      className={`relative p-6 rounded-xl border-2 transition-all cursor-pointer ${
                        selectedPackage?.id === pkg.id
                          ? 'border-cyan-400 bg-cyan-400/10'
                          : 'border-slate-600 bg-slate-800/50 hover:border-cyan-400/50 hover:bg-slate-800/70'
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      onClick={() => createPaymentLink(pkg)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {pkg.popular && (
                        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full">
                            Phổ biến nhất
                          </span>
                        </div>
                      )}
                      
                      <div className="text-center">
                        <h3 className="text-xl font-bold text-white mb-2">{pkg.name}</h3>
                        <div className="text-3xl font-bold text-cyan-400 mb-2">
                          {pkg.price.toLocaleString()} VNĐ
                        </div>
                        <p className="text-slate-300 text-sm mb-4">{pkg.description}</p>
                        
                        <motion.button
                          className="w-full px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Chọn gói
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* QR Code Section */}
            {paymentData && selectedPackage && (
              <motion.div
                className="bg-gradient-to-br from-slate-800/50 to-blue-800/50 rounded-xl p-8 border-2 border-cyan-400/30"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="text-center mb-6">
                  <QrCode className="w-12 h-12 text-cyan-400 mx-auto mb-3" />
                  <h3 className="text-xl font-bold text-white mb-2">Quét mã QR để thanh toán</h3>
                  <p className="text-slate-300 mb-4">Sau khi thanh toán, quyền truy cập bản đồ sẽ được gia hạn tự động</p>
                  
                  {paymentData && selectedPackage && (
                  <div className="text-left bg-slate-800/50 rounded-lg p-4 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Gói:</span>
                      <span className="text-cyan-400 font-bold">{selectedPackage.name}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Số tiền:</span>
                      <span className="text-cyan-400 font-bold">{paymentData.amount?.toLocaleString()} VNĐ</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Mã đơn hàng:</span>
                      <span className="text-white text-sm">{paymentData.orderCode}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-slate-400 text-sm">Ngân hàng:</span>
                      <span className="text-white text-sm">{paymentData.accountName || 'Vietcombank'}</span>
                    </div>
                    <div className="text-center mt-3">
                      <a 
                        href={paymentData.checkoutUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm rounded-lg transition-colors"
                      >
                        Thanh toán ngay
                      </a>
                    </div>
                  </div>
                )}
                </div>
                
                <div className="flex justify-center mb-6">
                  <div className="bg-slate-900/70 p-4 rounded-lg shadow-lg border border-cyan-400/20">
                    {qrLoading ? (
                      <div className="w-64 h-64 bg-slate-800 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          <p className="text-sm text-slate-400">Đang tạo mã QR...</p>
                        </div>
                      </div>
                    ) : paymentData?.qrCode ? (
                      <img 
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=256x256&data=${paymentData.qrCode}`}
                        alt="Payment QR Code"
                        className="w-64 h-64 rounded-lg"
                      />
                    ) : (
                      <div className="w-64 h-64 bg-slate-800 rounded-lg flex items-center justify-center border-2 border-dashed border-cyan-400/30">
                        <div className="text-center">
                          <QrCode className="w-24 h-24 text-cyan-400/50 mx-auto mb-2" />
                          <p className="text-sm text-slate-400">Không thể tạo QR Code</p>
                          <button
                            onClick={() => createPaymentLink(selectedPackage)}
                            className="mt-2 px-3 py-1 bg-cyan-500 hover:bg-cyan-600 text-white text-xs rounded transition-colors"
                          >
                            Thử lại
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="text-center">
                  <motion.button
                    onClick={() => {
                      setPaymentData(null);
                      setSelectedPackage(null);
                    }}
                    className="mb-4 px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    ← Chọn gói khác
                  </motion.button>
                  
                  <motion.button
                    onClick={handleRequestUpgrade}
                    disabled={loading}
                    className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg font-medium transition-all disabled:opacity-50"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {loading ? "Đang xử lý..." : "Xác nhận đã thanh toán"}
                  </motion.button>
                  <p className="text-xs text-slate-400 mt-2">
                    Nhấn nút này sau khi bạn đã quét QR và thanh toán thành công
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

