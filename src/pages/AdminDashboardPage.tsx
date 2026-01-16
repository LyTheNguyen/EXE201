import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, CheckCircle, Clock, Trash2, ArrowLeft, Shield, Map } from "lucide-react";
import { adminAPI } from "../services/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  hasMapAccess: boolean;
  upgradeStatus: string;
  upgradeRequestedAt?: string;
  mapAccessGrantedAt?: string;
  money?: number;
  transactions?: any[];
}

export function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchEmail, setSearchEmail] = useState<string>('');
  const navigate = useNavigate();

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
      
      if (userData.role !== "admin") {
        navigate("/");
        return;
      }

      fetchUsers();
      fetchPendingRequests();
    } catch (e) {
      console.error("Error parsing user data:", e);
      navigate("/login");
    }
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await adminAPI.getUsers();
      if (response.success) {
        // Map _id to id for consistency
        const usersWithId = (response.users || []).map((u: any) => ({
          ...u,
          id: u.id || u._id,
        }));
        setUsers(usersWithId);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await adminAPI.getUpgradeRequests();
      if (response.success) {
        // Map _id to id for consistency
        const pendingWithId = (response.users || []).map((u: any) => ({
          ...u,
          id: u.id || u._id,
        }));
        setPendingUsers(pendingWithId);
      }
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  const handleToggleMapAccess = async (userId: string, currentAccess: boolean) => {
    if (!userId || userId === 'undefined') {
      alert("Lỗi: Không tìm thấy ID người dùng");
      console.error("Invalid userId:", userId);
      return;
    }
    
    try {
      if (currentAccess) {
        // Revoke access
        const response = await adminAPI.revokeMapAccess(userId);
        if (response.success) {
          alert("Đã thu hồi quyền xem map!");
          fetchUsers();
          fetchPendingRequests();
          window.dispatchEvent(new Event("userLogin"));
        } else {
          alert(response.message || "Có lỗi xảy ra");
        }
      } else {
        // Grant access
        const response = await adminAPI.grantMapAccess(userId);
        if (response.success) {
          alert("Đã cấp quyền xem map thành công!");
          fetchUsers();
          fetchPendingRequests();
          window.dispatchEvent(new Event("userLogin"));
        } else {
          alert(response.message || "Có lỗi xảy ra");
        }
      }
    } catch (error: any) {
      console.error("Toggle map access error:", error);
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const handleGrantAccess = async (userId: string) => {
    if (!userId || userId === 'undefined') {
      alert("Lỗi: Không tìm thấy ID người dùng");
      console.error("Invalid userId:", userId);
      return;
    }
    
    try {
      console.log("Granting access to userId:", userId);
      const response = await adminAPI.grantMapAccess(userId);
      if (response.success) {
        alert("Đã cấp quyền xem map thành công!");
        fetchUsers();
        fetchPendingRequests();
        // Dispatch event to update user data
        window.dispatchEvent(new Event("userLogin"));
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      console.error("Grant access error:", error);
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) return;
    
    try {
      const response = await adminAPI.deleteUser(userId);
      if (response.success) {
        alert("Đã xóa user thành công!");
        fetchUsers();
        fetchPendingRequests();
      } else {
        alert(response.message || "Có lỗi xảy ra");
      }
    } catch (error: any) {
      alert(error.message || "Có lỗi xảy ra");
    }
  };

  // Filter users based on status and email
  const filteredUsers = users.filter(user => {
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'approved' && user.upgradeStatus === 'approved') ||
      (filterStatus === 'none' && user.upgradeStatus === 'none');
    
    const matchesEmail = searchEmail === '' || user.email.toLowerCase().includes(searchEmail.toLowerCase());
    
    return matchesStatus && matchesEmail;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-cyan-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-cyan-100">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-slate-800 via-blue-900 to-cyan-900 pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <motion.button
          onClick={() => navigate("/")}
          className="mb-8 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300 text-white rounded-xl transition-all duration-200 shadow-lg shadow-blue-500/60 border-2 border-blue-400 font-bold"
          style={{marginTop: '8rem !important'}}
          whileHover={{ scale: 1.02, x: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <ArrowLeft className="w-5 h-5" style={{display: 'inline-block', verticalAlign: 'middle'}} />
          <span className="font-semibold" style={{display: 'inline-block', verticalAlign: 'middle'}}>Quay lại trang chủ</span>
        </motion.button>

        <motion.div
          className="bg-slate-900/70 backdrop-blur-xl border border-cyan-400/30 rounded-2xl shadow-2xl overflow-hidden mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-cyan-500/80 to-blue-600/80 p-8">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-white" />
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-cyan-100">Quản lý người dùng và quyền truy cập</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <div className="text-center">
                  <p className="text-xs text-cyan-100 mb-1">Tổng số tiền trong hệ thống</p>
                  <p className="text-2xl font-bold text-white">
                    {users.reduce((sum, u) => sum + (u.money || 0), 0).toLocaleString()} VNĐ
                  </p>
                  <p className="text-xs text-cyan-200 mt-1">
                    {users.filter(u => (u.money || 0) > 0).length} người dùng đã nạp
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Upgrade Requests */}
        {pendingUsers.length > 0 && (
          <motion.div
            className="bg-yellow-500/10 border border-yellow-400/60 rounded-xl p-6 mb-8 text-yellow-50"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-yellow-300" />
              <h2 className="text-xl font-bold text-yellow-100">
                Yêu cầu nâng cấp đang chờ ({pendingUsers.length})
              </h2>
            </div>
            <div className="space-y-3">
              {pendingUsers.map((pendingUser) => (
                <div
                  key={pendingUser.id}
                  className="bg-slate-900/70 rounded-lg p-4 border border-yellow-400/40 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-white">{pendingUser.name}</p>
                    <p className="text-sm text-slate-200">{pendingUser.email}</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Yêu cầu lúc: {pendingUser.upgradeRequestedAt 
                        ? new Date(pendingUser.upgradeRequestedAt).toLocaleString('vi-VN')
                        : 'N/A'}
                    </p>
                  </div>
                  <motion.button
                    onClick={() => handleGrantAccess(pendingUser.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Cấp quyền
                  </motion.button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Users Table */}
        <motion.div
          className="bg-slate-900/70 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-cyan-400" />
                <h2 className="text-2xl font-bold text-white">Danh sách người dùng</h2>
                <span className="text-sm text-slate-400">({filteredUsers.length} kết quả)</span>
              </div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-6 border-b border-white/10 bg-slate-800/50">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Status Filter */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">Lọc theo trạng thái</label>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="all">Tất cả</option>
                  <option value="approved">Đã cấp quyền</option>
                  <option value="none">Chưa nâng cấp</option>
                </select>
              </div>

              {/* Email Search */}
              <div className="flex-1">
                <label className="block text-sm font-medium text-slate-300 mb-2">Tìm kiếm theo email</label>
                <input
                  type="email"
                  value={searchEmail}
                  onChange={(e) => setSearchEmail(e.target.value)}
                  placeholder="Nhập email để tìm kiếm..."
                  className="w-full px-4 py-2 pl-10 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                />
              </div>

              {/* Clear Filters Button */}
              <div className="flex items-end">
                <motion.button
                  onClick={() => {
                    setFilterStatus('all');
                    setSearchEmail('');
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white rounded-lg transition-all duration-200 shadow-lg shadow-red-500/60 border-2 border-red-400 font-bold"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Xóa bộ lọc
                </motion.button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-center">
              <thead className="bg-slate-900/80">
                <tr>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Email
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Số tiền
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Quyền Map
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-xs font-medium text-slate-300 uppercase tracking-wider text-center">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900/60 divide-y divide-slate-800">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/80">
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm font-medium text-white">{u.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="text-sm text-slate-300">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-200' 
                          : 'bg-blue-500/20 text-blue-200'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-bold text-green-400">
                          {(u.money || 0).toLocaleString()} VNĐ
                        </span>
                        {u.transactions && u.transactions.length > 0 && (
                          <span className="text-xs text-slate-400 mt-1">
                            ({u.transactions.length} giao dịch)
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {u.role === 'admin' ? (
                        <span className="text-slate-500 text-sm">-</span>
                      ) : (
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={u.hasMapAccess}
                            onChange={() => handleToggleMapAccess(u.id, u.hasMapAccess)}
                            className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 cursor-pointer transition-colors"
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      {u.role === 'admin' ? (
                        <span className="text-slate-500 text-sm">-</span>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.upgradeStatus === 'approved'
                            ? 'bg-green-500/20 text-green-200'
                            : u.upgradeStatus === 'pending'
                            ? 'bg-yellow-500/20 text-yellow-200'
                            : 'bg-slate-700 text-slate-200'
                        }`}>
                          {u.upgradeStatus === 'approved' ? 'Đã cấp quyền' :
                           u.upgradeStatus === 'pending' ? 'Đang chờ' : 'Chưa nâng cấp'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center justify-center gap-3">
                        {!u.hasMapAccess && u.upgradeStatus === 'pending' && (
                          <motion.button
                            onClick={() => handleGrantAccess(u.id)}
                            className="text-green-400 hover:text-green-200 flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Cấp quyền
                          </motion.button>
                        )}
                        {u.role !== 'admin' && (
                          <motion.button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-400 hover:text-red-200 flex items-center"
                            whileHover={{ scale: 1.05 }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </motion.button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

