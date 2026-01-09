// Simple Google Sign-In Button for Sign In
import React from 'react';

export function SimpleGoogleSignInButton() {
  const handleGoogleSignIn = () => {
    // Direct Google OAuth redirect
    window.location.href = 'https://accounts.google.com/o/oauth2/v2/auth?' +
      'client_id=784020868484-t93rg2i8u1o6n8u5gv6jgb0rdgbml01m.apps.googleusercontent.com&' +
      'redirect_uri=http://localhost:5000/api/auth/google/callback&' +
      'response_type=code&' +
      'scope=email profile&' +
      'access_type=offline';
  };

  return (
    <button 
      onClick={handleGoogleSignIn}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '14px 28px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#3c4043',
        fontSize: '16px',
        fontWeight: '500',
        fontFamily: '"Roboto", sans-serif',
        cursor: 'pointer',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        width: '100%',
        maxWidth: '320px',
        margin: '12px 0',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
        position: 'relative',
        overflow: 'hidden'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
        e.currentTarget.style.borderColor = '#d2d2d2';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.12)';
        e.currentTarget.style.borderColor = '#e0e0e0';
        e.currentTarget.style.transform = 'translateY(0px)';
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'translateY(1px)';
        e.currentTarget.style.boxShadow = '0 2px 6px rgba(0, 0, 0, 0.1)';
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'translateY(-1px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
      }}
    >
      <svg width="22" height="22" viewBox="0 0 22 22" style={{ minWidth: '22px' }}>
        <path fill="#4285F4" d="M22 11.08c0-1.35-.12-2.62-.35-3.78h-3.58v2.43h2.21c-.11.8-.44 1.48-.95 2.04v1.66h3.57c-.33-2.22-2.11-3.95-4.44-3.95-2.51 0-4.55 2.04-4.55 4.55 0 2.31 1.68 4.23 3.88 4.55v-2.08c-1.08-.35-2.08-.95-2.88-1.75z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.22-.16z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span style={{ 
        fontWeight: '500',
        letterSpacing: '0.2px',
        fontSize: '15px'
      }}>
        Đăng nhập với Google
      </span>
    </button>
  );
}
