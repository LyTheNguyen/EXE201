import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { Users, CheckCircle, Clock, X, ArrowLeft, Shield, Map } from "lucide-react";
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
}

export function AdminDashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="min-h-screen bg-gradient-to-b from-gray-100 via-gray-50 to-white pt-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
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
          className="bg-white rounded-2xl shadow-2xl overflow-hidden mb-8"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-8">
            <div className="flex items-center gap-4">
              <Shield className="w-12 h-12 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Admin Dashboard</h1>
                <p className="text-purple-100">Quản lý người dùng và quyền truy cập</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Pending Upgrade Requests */}
        {pendingUsers.length > 0 && (
          <motion.div
            className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-6 mb-8"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-6 h-6 text-yellow-600" />
              <h2 className="text-xl font-bold text-yellow-900">
                Yêu cầu nâng cấp đang chờ ({pendingUsers.length})
              </h2>
            </div>
            <div className="space-y-3">
              {pendingUsers.map((pendingUser) => (
                <div
                  key={pendingUser.id}
                  className="bg-white rounded-lg p-4 border border-yellow-200 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{pendingUser.name}</p>
                    <p className="text-sm text-gray-600">{pendingUser.email}</p>
                    <p className="text-xs text-gray-500 mt-1">
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
          className="bg-white rounded-2xl shadow-2xl overflow-hidden"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-500" />
              <h2 className="text-2xl font-bold text-gray-800">Danh sách người dùng</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tên
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vai trò
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quyền Map
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{u.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        u.role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.role === 'admin' ? (
                        <span className="text-gray-400 text-sm">-</span>
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {u.role === 'admin' ? (
                        <span className="text-gray-400 text-sm">-</span>
                      ) : (
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          u.upgradeStatus === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : u.upgradeStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {u.upgradeStatus === 'approved' ? 'Đã cấp quyền' :
                           u.upgradeStatus === 'pending' ? 'Đang chờ' : 'Chưa nâng cấp'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        {!u.hasMapAccess && u.upgradeStatus === 'pending' && (
                          <motion.button
                            onClick={() => handleGrantAccess(u.id)}
                            className="text-green-600 hover:text-green-900 flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <CheckCircle className="w-4 h-4" />
                            Cấp quyền
                          </motion.button>
                        )}
                        {u.role !== 'admin' && (
                          <motion.button
                            onClick={() => handleDeleteUser(u.id)}
                            className="text-red-600 hover:text-red-900 flex items-center gap-1"
                            whileHover={{ scale: 1.05 }}
                          >
                            <X className="w-4 h-4" />
                            Xóa
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

