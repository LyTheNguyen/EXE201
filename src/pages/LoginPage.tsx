import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { authAPI } from "../services/api";
import "../components/Login.css";

declare global {
  interface Window {
    google?: any;
  }
}

export function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null as string | null);
  const [success, setSuccess] = useState(null as string | null);
  const navigate = useNavigate();

  const googleClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const clientId = googleClientId;
    if (!clientId) {
      return;
    }

    const init = () => {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response: any) => {
          try {
            setLoading(true);
            setError(null);
            setSuccess(null);

            const result = await authAPI.googleSignInWithCredential({
              credential: response.credential,
            });

            if (result.success && result.token) {
              localStorage.setItem("token", result.token);
              localStorage.setItem("user", JSON.stringify(result.user));
              window.dispatchEvent(new Event("userLogin"));
              setSuccess("Đăng nhập bằng Google thành công! Đang chuyển hướng...");
              setTimeout(() => navigate("/"), 800);
            } else {
              setError(result.message || "Đăng nhập bằng Google thất bại");
            }
          } catch (err: any) {
            setError(err?.message || "Đăng nhập bằng Google thất bại");
          } finally {
            setLoading(false);
          }
        },
      });

      const signUpEl = document.getElementById("googleSignUpBtn");
      if (signUpEl) {
        signUpEl.innerHTML = "";
        window.google.accounts.id.renderButton(signUpEl, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "signup_with",
        });
      }

      const signInEl = document.getElementById("googleSignInBtn");
      if (signInEl) {
        signInEl.innerHTML = "";
        window.google.accounts.id.renderButton(signInEl, {
          theme: "outline",
          size: "large",
          type: "standard",
          shape: "pill",
          text: "signin_with",
        });
      }
    };

    const timer = window.setTimeout(init, 0);
    return () => window.clearTimeout(timer);
  }, [navigate]);

  // Form data states
  const [signUpData, setSignUpData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [signInData, setSignInData] = useState({
    email: "",
    password: "",
  });

  const handleSignUp = () => {
    setIsSignUp(true);
    setError(null);
    setSuccess(null);
    // Clear form data when switching
    setSignUpData({ name: "", email: "", password: "" });
  };

  const handleSignIn = () => {
    setIsSignUp(false);
    setError(null);
    setSuccess(null);
  };

  const handleSignUpSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      console.log('📤 Sending signup request:', { ...signUpData, password: '***' });
      const response = await authAPI.signUp(signUpData);
      console.log('📥 Signup response:', response);
      
      if (response.success) {
        setSuccess("Đăng ký thành công! Vui lòng đăng nhập.");
        // Pre-fill email in sign in form
        setSignInData({ ...signInData, email: signUpData.email });
        // Clear sign up form
        setSignUpData({ name: "", email: "", password: "" });
        // Switch to Sign In form after 1.5 seconds
        setTimeout(() => {
          setIsSignUp(false);
          setSuccess(null);
        }, 1500);
      } else {
        console.error('❌ Signup failed:', response.message);
        setError(response.message || "Đăng ký thất bại");
      }
    } catch (err: any) {
      console.error('❌ Signup error:', err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignInSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await authAPI.signIn(signInData);
      
      if (response.success) {
        setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
        // Save token to localStorage
        if (response.token) {
          localStorage.setItem("token", response.token);
          localStorage.setItem("user", JSON.stringify(response.user));
        }
        // Dispatch event to update header
        window.dispatchEvent(new Event("userLogin"));
        // Navigate to home after 1.5 seconds
        setTimeout(() => {
          navigate("/");
        }, 1500);
      } else {
        setError(response.message || "Đăng nhập thất bại");
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || "Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <motion.div 
      className="login-page-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.button 
        className="login-back-button" 
        onClick={handleBack} 
        aria-label="Back"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        ← Quay lại
      </motion.button>
      
      <motion.div 
        className="login-page-content"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <motion.h2 
          className="login-title"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          Sign in/up Form
        </motion.h2>
        
        <div className={`container ${isSignUp ? "right-panel-active" : ""}`} id="container">
          <motion.div 
            className="form-container sign-up-container"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSignUpSubmit}>
              <motion.h1
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              Create Account
            </motion.h1>
              <div className="social-container">
                {googleClientId ? (
                  <div id="googleSignUpBtn" />
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>
                    Google sign-in chưa được cấu hình.
                    <br />
                    Tạo file <code>.env</code> ở thư mục gốc và set <code>VITE_GOOGLE_CLIENT_ID</code>.
                  </div>
                )}
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                or use your email for registration
              </motion.span>
              {error && isSignUp && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
              {success && isSignUp && (
                <motion.div 
                  className="success-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {success}
                </motion.div>
              )}
              <motion.input 
                type="text" 
                placeholder="Name" 
                required
                value={signUpData.name}
                onChange={(e) => setSignUpData({ ...signUpData, name: e.target.value })}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileFocus={{ scale: 1.02 }}
                disabled={loading}
              />
              <motion.input 
                type="email" 
                placeholder="Email" 
                required
                value={signUpData.email}
                onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.75 }}
                whileFocus={{ scale: 1.02 }}
                disabled={loading}
              />
              <motion.input 
                type="password" 
                placeholder="Password" 
                required
                value={signUpData.password}
                onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.8 }}
                whileFocus={{ scale: 1.02 }}
                disabled={loading}
              />
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
                onClick={(e) => {
                  // Ensure form is submitted
                  if (!signUpData.name || !signUpData.email || !signUpData.password) {
                    e.preventDefault();
                    setError("Vui lòng điền đầy đủ thông tin");
                    return;
                  }
                }}
              >
                {loading ? "Đang xử lý..." : "Sign Up"}
              </motion.button>
            </form>
          </motion.div>
          
          <motion.div 
            className="form-container sign-in-container"
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <form onSubmit={handleSignInSubmit}>
              <motion.h1
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                Sign in
              </motion.h1>
              <div className="social-container">
                {googleClientId ? (
                  <div id="googleSignInBtn" />
                ) : (
                  <div style={{ fontSize: 12, opacity: 0.8, textAlign: "center" }}>
                    Google sign-in chưa được cấu hình.
                    <br />
                    Tạo file <code>.env</code> ở thư mục gốc và set <code>VITE_GOOGLE_CLIENT_ID</code>.
                  </div>
                )}
              </div>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                or use your account
              </motion.span>
              {error && !isSignUp && (
                <motion.div 
                  className="error-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {error}
                </motion.div>
              )}
              {success && !isSignUp && (
                <motion.div 
                  className="success-message"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  {success}
                </motion.div>
              )}
              <motion.input 
                type="email" 
                placeholder="Email" 
                required
                value={signInData.email}
                onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                whileFocus={{ scale: 1.02 }}
                disabled={loading}
              />
              <motion.input 
                type="password" 
                placeholder="Password" 
                required
                value={signInData.password}
                onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.75 }}
                whileFocus={{ scale: 1.02 }}
                disabled={loading}
              />
              <motion.a 
                href="#"
                whileHover={{ scale: 1.05 }}
                onClick={(e) => e.preventDefault()}
              >
                Forgot your password?
              </motion.a>
              <motion.button 
                type="submit"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={loading}
                style={{ opacity: loading ? 0.7 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}
              >
                {loading ? "Đang xử lý..." : "Sign In"}
              </motion.button>
            </form>
          </motion.div>
          
          <div className="overlay-container">
            <div className="overlay">
              <motion.div 
                className="overlay-panel overlay-left"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.h1
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Welcome Back!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  To keep connected with us please login with your personal info
                </motion.p>
                <motion.button 
                  className="ghost" 
                  type="button" 
                  onClick={handleSignIn}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign In
                </motion.button>
              </motion.div>
              <motion.div 
                className="overlay-panel overlay-right"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <motion.h1
                  initial={{ y: -10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.6 }}
                >
                  Hello, Friend!
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                >
                  Enter your personal details and start journey with us
                </motion.p>
                <motion.button 
                  className="ghost" 
                  type="button" 
                  onClick={handleSignUp}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Sign Up
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

