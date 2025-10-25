import React, { useState, useEffect } from 'react';
import { useMobile } from './MobileOptimized';

interface TestResult {
  name: string;
  status: 'pending' | 'running' | 'passed' | 'failed';
  message: string;
  duration?: number;
}

export default function TestingSuite() {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [overallStatus, setOverallStatus] = useState<'idle' | 'running' | 'passed' | 'failed'>('idle');
  const isMobile = useMobile();

  const testDefinitions = [
    {
      name: 'API Health Check',
      test: async () => {
        const response = await fetch('/api/health.php');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.status !== 'OK') throw new Error('API не отвечает');
        return 'API работает корректно';
      }
    },
    {
      name: 'Авторизация директора',
      test: async () => {
        const response = await fetch('/api/auth/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'director@school.test',
            password: 'password123'
          })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error('Ошибка авторизации');
        return `Директор авторизован: ${data.user.name}`;
      }
    },
    {
      name: 'Авторизация родителя',
      test: async () => {
        const response = await fetch('/api/auth/login.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'parent@school.test',
            password: 'password123'
          })
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data.success) throw new Error('Ошибка авторизации');
        return `Родитель авторизован: ${data.user.name}`;
      }
    },
    {
      name: 'Список пользователей',
      test: async () => {
        const response = await fetch('/api/users.php');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Некорректный формат данных');
        return `Найдено пользователей: ${data.length}`;
      }
    },
    {
      name: 'Загрузка меню',
      test: async () => {
        const response = await fetch('/api/menu.php');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Некорректный формат данных');
        return `Загружено блюд: ${data.length}`;
      }
    },
    {
      name: 'Список заказов',
      test: async () => {
        const response = await fetch('/api/orders.php');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!Array.isArray(data)) throw new Error('Некорректный формат данных');
        return `Найдено заказов: ${data.length}`;
      }
    },
    {
      name: 'Мобильная адаптивность',
      test: async () => {
        const isMobile = window.innerWidth <= 768;
        const hasResponsiveElements = document.querySelectorAll('[style*="flexDirection"]').length > 0;
        if (!hasResponsiveElements) throw new Error('Отсутствуют адаптивные элементы');
        return `Мобильная адаптивность: ${isMobile ? 'активна' : 'десктоп'}`;
      }
    },
    {
      name: 'Производительность загрузки',
      test: async () => {
        const startTime = performance.now();
        await fetch('/api/health.php');
        const endTime = performance.now();
        const duration = endTime - startTime;
        if (duration > 5000) throw new Error(`Медленная загрузка: ${duration.toFixed(0)}ms`);
        return `Время ответа: ${duration.toFixed(0)}ms`;
      }
    }
  ];

  const runTests = async () => {
    setIsRunning(true);
    setOverallStatus('running');
    
    const testResults: TestResult[] = testDefinitions.map(test => ({
      name: test.name,
      status: 'pending',
      message: 'Ожидает выполнения'
    }));
    
    setTests(testResults);

    let passedTests = 0;
    let failedTests = 0;

    for (let i = 0; i < testDefinitions.length; i++) {
      const test = testDefinitions[i];
      const startTime = performance.now();
      
      // Обновляем статус на "выполняется"
      setTests(prev => prev.map((t, index) => 
        index === i ? { ...t, status: 'running', message: 'Выполняется...' } : t
      ));

      try {
        const result = await test.test();
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        setTests(prev => prev.map((t, index) => 
          index === i ? { 
            ...t, 
            status: 'passed', 
            message: result,
            duration: Math.round(duration)
          } : t
        ));
        
        passedTests++;
      } catch (error: any) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        setTests(prev => prev.map((t, index) => 
          index === i ? { 
            ...t, 
            status: 'failed', 
            message: error.message,
            duration: Math.round(duration)
          } : t
        ));
        
        failedTests++;
      }
    }

    setOverallStatus(failedTests === 0 ? 'passed' : 'failed');
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'running': return '🔄';
      case 'passed': return '✅';
      case 'failed': return '❌';
      default: return '❓';
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pending': return '#6c757d';
      case 'running': return '#007bff';
      case 'passed': return '#28a745';
      case 'failed': return '#dc3545';
      default: return '#6c757d';
    }
  };

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: isMobile ? '10px' : '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        textAlign: 'center',
        marginBottom: '30px'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          margin: '0 0 10px 0',
          color: '#333'
        }}>
          🧪 Тестирование системы
        </h1>
        <p style={{ color: '#666', margin: 0 }}>
          Комплексная проверка всех компонентов
        </p>
      </div>

      {/* Общий статус */}
      <div style={{
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        background: overallStatus === 'passed' ? '#d4edda' : 
                   overallStatus === 'failed' ? '#f8d7da' : 
                   overallStatus === 'running' ? '#d1ecf1' : '#e9ecef',
        border: `1px solid ${
          overallStatus === 'passed' ? '#c3e6cb' : 
          overallStatus === 'failed' ? '#f5c6cb' : 
          overallStatus === 'running' ? '#bee5eb' : '#dee2e6'
        }`,
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '2rem', marginBottom: '10px' }}>
          {overallStatus === 'passed' ? '✅' : 
           overallStatus === 'failed' ? '❌' : 
           overallStatus === 'running' ? '🔄' : '⏳'}
        </div>
        <h3 style={{
          margin: '0 0 10px 0',
          color: overallStatus === 'passed' ? '#155724' : 
                 overallStatus === 'failed' ? '#721c24' : 
                 overallStatus === 'running' ? '#0c5460' : '#495057'
        }}>
          {overallStatus === 'passed' ? 'Все тесты пройдены!' : 
           overallStatus === 'failed' ? 'Обнаружены ошибки' : 
           overallStatus === 'running' ? 'Выполняется тестирование...' : 'Готов к тестированию'}
        </h3>
        <p style={{
          margin: 0,
          color: overallStatus === 'passed' ? '#155724' : 
                 overallStatus === 'failed' ? '#721c24' : 
                 overallStatus === 'running' ? '#0c5460' : '#495057'
        }}>
          {overallStatus === 'passed' ? 'Система работает корректно' : 
           overallStatus === 'failed' ? 'Требуется исправление ошибок' : 
           overallStatus === 'running' ? 'Пожалуйста, подождите...' : 'Нажмите кнопку для запуска тестов'}
        </p>
      </div>

      {/* Кнопка запуска */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <button
          onClick={runTests}
          disabled={isRunning}
          style={{
            background: isRunning ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            padding: isMobile ? '15px 30px' : '12px 24px',
            borderRadius: '8px',
            cursor: isRunning ? 'not-allowed' : 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            fontWeight: '600',
            minWidth: isMobile ? '200px' : '150px',
            opacity: isRunning ? 0.6 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {isRunning ? '🔄 Выполняется...' : '🚀 Запустить тесты'}
        </button>
      </div>

      {/* Результаты тестов */}
      {tests.length > 0 && (
        <div>
          <h3 style={{
            margin: '0 0 20px 0',
            color: '#333',
            fontSize: isMobile ? '1.2rem' : '1.4rem'
          }}>
            📊 Результаты тестирования
          </h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {tests.map((test, index) => (
              <div
                key={index}
                style={{
                  padding: '15px',
                  borderRadius: '8px',
                  border: `1px solid ${getStatusColor(test.status)}`,
                  background: test.status === 'passed' ? '#d4edda' : 
                             test.status === 'failed' ? '#f8d7da' : 
                             test.status === 'running' ? '#d1ecf1' : '#f8f9fa',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '5px'
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <span style={{ fontSize: '1.2rem' }}>
                      {getStatusIcon(test.status)}
                    </span>
                    <span style={{
                      fontWeight: '600',
                      color: '#333'
                    }}>
                      {test.name}
                    </span>
                  </div>
                  
                  {test.duration && (
                    <span style={{
                      fontSize: '12px',
                      color: '#666',
                      background: '#e9ecef',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {test.duration}ms
                    </span>
                  )}
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: test.status === 'failed' ? '#721c24' : '#666',
                  marginLeft: '30px'
                }}>
                  {test.message}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Статистика */}
      {tests.length > 0 && (
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #e5e7eb'
        }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#333' }}>📈 Статистика</h4>
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#28a745' }}>
                {tests.filter(t => t.status === 'passed').length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Пройдено</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#dc3545' }}>
                {tests.filter(t => t.status === 'failed').length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Провалено</div>
            </div>
            <div>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#007bff' }}>
                {tests.length}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>Всего</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
