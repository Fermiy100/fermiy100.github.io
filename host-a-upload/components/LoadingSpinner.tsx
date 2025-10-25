import React from 'react';
import { useMobile } from './MobileOptimized';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  overlay?: boolean;
}

export default function LoadingSpinner({ 
  size = 'medium', 
  text = 'Загрузка...', 
  overlay = false 
}: LoadingSpinnerProps) {
  const isMobile = useMobile();

  const getSize = () => {
    const sizes = {
      small: isMobile ? '30px' : '24px',
      medium: isMobile ? '50px' : '40px',
      large: isMobile ? '80px' : '60px'
    };
    return sizes[size];
  };

  const spinnerSize = getSize();
  const fontSize = isMobile ? '16px' : '14px';

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `4px solid #f3f3f3`,
    borderTop: `4px solid #007bff`,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto'
  };

  const containerStyle: React.CSSProperties = overlay ? {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
    color: 'white'
  } : {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? '40px 20px' : '60px 40px',
    textAlign: 'center'
  };

  return (
    <div style={containerStyle}>
      <div style={spinnerStyle}></div>
      {text && (
        <div style={{
          marginTop: isMobile ? '20px' : '15px',
          fontSize: fontSize,
          color: overlay ? 'white' : '#666',
          fontWeight: '500'
        }}>
          {text}
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}

// Компонент для кнопок с загрузкой
export function LoadingButton({ 
  loading, 
  children, 
  onClick, 
  disabled = false,
  variant = 'primary',
  style = {},
  ...props 
}: {
  loading: boolean;
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  style?: React.CSSProperties;
  [key: string]: any;
}) {
  const isMobile = useMobile();

  const baseStyle: React.CSSProperties = {
    padding: isMobile ? '15px 20px' : '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: loading || disabled ? 'not-allowed' : 'pointer',
    fontSize: isMobile ? '16px' : '14px',
    fontWeight: '500',
    minHeight: isMobile ? '44px' : 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    opacity: loading || disabled ? 0.6 : 1,
    transition: 'all 0.2s ease',
    ...style
  };

  const variantStyles = {
    primary: {
      background: '#007bff',
      color: 'white'
    },
    secondary: {
      background: '#f8f9fa',
      color: '#333',
      border: '1px solid #dee2e6'
    },
    danger: {
      background: '#dc3545',
      color: 'white'
    }
  };

  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      style={{
        ...baseStyle,
        ...variantStyles[variant]
      }}
      {...props}
    >
      {loading && (
        <div style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
      )}
      {children}
    </button>
  );
}

// Компонент для прогресс-бара
export function ProgressBar({ 
  progress, 
  text = '', 
  showPercentage = true 
}: {
  progress: number;
  text?: string;
  showPercentage?: boolean;
}) {
  const isMobile = useMobile();

  return (
    <div style={{
      width: '100%',
      background: '#f8f9fa',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: isMobile ? '15px' : '10px'
    }}>
      <div style={{
        width: `${Math.min(100, Math.max(0, progress))}%`,
        height: isMobile ? '12px' : '8px',
        background: 'linear-gradient(90deg, #007bff, #0056b3)',
        borderRadius: '8px',
        transition: 'width 0.3s ease',
        position: 'relative'
      }}>
        {showPercentage && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'white',
            fontSize: isMobile ? '12px' : '10px',
            fontWeight: '600',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {Math.round(progress)}%
          </div>
        )}
      </div>
      
      {text && (
        <div style={{
          marginTop: '8px',
          fontSize: isMobile ? '14px' : '12px',
          color: '#666',
          textAlign: 'center'
        }}>
          {text}
        </div>
      )}
    </div>
  );
}
