import React, { useEffect, useCallback } from 'react';
import { useMobile } from './MobileOptimized';

interface SecurityEnhancerProps {
  children: React.ReactNode;
  enableSecurityChecks?: boolean;
  enableCSP?: boolean;
  enableXSSProtection?: boolean;
  enableCSRFProtection?: boolean;
}

export default function SecurityEnhancer({
  children,
  enableSecurityChecks = true,
  enableCSP = true,
  enableXSSProtection = true,
  enableCSRFProtection = true
}: SecurityEnhancerProps) {
  const isMobile = useMobile();

  // Content Security Policy
  useEffect(() => {
    if (!enableCSP) return;

    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fermiy.ru",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' https://fermiy.ru https://fermiy100githubio-production.up.railway.app",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; ');

    // Создаем meta тег для CSP
    const meta = document.createElement('meta');
    meta.httpEquiv = 'Content-Security-Policy';
    meta.content = csp;
    document.head.appendChild(meta);

    return () => {
      const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingMeta) {
        existingMeta.remove();
      }
    };
  }, [enableCSP]);

  // XSS Protection
  useEffect(() => {
    if (!enableXSSProtection) return;

    // Добавляем заголовки безопасности
    const addSecurityHeaders = () => {
      // Эти заголовки обычно добавляются на сервере,
      // но мы можем добавить их через meta теги
      const headers = [
        { name: 'X-Content-Type-Options', value: 'nosniff' },
        { name: 'X-Frame-Options', value: 'DENY' },
        { name: 'X-XSS-Protection', value: '1; mode=block' },
        { name: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' }
      ];

      headers.forEach(header => {
        const meta = document.createElement('meta');
        meta.httpEquiv = header.name;
        meta.content = header.value;
        document.head.appendChild(meta);
      });
    };

    addSecurityHeaders();
  }, [enableXSSProtection]);

  // CSRF Protection
  useEffect(() => {
    if (!enableCSRFProtection) return;

    // Генерируем CSRF токен
    const generateCSRFToken = () => {
      const array = new Uint8Array(32);
      crypto.getRandomValues(array);
      return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    };

    const csrfToken = generateCSRFToken();
    localStorage.setItem('csrf-token', csrfToken);

    // Добавляем токен ко всем запросам
    const originalFetch = window.fetch;
    window.fetch = async (url, options = {}) => {
      const headers = new Headers(options.headers);
      headers.set('X-CSRF-Token', csrfToken);
      
      return originalFetch(url, {
        ...options,
        headers
      });
    };

    return () => {
      window.fetch = originalFetch;
    };
  }, [enableCSRFProtection]);

  // Валидация входных данных
  const sanitizeInput = useCallback((input: string): string => {
    return input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Удаляем script теги
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '') // Удаляем iframe теги
      .replace(/javascript:/gi, '') // Удаляем javascript: протоколы
      .replace(/on\w+\s*=/gi, '') // Удаляем event handlers
      .trim();
  }, []);

  // Защита от инъекций
  const validateInput = useCallback((input: string, type: 'email' | 'text' | 'number'): boolean => {
    switch (type) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) && input.length <= 254;
      
      case 'text':
        return input.length <= 1000 && !/<script|javascript:|on\w+/i.test(input);
      
      case 'number':
        return !isNaN(Number(input)) && Number(input) >= 0 && Number(input) <= 999999;
      
      default:
        return false;
    }
  }, []);

  // Мониторинг подозрительной активности
  useEffect(() => {
    if (!enableSecurityChecks) return;

    let suspiciousActivity = 0;
    const maxSuspiciousActivity = 10;

    const handleSuspiciousActivity = (event: Event) => {
      suspiciousActivity++;
      
      if (suspiciousActivity >= maxSuspiciousActivity) {
        console.warn('Suspicious activity detected, potential security threat');
        // В реальном приложении здесь можно отправить уведомление на сервер
        alert('Обнаружена подозрительная активность. Пожалуйста, перезагрузите страницу.');
        window.location.reload();
      }
    };

    // Мониторим подозрительные события
    const events = ['keydown', 'mousedown', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleSuspiciousActivity, { passive: true });
    });

    // Сброс счетчика каждые 5 минут
    const resetInterval = setInterval(() => {
      suspiciousActivity = 0;
    }, 5 * 60 * 1000);

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleSuspiciousActivity);
      });
      clearInterval(resetInterval);
    };
  }, [enableSecurityChecks]);

  // Защита от кликджекинга
  useEffect(() => {
    if (!enableSecurityChecks) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      
      // Проверяем, что клик не по скрытому элементу
      if (target.style.display === 'none' || target.style.visibility === 'hidden') {
        event.preventDefault();
        event.stopPropagation();
        console.warn('Clickjacking attempt detected');
      }
    };

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [enableSecurityChecks]);

  // Защита от кражи сессии
  useEffect(() => {
    if (!enableSecurityChecks) return;

    const checkSessionSecurity = () => {
      // Проверяем, что мы на правильном домене
      if (window.location.hostname !== 'fermiy.ru' && 
          window.location.hostname !== 'localhost' && 
          window.location.hostname !== '127.0.0.1') {
        console.warn('Potential session hijacking detected');
        return false;
      }

      // Проверяем, что токен не истек
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const now = Math.floor(Date.now() / 1000);
          if (payload.exp && payload.exp < now) {
            console.warn('Token expired, clearing session');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            return false;
          }
        } catch (error) {
          console.warn('Invalid token format');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          return false;
        }
      }

      return true;
    };

    const intervalId = setInterval(checkSessionSecurity, 30000); // Проверяем каждые 30 секунд
    return () => clearInterval(intervalId);
  }, [enableSecurityChecks]);

  // Логирование безопасности
  const logSecurityEvent = useCallback((event: string, details: any) => {
    const securityLog = {
      timestamp: new Date().toISOString(),
      event,
      details,
      userAgent: navigator.userAgent,
      url: window.location.href,
      referrer: document.referrer
    };

    console.log('Security Event:', securityLog);
    
    // В реальном приложении здесь можно отправить лог на сервер
  }, []);

  // Экспортируем функции безопасности для использования в компонентах
  React.useEffect(() => {
    (window as any).securityUtils = {
      sanitizeInput,
      validateInput,
      logSecurityEvent
    };

    return () => {
      delete (window as any).securityUtils;
    };
  }, [sanitizeInput, validateInput, logSecurityEvent]);

  return (
    <div style={{
      position: 'relative',
      width: '100%',
      minHeight: '100vh'
    }}>
      {children}
      
      {/* Индикатор безопасности (только в development) */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '10px' : '20px',
          left: isMobile ? '10px' : '20px',
          background: 'rgba(0, 123, 255, 0.9)',
          color: 'white',
          padding: isMobile ? '8px 12px' : '10px 15px',
          borderRadius: '20px',
          fontSize: isMobile ? '12px' : '14px',
          fontWeight: 'bold',
          zIndex: 10000,
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
          🔒 Security Enhanced
        </div>
      )}
    </div>
  );
}
