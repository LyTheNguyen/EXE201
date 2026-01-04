import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogOut, User, Mail, ArrowLeft, Clock, CheckCircle } from "lucide-react";
import { upgradeAPI } from "../services/api";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  hasMapAccess?: boolean;
  upgradeStatus?: string;
  mapAccessGrantedAt?: string;
  mapAccessExpiresAt?: string;
}

export function UserProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    
    if (!userStr || !token) {
      // Redirect to login if not logged in
      navigate("/login");
      return;
    }

    try {
      const userData = JSON.parse(userStr);
      setUser(userData);
      
      // Fetch latest user data from server to get mapAccessExpiresAt
      if (userData.role !== 'admin') {
        fetchUserStatus();
      }
    } catch (e) {
      console.error("Error parsing user data:", e);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUserStatus = async () => {
    try {
      const response = await upgradeAPI.getStatus();
      if (response.success) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const updatedUser = {
            ...currentUser,
            hasMapAccess: response.hasMapAccess || false,
            upgradeStatus: response.upgradeStatus || 'none',
            mapAccessExpiresAt: response.mapAccessExpiresAt,
            mapAccessGrantedAt: response.mapAccessGrantedAt,
          };
          localStorage.setItem("user", JSON.stringify(updatedUser));
          setUser(updatedUser);
        }
      }
    } catch (error) {
      console.error("Error fetching user status:", error);
    }
  };

  useEffect(() => {
    const updateCountdown = () => {
      if (!user?.mapAccessExpiresAt) {
        setTimeRemaining("");
        return;
      }

      const now = new Date().getTime();
      const expiresAt = new Date(user.mapAccessExpiresAt).getTime();
      const difference = expiresAt - now;

      if (difference <= 0) {
        setTimeRemaining("Đã hết hạn");
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeRemaining(`${days} ngày ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [user?.mapAccessExpiresAt]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Dispatch event to update header
    window.dispatchEvent(new Event("userLogout"));
    navigate("/");
  };

  if (!user) {
    return null; // Will redirect
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        <motion.button
          onClick={() => navigate("/")}
          className="mb-6 flex items-center gap-2 px-4 py-2 bg-white hover:bg-cyan-50 text-gray-700 hover:text-cyan-600 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Quay lại trang chủ</span>
        </motion.button>

        <motion.div
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500 to-blue-500 p-8">
            <motion.div
              className="flex items-center gap-6"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg">
                <User className="w-12 h-12 text-cyan-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user.name}</h1>
                <p className="text-cyan-100 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Thông tin tài khoản</h2>
            
            <div className="space-y-4 mb-8">
              <motion.div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <label className="text-sm font-medium text-gray-500 mb-1 block">Tên người dùng</label>
                <p className="text-lg text-gray-800">{user.name}</p>
              </motion.div>

              <motion.div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <label className="text-sm font-medium text-gray-500 mb-1 block">Email</label>
                <p className="text-lg text-gray-800">{user.email}</p>
              </motion.div>

              <motion.div
                className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <label className="text-sm font-medium text-gray-500 mb-1 block">ID người dùng</label>
                <p className="text-lg text-gray-800 font-mono text-sm">{user.id}</p>
              </motion.div>

              {/* Upgrade Status */}
              <motion.div
                className={`p-4 rounded-lg border ${
                  user.hasMapAccess && user.upgradeStatus === 'approved'
                    ? 'bg-green-50 border-green-200'
                    : user.upgradeStatus === 'pending'
                    ? 'bg-yellow-50 border-yellow-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-500 mb-1 block">Tài khoản đã nâng cấp</label>
                    <p className={`text-lg font-semibold ${
                      user.hasMapAccess && user.upgradeStatus === 'approved'
                        ? 'text-green-600'
                        : user.upgradeStatus === 'pending'
                        ? 'text-yellow-600'
                        : 'text-gray-600'
                    }`}>
                      {user.hasMapAccess && user.upgradeStatus === 'approved' ? (
                        <span className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Đã nâng cấp
                        </span>
                      ) : user.upgradeStatus === 'pending' ? (
                        'Đang chờ cấp quyền'
                      ) : (
                        'Chưa nâng cấp'
                      )}
                    </p>
                  </div>
                  {user.hasMapAccess && user.upgradeStatus === 'approved' && user.mapAccessExpiresAt && (
                    <div className="text-right">
                      <label className="text-sm font-medium text-gray-500 mb-1 block flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        Thời gian còn lại
                      </label>
                      <p className={`text-lg font-mono font-bold ${
                        timeRemaining === "Đã hết hạn" ? 'text-red-600' : 'text-cyan-600'
                      }`}>
                        {timeRemaining || "Đang tính..."}
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            <motion.button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors font-medium"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <LogOut className="w-5 h-5" />
              Đăng xuất
            </motion.button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

