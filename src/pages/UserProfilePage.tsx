import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { LogOut, User, Mail, ArrowLeft, Clock, CheckCircle, Camera, Edit3, Wallet } from "lucide-react";
import { upgradeAPI, userAPI, paymentAPI } from "../services/api";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  img?: string; // URL ảnh đại diện nếu backend trả về
  hasMapAccess?: boolean;
  upgradeStatus?: string;
  mapAccessGrantedAt?: string;
  mapAccessExpiresAt?: string;
  money?: number;
  transactions?: Array<{
    type: string;
    amount: number;
    orderCode: string;
    status: string;
    createdAt: string;
  }>;
}

export function UserProfilePage() {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
      // Lấy thông tin upgrade status
      const upgradeResponse = await upgradeAPI.getStatus();
      
      // Lấy thông tin tiền và transactions
      const paymentResponse = await paymentAPI.getUserInfo();
      
      if (upgradeResponse.success || paymentResponse.success) {
        const userStr = localStorage.getItem("user");
        if (userStr) {
          const currentUser = JSON.parse(userStr);
          const updatedUser = {
            ...currentUser,
            hasMapAccess: upgradeResponse.hasMapAccess || false,
            upgradeStatus: upgradeResponse.upgradeStatus || 'none',
            mapAccessExpiresAt: upgradeResponse.mapAccessExpiresAt,
            mapAccessGrantedAt: upgradeResponse.mapAccessGrantedAt,
            money: paymentResponse.data?.money || 0,
            transactions: paymentResponse.data?.transactions || [],
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

  const handleStartEditName = () => {
    setEditName(user.name);
    setIsEditingName(true);
  };

  const handleSaveName = async () => {
    if (!editName.trim()) {
      alert("Tên không được để trống");
      return;
    }
    try {
      setSavingName(true);
      // Chỉ cho phép sửa tên, email giữ nguyên theo user hiện tại
      const response = await userAPI.updateProfile({ name: editName.trim(), email: user.email });
      if (!response.success) {
        alert(response.message || "Cập nhật thông tin thất bại");
        return;
      }

      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};
      const updatedUser = {
        ...currentUser,
        name: editName.trim(),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingName(false);
      alert("Đã cập nhật tên người dùng");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi cập nhật tên người dùng");
    } finally {
      setSavingName(false);
    }
  };

  const handleAvatarButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = async (event: any) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      const response = await userAPI.uploadAvatar(file);
      if (!response.success) {
        alert(response.message || "Tải ảnh đại diện thất bại");
        return;
      }

      const userStr = localStorage.getItem("user");
      const currentUser = userStr ? JSON.parse(userStr) : {};
      const updatedUser = {
        ...currentUser,
        ...(response.user || {}),
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      alert("Đã cập nhật ảnh đại diện");
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra khi tải ảnh đại diện");
    } finally {
      setUploadingAvatar(false);
      if (event.target) {
        event.target.value = "";
      }
    }
  };

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-cyan-900 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 sm:px-12 py-10 sm:py-12">
        <div className="mb-8 flex justify-between items-center flex-nowrap gap-4" style={{marginTop: '8rem !important'}}>
          <motion.button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/60 border-2 border-blue-400 font-bold"
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <ArrowLeft className="w-5 h-5" style={{display: 'inline-block', verticalAlign: 'middle'}} />
            <span className="font-semibold" style={{display: 'inline-block', verticalAlign: 'middle'}}>Quay lại trang chủ</span>
          </motion.button>
          <motion.button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-500 text-white rounded-xl transition-all duration-200 shadow-lg shadow-red-500/60 border-2 border-red-500 font-bold"
            whileHover={{ scale: 1.02, x: 2 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-5 h-5" style={{display: 'inline-block', verticalAlign: 'middle'}} />
            <span className="font-semibold" style={{display: 'inline-block', verticalAlign: 'middle'}}>Đăng xuất</span>
          </motion.button>
        </div>

        <motion.div
          className="-translate-y-10 bg-slate-900/70 backdrop-blur-xl border border-cyan-400/60 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Header Section */}
          <div className="bg-gradient-to-r from-cyan-500/80 to-blue-600/80 p-6 md:p-8">
            <motion.div
              className="flex flex-col md:flex-row items-center md:items-center gap-4 md:gap-6 text-center md:text-left"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <div className="flex flex-col items-center gap-3">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg overflow-hidden">
                  {user.img ? (
                    <img
                      src={user.img}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-cyan-500" />
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarButtonClick}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-cyan-50 border border-cyan-200/60 transition-colors"
                  disabled={uploadingAvatar}
                >
                  <Camera className="w-3 h-3" />
                  <span>{uploadingAvatar ? "Đang cập nhật..." : "Thay ảnh đại diện"}</span>
                </button>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  className="hidden"
                  style={{ display: "none" }}
                  onChange={handleAvatarChange}
                />
              </div>
              <div className="mt-3 md:mt-0">
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 break-words">{user.name}</h1>
                <p className="text-cyan-100 flex items-center justify-center md:justify-start gap-2 break-all">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </motion.div>
          </div>

          {/* Content Section */}
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold text-white mb-4 md:mb-6">Thông tin tài khoản</h2>
            
            {user.role === 'admin' && (
              <div className="mb-6 p-4 bg-purple-500/20 border border-purple-400/40 rounded-xl">
                <div className="flex items-center gap-2 text-purple-200">
                  <User className="w-5 h-5" />
                  <p className="font-semibold">Tài khoản Admin - Không cần nâng cấp</p>
                </div>
              </div>
            )}
            
            <div className="space-y-4 md:space-y-5 mb-8">
              <motion.div
                className="p-6 bg-slate-900/70 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-slate-300 block">Tên người dùng</label>
                  {!isEditingName && (
                    <button
                      type="button"
                      onClick={handleStartEditName}
                      className="flex items-center gap-1 text-xs text-cyan-300 hover:text-cyan-100"
                    >
                      <Edit3 className="w-3 h-3" />
                      <span>Sửa</span>
                    </button>
                  )}
                </div>
                {!isEditingName ? (
                  <p className="text-lg text-white">{user.name}</p>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 rounded-lg bg-slate-800/80 border border-slate-600 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    />
                    <div className="flex gap-2 justify-end sm:justify-start">
                      <button
                        type="button"
                        onClick={() => setIsEditingName(false)}
                        className="px-3 py-2 rounded-lg border border-slate-600 text-slate-300 text-xs hover:bg-slate-800/80"
                        disabled={savingName}
                      >
                        Hủy
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveName}
                        className="px-3 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-semibold disabled:opacity-60"
                        disabled={savingName}
                      >
                        {savingName ? "Đang lưu..." : "Lưu"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>

              <div className="grid gap-4 md:gap-5 md:grid-cols-2">
                <motion.div
                  className="p-6 bg-slate-900/70 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <label className="text-sm font-medium text-slate-300 mb-1 block">Email</label>
                  <p className="text-lg text-white break-all">{user.email}</p>
                </motion.div>

                <motion.div
                  className="p-6 bg-slate-900/70 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  <label className="text-sm font-medium text-slate-300 mb-1 block">ID người dùng</label>
                  <p className="text-xs md:text-sm text-cyan-200 font-mono break-all leading-relaxed">{user.id}</p>
                </motion.div>
              </div>

              {/* Phần này chỉ hiển thị cho user thường, không hiển thị cho admin */}
              {user.role !== 'admin' && (
                <>
                  {/* Thời gian sử dụng bản đồ */}
                  <motion.div
                    className="p-6 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 rounded-xl border border-cyan-400/30 shadow-lg shadow-cyan-500/10"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          Thời gian sử dụng bản đồ
                        </label>
                        <p className="text-2xl font-bold text-cyan-300">
                          {timeRemaining || "Không có"}
                        </p>
                        {user.mapAccessExpiresAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            Hết hạn: {new Date(user.mapAccessExpiresAt).toLocaleDateString('vi-VN')}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() => navigate("/upgrade")}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg text-sm font-medium transition-all"
                      >
                        Gia hạn
                      </button>
                    </div>
                  </motion.div>

                  {/* Upgrade Status */}
                  <motion.div
                    className={`p-6 rounded-xl border ${
                      user.hasMapAccess && user.upgradeStatus === 'approved'
                        ? 'bg-green-500/10 border-green-400/70'
                        : user.upgradeStatus === 'pending'
                        ? 'bg-yellow-500/10 border-yellow-400/70'
                        : 'bg-slate-900/70 border-cyan-400/30 shadow-lg shadow-cyan-500/10'
                    }`}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.75 }}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-slate-300 mb-1 block">Tài khoản đã nâng cấp</label>
                        <p className={`text-lg font-semibold ${
                          user.hasMapAccess && user.upgradeStatus === 'approved'
                            ? 'text-green-300'
                            : user.upgradeStatus === 'pending'
                            ? 'text-yellow-300'
                            : 'text-slate-300'
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
                          <label className="text-sm font-medium text-slate-300 mb-1 block flex items-center gap-1 justify-end">
                            <Clock className="w-4 h-4" />
                            Thời gian còn lại
                          </label>
                          <p className={`text-lg font-mono font-bold ${
                            timeRemaining === "Đã hết hạn" ? 'text-red-400' : 'text-cyan-300'
                          }`}>
                            {timeRemaining || "Đang tính..."}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </>
              )}

              </div>

                      </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

