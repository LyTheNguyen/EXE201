// Google Sign-In component
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleSignInButton() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Load Google Sign-In script
    const loadGoogleScript = () => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeGoogleSignIn;
      document.body.appendChild(script);
    };

    const initializeGoogleSignIn = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: '784020868484-t93rg2i8u1o6n8u5gv6jgb0rdgbml01m.apps.googleusercontent.com',
          callback: handleGoogleSignIn,
          auto_select: false,
        });

        // Render the Google Sign-In button
        window.google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'filled_blue',
            size: 'large',
            text: 'signin_with',
            shape: 'rectangular',
            logo_alignment: 'left',
            width: 300,
          }
        );
      }
    };

    loadGoogleScript();
  }, []);

  const handleGoogleSignIn = async (response: any) => {
    setIsLoading(true);
    try {
      // Send Google token to backend for verification
      const res = await fetch('http://localhost:5000/api/auth/google-signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: response.credential,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Save token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Dispatch event to update header
        window.dispatchEvent(new Event('userLogin'));
        
        // Navigate to home
        navigate('/');
      } else {
        alert('Đăng nhập Google thất bại: ' + data.message);
      }
    } catch (error) {
      console.error('Google Sign-In Error:', error);
      alert('Có lỗi xảy ra khi đăng nhập bằng Google');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="google-signin-container">
      <div id="google-signin-button"></div>
      {isLoading && <p>Đang xử lý...</p>}
    </div>
  );
}
