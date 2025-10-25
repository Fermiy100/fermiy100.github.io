import React, { useState, useEffect } from 'react';
import { useMobile } from './MobileOptimized';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationSystemProps {
  children: React.ReactNode;
}

export const NotificationContext = React.createContext<{
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  hideNotification: (id: string) => void;
}>({
  showNotification: () => {},
  hideNotification: () => {}
});

export function NotificationProvider({ children }: NotificationSystemProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isMobile = useMobile();

  const showNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Date.now().toString();
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Автоматически скрыть уведомление через указанное время
    const duration = notification.duration || 5000;
    setTimeout(() => {
      hideNotification(id);
    }, duration);
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const getNotificationStyle = (type: Notification['type']) => {
    const baseStyle = {
      padding: isMobile ? '15px' : '12px 16px',
      borderRadius: '8px',
      marginBottom: '10px',
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      border: '1px solid',
      maxWidth: isMobile ? '100%' : '400px',
      fontSize: isMobile ? '14px' : '13px',
      lineHeight: '1.4'
    };

    const typeStyles = {
      success: {
        background: '#d4edda',
        color: '#155724',
        borderColor: '#c3e6cb'
      },
      error: {
        background: '#f8d7da',
        color: '#721c24',
        borderColor: '#f5c6cb'
      },
      warning: {
        background: '#fff3cd',
        color: '#856404',
        borderColor: '#ffeaa7'
      },
      info: {
        background: '#d1ecf1',
        color: '#0c5460',
        borderColor: '#bee5eb'
      }
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    return icons[type];
  };

  return (
    <NotificationContext.Provider value={{ showNotification, hideNotification }}>
      {children}
      
      {/* Контейнер уведомлений */}
      <div style={{
        position: 'fixed',
        top: isMobile ? '10px' : '20px',
        right: isMobile ? '10px' : '20px',
        zIndex: 9999,
        width: isMobile ? 'calc(100% - 20px)' : '400px',
        maxWidth: isMobile ? '100%' : '400px'
      }}>
        {notifications.map((notification) => (
          <div
            key={notification.id}
            style={getNotificationStyle(notification.type)}
          >
            <div style={{ fontSize: '16px', flexShrink: 0 }}>
              {getNotificationIcon(notification.type)}
            </div>
            
            <div style={{ flex: 1 }}>
              <div style={{
                fontWeight: '600',
                marginBottom: '4px',
                color: 'inherit'
              }}>
                {notification.title}
              </div>
              <div style={{ color: 'inherit' }}>
                {notification.message}
              </div>
              
              {notification.action && (
                <button
                  onClick={notification.action.onClick}
                  style={{
                    background: 'transparent',
                    border: '1px solid currentColor',
                    color: 'inherit',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    marginTop: '8px',
                    cursor: 'pointer'
                  }}
                >
                  {notification.action.label}
                </button>
              )}
            </div>
            
            <button
              onClick={() => hideNotification(notification.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'inherit',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '0',
                flexShrink: 0,
                opacity: 0.7
              }}
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
}

// Хук для использования уведомлений
export function useNotifications() {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
}

// Компонент для отображения уведомлений
export function NotificationToast({ notification }: { notification: Notification }) {
  const { hideNotification } = useNotifications();
  const isMobile = useMobile();

  useEffect(() => {
    const timer = setTimeout(() => {
      hideNotification(notification.id);
    }, notification.duration || 5000);

    return () => clearTimeout(timer);
  }, [notification.id, notification.duration, hideNotification]);

  return (
    <div
      style={{
        position: 'fixed',
        top: isMobile ? '10px' : '20px',
        right: isMobile ? '10px' : '20px',
        zIndex: 9999,
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: isMobile ? '15px' : '12px 16px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: isMobile ? 'calc(100% - 20px)' : '400px',
        animation: 'slideIn 0.3s ease-out'
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '12px'
      }}>
        <div style={{ fontSize: '16px', flexShrink: 0 }}>
          {notification.type === 'success' && '✅'}
          {notification.type === 'error' && '❌'}
          {notification.type === 'warning' && '⚠️'}
          {notification.type === 'info' && 'ℹ️'}
        </div>
        
        <div style={{ flex: 1 }}>
          <div style={{
            fontWeight: '600',
            marginBottom: '4px',
            color: '#333'
          }}>
            {notification.title}
          </div>
          <div style={{ color: '#666', fontSize: '14px' }}>
            {notification.message}
          </div>
        </div>
        
        <button
          onClick={() => hideNotification(notification.id)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#999',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '0',
            flexShrink: 0
          }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
