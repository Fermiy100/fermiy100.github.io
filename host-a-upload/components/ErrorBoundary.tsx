import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useMobile } from './MobileOptimized';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} errorInfo={this.state.errorInfo} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error?: Error;
  errorInfo?: ErrorInfo;
}

function ErrorFallback({ error, errorInfo }: ErrorFallbackProps) {
  const isMobile = useMobile();

  const handleReload = () => {
    window.location.reload();
  };

  const handleReport = () => {
    const errorReport = {
      error: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    console.error('Error Report:', errorReport);
    
    // В реальном приложении здесь можно отправить отчет на сервер
    alert('Отчет об ошибке отправлен разработчикам');
  };

  return (
    <div style={{
      padding: isMobile ? '20px 10px' : '40px',
      maxWidth: '600px',
      margin: '0 auto',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      textAlign: 'center',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{ fontSize: '4rem', marginBottom: '20px' }}>⚠️</div>
      
      <h1 style={{
        fontSize: isMobile ? '1.5rem' : '2rem',
        margin: '0 0 15px 0',
        color: '#dc3545'
      }}>
        Произошла ошибка
      </h1>
      
      <p style={{
        color: '#666',
        margin: '0 0 25px 0',
        fontSize: isMobile ? '14px' : '16px',
        lineHeight: 1.5
      }}>
        К сожалению, что-то пошло не так. Мы уже работаем над исправлением этой проблемы.
      </p>

      {process.env.NODE_ENV === 'development' && error && (
        <details style={{
          margin: '20px 0',
          padding: '15px',
          background: '#f8f9fa',
          borderRadius: '8px',
          textAlign: 'left',
          fontSize: '12px',
          fontFamily: 'monospace'
        }}>
          <summary style={{ cursor: 'pointer', fontWeight: 'bold', marginBottom: '10px' }}>
            Детали ошибки (только для разработчиков)
          </summary>
          <div style={{ marginBottom: '10px' }}>
            <strong>Ошибка:</strong> {error.message}
          </div>
          <div style={{ marginBottom: '10px' }}>
            <strong>Стек:</strong>
            <pre style={{ 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              margin: '5px 0 0 0',
              fontSize: '11px'
            }}>
              {error.stack}
            </pre>
          </div>
          {errorInfo && (
            <div>
              <strong>Component Stack:</strong>
              <pre style={{ 
                whiteSpace: 'pre-wrap', 
                wordBreak: 'break-word',
                margin: '5px 0 0 0',
                fontSize: '11px'
              }}>
                {errorInfo.componentStack}
              </pre>
            </div>
          )}
        </details>
      )}

      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: '15px',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button
          onClick={handleReload}
          style={{
            background: '#007bff',
            color: 'white',
            border: 'none',
            padding: isMobile ? '15px 25px' : '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: '600',
            minWidth: isMobile ? '200px' : '150px',
            transition: 'all 0.3s ease'
          }}
        >
          🔄 Перезагрузить страницу
        </button>

        <button
          onClick={handleReport}
          style={{
            background: '#6c757d',
            color: 'white',
            border: 'none',
            padding: isMobile ? '15px 25px' : '12px 24px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: '600',
            minWidth: isMobile ? '200px' : '150px',
            transition: 'all 0.3s ease'
          }}
        >
          📧 Сообщить об ошибке
        </button>
      </div>

      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#e9ecef',
        borderRadius: '10px',
        fontSize: '14px',
        color: '#666'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>💡 Что можно сделать:</h3>
        <ul style={{ 
          margin: 0, 
          paddingLeft: '20px',
          textAlign: 'left'
        }}>
          <li>Попробуйте перезагрузить страницу</li>
          <li>Проверьте подключение к интернету</li>
          <li>Очистите кеш браузера</li>
          <li>Попробуйте другой браузер</li>
          <li>Если проблема повторяется, сообщите нам</li>
        </ul>
      </div>
    </div>
  );
}

export default ErrorBoundary;
