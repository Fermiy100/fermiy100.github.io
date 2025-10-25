import React, { useState, useEffect, useCallback } from 'react';
import { useMobile } from './MobileOptimized';

interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkRequests: number;
  errors: number;
  userInteractions: number;
}

interface PerformanceMonitorProps {
  children: React.ReactNode;
  enableMonitoring?: boolean;
  showMetrics?: boolean;
}

export default function PerformanceMonitor({ 
  children, 
  enableMonitoring = true, 
  showMetrics = false 
}: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    renderTime: 0,
    memoryUsage: 0,
    networkRequests: 0,
    errors: 0,
    userInteractions: 0
  });
  const [isVisible, setIsVisible] = useState(showMetrics);
  const isMobile = useMobile();

  // Измерение времени загрузки
  useEffect(() => {
    if (!enableMonitoring) return;

    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, loadTime }));
    };

    if (document.readyState === 'complete') {
      handleLoad();
    } else {
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [enableMonitoring]);

  // Измерение времени рендера
  useEffect(() => {
    if (!enableMonitoring) return;

    const startTime = performance.now();
    
    const handleRender = () => {
      const renderTime = performance.now() - startTime;
      setMetrics(prev => ({ ...prev, renderTime }));
    };

    const timeoutId = setTimeout(handleRender, 0);
    return () => clearTimeout(timeoutId);
  }, [enableMonitoring]);

  // Мониторинг памяти
  useEffect(() => {
    if (!enableMonitoring) return;

    const updateMemoryUsage = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        setMetrics(prev => ({ ...prev, memoryUsage }));
      }
    };

    updateMemoryUsage();
    const intervalId = setInterval(updateMemoryUsage, 5000);
    return () => clearInterval(intervalId);
  }, [enableMonitoring]);

  // Мониторинг сетевых запросов
  useEffect(() => {
    if (!enableMonitoring) return;

    let requestCount = 0;

    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      requestCount++;
      setMetrics(prev => ({ ...prev, networkRequests: requestCount }));
      return originalFetch(...args);
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [enableMonitoring]);

  // Мониторинг ошибок
  useEffect(() => {
    if (!enableMonitoring) return;

    let errorCount = 0;

    const handleError = (event: ErrorEvent) => {
      errorCount++;
      setMetrics(prev => ({ ...prev, errors: errorCount }));
      console.error('Performance Monitor - Error detected:', event.error);
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      errorCount++;
      setMetrics(prev => ({ ...prev, errors: errorCount }));
      console.error('Performance Monitor - Unhandled promise rejection:', event.reason);
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [enableMonitoring]);

  // Мониторинг взаимодействий пользователя
  const handleUserInteraction = useCallback(() => {
    if (!enableMonitoring) return;
    
    setMetrics(prev => ({ ...prev, userInteractions: prev.userInteractions + 1 }));
  }, [enableMonitoring]);

  useEffect(() => {
    if (!enableMonitoring) return;

    const events = ['click', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleUserInteraction, { passive: true });
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleUserInteraction);
      });
    };
  }, [handleUserInteraction, enableMonitoring]);

  // Оптимизация производительности
  const optimizePerformance = useCallback(() => {
    // Очистка неиспользуемых ресурсов
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory.usedJSHeapSize > 50 * 1024 * 1024) { // 50MB
        console.warn('High memory usage detected, consider optimization');
      }
    }

    // Предзагрузка критических ресурсов
    const criticalResources = [
      '/api/health.php',
      '/api/menu.php'
    ];

    criticalResources.forEach(resource => {
      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = resource;
      document.head.appendChild(link);
    });
  }, []);

  useEffect(() => {
    if (enableMonitoring) {
      optimizePerformance();
    }
  }, [enableMonitoring, optimizePerformance]);

  const getPerformanceScore = () => {
    let score = 100;
    
    // Штрафы за плохую производительность
    if (metrics.loadTime > 3000) score -= 20;
    if (metrics.renderTime > 100) score -= 15;
    if (metrics.memoryUsage > 100) score -= 25;
    if (metrics.errors > 0) score -= 30;
    if (metrics.networkRequests > 50) score -= 10;
    
    return Math.max(0, score);
  };

  const performanceScore = getPerformanceScore();
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#28a745';
    if (score >= 60) return '#ffc107';
    return '#dc3545';
  };

  return (
    <>
      {children}
      
      {isVisible && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: 'rgba(0, 0, 0, 0.9)',
          color: 'white',
          padding: isMobile ? '15px' : '20px',
          borderRadius: '10px',
          fontSize: isMobile ? '12px' : '14px',
          fontFamily: 'monospace',
          zIndex: 10000,
          maxWidth: isMobile ? '280px' : '350px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '15px'
          }}>
            <h3 style={{ margin: 0, fontSize: isMobile ? '14px' : '16px' }}>
              📊 Performance Monitor
            </h3>
            <button
              onClick={() => setIsVisible(false)}
              style={{
                background: 'none',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                fontSize: '18px',
                padding: '0',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px'
            }}>
              <span>Performance Score:</span>
              <span style={{ 
                color: getScoreColor(performanceScore),
                fontWeight: 'bold'
              }}>
                {performanceScore}/100
              </span>
            </div>
            <div style={{
              width: '100%',
              height: '8px',
              background: '#333',
              borderRadius: '4px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${performanceScore}%`,
                height: '100%',
                background: getScoreColor(performanceScore),
                transition: 'width 0.3s ease'
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Load Time:</span>
              <span style={{ color: metrics.loadTime > 3000 ? '#dc3545' : '#28a745' }}>
                {metrics.loadTime.toFixed(0)}ms
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Render Time:</span>
              <span style={{ color: metrics.renderTime > 100 ? '#dc3545' : '#28a745' }}>
                {metrics.renderTime.toFixed(0)}ms
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Memory:</span>
              <span style={{ color: metrics.memoryUsage > 100 ? '#dc3545' : '#28a745' }}>
                {metrics.memoryUsage.toFixed(1)}MB
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Network:</span>
              <span style={{ color: metrics.networkRequests > 50 ? '#ffc107' : '#28a745' }}>
                {metrics.networkRequests} requests
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Errors:</span>
              <span style={{ color: metrics.errors > 0 ? '#dc3545' : '#28a745' }}>
                {metrics.errors}
              </span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Interactions:</span>
              <span style={{ color: '#007bff' }}>
                {metrics.userInteractions}
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '15px',
            padding: '10px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '5px',
            fontSize: '11px'
          }}>
            <div style={{ marginBottom: '5px', fontWeight: 'bold' }}>💡 Tips:</div>
            {performanceScore < 60 && (
              <div>• Consider optimizing images and scripts</div>
            )}
            {metrics.memoryUsage > 100 && (
              <div>• High memory usage detected</div>
            )}
            {metrics.errors > 0 && (
              <div>• JavaScript errors detected</div>
            )}
            {performanceScore >= 80 && (
              <div>• Great performance! 🚀</div>
            )}
          </div>
        </div>
      )}

      {/* Кнопка для показа метрик (только в development) */}
      {process.env.NODE_ENV === 'development' && !isVisible && (
        <button
          onClick={() => setIsVisible(true)}
          style={{
            position: 'fixed',
            bottom: '20px',
            right: '20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            cursor: 'pointer',
            fontSize: '20px',
            zIndex: 10000,
            boxShadow: '0 4px 15px rgba(0,123,255,0.3)',
            transition: 'all 0.3s ease'
          }}
          title="Show Performance Monitor"
        >
          📊
        </button>
      )}
    </>
  );
}
