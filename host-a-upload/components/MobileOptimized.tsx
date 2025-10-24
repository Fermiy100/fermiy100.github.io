import React, { useState, useEffect } from 'react';

interface MobileOptimizedProps {
  children: React.ReactNode;
  className?: string;
}

export default function MobileOptimized({ children, className = '' }: MobileOptimizedProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [screenWidth, setScreenWidth] = useState(0);

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
      setIsMobile(width <= 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const mobileStyles = {
    container: {
      width: '100%',
      minHeight: '100vh',
      padding: isMobile ? '10px' : '20px',
      boxSizing: 'border-box' as const,
      background: '#f8f9fa'
    },
    content: {
      width: '100%',
      maxWidth: isMobile ? '100%' : '1200px',
      margin: '0 auto',
      background: 'white',
      borderRadius: isMobile ? '10px' : '15px',
      padding: isMobile ? '15px' : '30px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }
  };

  return (
    <div style={mobileStyles.container} className={className}>
      <div style={mobileStyles.content}>
        {children}
      </div>
    </div>
  );
}

// Хук для определения мобильного устройства
export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}

// Хук для получения размеров экрана
export function useScreenSize() {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024
  });

  useEffect(() => {
    const updateScreenSize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
        isMobile: window.innerWidth <= 768,
        isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
        isDesktop: window.innerWidth > 1024
      });
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);

    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
}

// Компонент для мобильных кнопок
export function MobileButton({ 
  children, 
  onClick, 
  style = {}, 
  disabled = false,
  variant = 'primary' 
}: {
  children: React.ReactNode;
  onClick: () => void;
  style?: React.CSSProperties;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
}) {
  const isMobile = useMobile();

  const baseStyles: React.CSSProperties = {
    padding: isMobile ? '15px 20px' : '10px 20px',
    borderRadius: '8px',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: isMobile ? '16px' : '14px',
    fontWeight: '500',
    minHeight: isMobile ? '44px' : 'auto',
    width: isMobile ? '100%' : 'auto',
    transition: 'all 0.2s ease',
    opacity: disabled ? 0.6 : 1,
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
      disabled={disabled}
      style={{
        ...baseStyles,
        ...variantStyles[variant]
      }}
    >
      {children}
    </button>
  );
}

// Компонент для мобильных форм
export function MobileForm({ 
  children, 
  onSubmit, 
  style = {} 
}: {
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  style?: React.CSSProperties;
}) {
  const isMobile = useMobile();

  return (
    <form
      onSubmit={onSubmit}
      style={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: isMobile ? '15px' : '10px',
        ...style
      }}
    >
      {children}
    </form>
  );
}

// Компонент для мобильных полей ввода
export function MobileInput({ 
  type = 'text',
  placeholder,
  value,
  onChange,
  style = {},
  required = false
}: {
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  style?: React.CSSProperties;
  required?: boolean;
}) {
  const isMobile = useMobile();

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      style={{
        width: '100%',
        padding: isMobile ? '15px' : '10px',
        border: '1px solid #dee2e6',
        borderRadius: '8px',
        fontSize: isMobile ? '16px' : '14px',
        minHeight: isMobile ? '44px' : 'auto',
        boxSizing: 'border-box',
        ...style
      }}
    />
  );
}
