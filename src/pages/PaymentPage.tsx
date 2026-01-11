import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowLeft, QrCode, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { paymentAPI } from "../services/api";

export function PaymentPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('pending'); // pending, success, failed
  const [countdown, setCountdown] = useState(300); // 5 minutes

  const amount = searchParams.get('amount') || '100000';
  const description = searchParams.get('description') || 'Nạp tiền vào tài khoản';

  useEffect(() => {
    createPaymentLink();
  }, []);

  useEffect(() => {
    if (countdown > 0 && status === 'pending') {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      setStatus('failed');
    }
  }, [countdown, status]);

  const createPaymentLink = async () => {
    try {
      const result = await paymentAPI.createPaymentLink({
        amount: parseInt(amount),
        description
      });
      
      if (result.success) {
        setPaymentData(result.data);
        // Start checking payment status
        checkPaymentStatus(result.data.orderCode);
      } else {
        setStatus('failed');
      }
    } catch (error) {
      console.error('Error creating payment:', error);
      setStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const checkPaymentStatus = async (orderCode) => {
    const checkInterval = setInterval(async () => {
      try {
        const result = await paymentAPI.checkPaymentStatus(orderCode);
        
        if (result.success && result.data.status === 'PAID') {
          setStatus('success');
          clearInterval(checkInterval);
          // Redirect to success page after 3 seconds
          setTimeout(() => {
            navigate('/payment/success');
          }, 3000);
        }
      } catch (error) {
        console.error('Error checking status:', error);
      }
    }, 3000); // Check every 3 seconds

    // Stop checking after 5 minutes
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 300000);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Đang tạo mã QR thanh toán...</div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <CheckCircle className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h2 className="text-white text-3xl mb-4">Thanh toán thành công!</h2>
          <p className="text-slate-300 mb-6">Tiền đã được cộng vào tài khoản của bạn</p>
          <p className="text-slate-400 text-sm">Đang chuyển hướng...</p>
        </motion.div>
      </div>
    );
  }

  if (status === 'failed' || !paymentData) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center"
        >
          <AlertCircle className="w-24 h-24 text-red-400 mx-auto mb-6" />
          <h2 className="text-white text-3xl mb-4">Thanh toán thất bại</h2>
          <p className="text-slate-300 mb-6">Đã xảy ra lỗi trong quá trình tạo thanh toán</p>
          <button
            onClick={() => navigate('/upgrade')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
          >
            Quay lại
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 py-8">
      <div className="max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/upgrade')}
            className="text-white hover:text-cyan-400 transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-2xl">Thanh toán PayOS</h1>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* QR Code Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-slate-800 rounded-2xl border border-slate-600 p-8"
          >
            <div className="text-center">
              <QrCode className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
              <h2 className="text-white text-xl mb-4">Quét mã QR để thanh toán</h2>
              
              {/* QR Code Image */}
              <div className="bg-white p-4 rounded-xl mb-6 inline-block">
                <img 
                  src={paymentData.qrCode} 
                  alt="Payment QR Code"
                  className="w-64 h-64"
                />
              </div>

              <div className="space-y-2 text-sm">
                <p className="text-slate-400">
                  Sử dụng ứng dụng ngân hàng hoặc ví điện tử để quét mã
                </p>
                <p className="text-slate-400">
                  Hoặc click vào link thanh toán: 
                  <a 
                    href={paymentData.checkoutUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline ml-1"
                  >
                    Thanh toán ngay
                  </a>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Payment Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Amount */}
            <div className="bg-slate-800 rounded-2xl border border-slate-600 p-6">
              <h3 className="text-white text-lg mb-4">Thông tin thanh toán</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Số tiền:</span>
                  <span className="text-cyan-400 text-xl font-bold">
                    {formatAmount(amount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Mã đơn hàng:</span>
                  <span className="text-white">{paymentData.orderCode}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Nội dung:</span>
                  <span className="text-white">{description}</span>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-slate-800 rounded-2xl border border-slate-600 p-6">
              <h3 className="text-white text-lg mb-4">Trạng thái thanh toán</h3>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-yellow-400">Chờ thanh toán</p>
                  <p className="text-slate-400 text-sm">
                    Thời gian còn lại: {formatTime(countdown)}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
              <h4 className="text-blue-400 font-medium mb-2">Hướng dẫn thanh toán:</h4>
              <ol className="text-slate-300 text-sm space-y-1 list-decimal list-inside">
                <li>Mở ứng dụng ngân hàng hoặc ví điện tử</li>
                <li>Chọn chức năng "Quét mã QR"</li>
                <li>Quét mã QR được hiển thị</li>
                <li>Xác nhận thông tin và hoàn tất thanh toán</li>
                <li>Hệ thống sẽ tự động cập nhật sau khi thanh toán thành công</li>
              </ol>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
