import React, { useState } from 'react';
import { apiClient, User } from '../utils/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

interface RegisterData {
  login: string;
  fullName: string;
  password: string;
  confirmPassword: string;
}

export default function ModernLogin({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState<RegisterData>({
    login: '',
    fullName: '',
    password: '',
    confirmPassword: ''
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const user = await apiClient.login(email, password);
      onLogin(user);
    } catch (error: any) {
      setError(error.message || 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!registerData.login || !registerData.fullName || !registerData.password) {
      setError('Заполните все поля');
      return;
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }
    
    if (registerData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    if (registerData.login.length < 3) {
      setError('Логин должен содержать минимум 3 символа');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Создаем email из логина для совместимости с API
      const email = `${registerData.login}@school.local`;
      
      const user = await apiClient.createUser({
        name: registerData.fullName,
        email: email,
        password: registerData.password,
        role: 'PARENT' // Только родители могут регистрироваться
      });
      
      // Автоматически входим после регистрации
      const loginUser = await apiClient.login(email, registerData.password);
      onLogin(loginUser);
    } catch (error: any) {
      setError(error.message || 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🍽️</div>
          <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>
            Школьное питание
          </h1>
          <p style={{ color: '#666', margin: '10px 0 0 0' }}>
            Система заказа школьного питания
          </p>
        </div>

        {!showRegister ? (
          // Форма входа
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                📧 Email или логин:
              </label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Введите email или логин"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                🔒 Пароль:
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Введите пароль"
              />
            </div>

            {error && (
              <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#6c757d' : '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginBottom: '20px'
              }}
            >
              {loading ? '⏳ Вход...' : '🚪 Войти'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowRegister(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '1rem'
                }}
              >
                📝 Создать аккаунт
              </button>
            </div>
          </form>
        ) : (
          // Форма регистрации (как в Яндекс.Учебнике/Учи.ру)
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                👤 Логин:
              </label>
              <input
                type="text"
                value={registerData.login}
                onChange={(e) => setRegisterData({...registerData, login: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Придумайте логин (минимум 3 символа)"
              />
              <small style={{ color: '#666', fontSize: '0.8rem' }}>
                Логин будет использоваться для входа в систему
              </small>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                📝 ФИО:
              </label>
              <input
                type="text"
                value={registerData.fullName}
                onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Введите фамилию, имя, отчество"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                🔒 Пароль:
              </label>
              <input
                type="password"
                value={registerData.password}
                onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Минимум 6 символов"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>
                🔒 Подтвердите пароль:
              </label>
              <input
                type="password"
                value={registerData.confirmPassword}
                onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #ddd',
                  borderRadius: '8px',
                  fontSize: '1rem',
                  boxSizing: 'border-box'
                }}
                placeholder="Повторите пароль"
              />
            </div>

            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              background: '#e3f2fd', 
              borderRadius: '8px',
              border: '1px solid #bbdefb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '5px' }}>
                <span style={{ fontSize: '1.2rem', marginRight: '8px' }}>👨‍👩‍👧‍👦</span>
                <strong style={{ color: '#1976d2' }}>Категория: Родитель</strong>
              </div>
              <small style={{ color: '#666' }}>
                Родители могут заказывать питание для своих детей
              </small>
            </div>

            {error && (
              <div style={{
                background: '#f8d7da',
                color: '#721c24',
                padding: '10px',
                borderRadius: '5px',
                marginBottom: '20px',
                border: '1px solid #f5c6cb'
              }}>
                ❌ {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#6c757d' : '#28a745',
                color: 'white',
                border: 'none',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '1.1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                marginBottom: '20px'
              }}
            >
              {loading ? '⏳ Создание аккаунта...' : '📝 Создать аккаунт'}
            </button>

            <div style={{ textAlign: 'center' }}>
              <button
                type="button"
                onClick={() => setShowRegister(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#007bff',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  fontSize: '1rem'
                }}
              >
                🚪 Уже есть аккаунт? Войти
              </button>
            </div>
          </form>
        )}

        {/* Демо аккаунты */}
        <div style={{
          marginTop: '30px',
          padding: '20px',
          background: '#f8f9fa',
          borderRadius: '10px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333', fontSize: '1.1rem' }}>
            🎭 Демо аккаунты:
          </h3>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Директор:</strong> director@school.test / password123
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>Родитель:</strong> parent@school.test / password123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
