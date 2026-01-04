import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { User, Shield } from "lucide-react";

interface UserInfo {
  id: string;
  name: string;
  email: string;
  role?: string;
}

export function Header() {
  const [user, setUser] = useState<UserInfo | null>(null);

  useEffect(() => {
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        console.error("Error parsing user data:", e);
      }
    }

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          setUser(JSON.parse(userStr));
        } catch (e) {
          console.error("Error parsing user data:", e);
        }
      } else {
        setUser(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    
    // Also listen for custom event when user logs in on same tab
    window.addEventListener("userLogin", handleStorageChange);
    window.addEventListener("userLogout", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userLogin", handleStorageChange);
      window.removeEventListener("userLogout", handleStorageChange);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-slate-900/95 via-slate-900/80 to-transparent backdrop-blur-sm border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img
            src="https://ik.imagekit.io/i0aiv29ol/Logo_m%E1%BB%9Bi-100-removebg-preview.png?updatedAt=1760554379371"
            alt="Thủy Tỉnh"
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-white text-lg">FloodSense</h1>
            <p className="text-cyan-400 text-xs">
              Dự án Thủy Tỉnh - EXE201 - G01.04
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <motion.div
            animate={{
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="text-green-400 text-sm flex items-center gap-2"
          >
            <div className="w-2 h-2 bg-green-400 rounded-full" />
            <span>Thời gian thực</span>
          </motion.div>
          
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "admin" && (
                <Link
                  to="/admin/dashboard"
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors font-medium flex items-center gap-2"
                >
                  <Shield className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              )}
              <Link
                to="/profile"
                className="flex items-center gap-2 px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
              >
                <User className="w-4 h-4" />
                <span>{user.name}</span>
              </Link>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 text-white rounded-lg transition-colors font-medium"
            >
              Đăng nhập
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}
