import React, { useState, useEffect } from 'react';
import ModernLogin from './pages/ModernLogin';
import DirectorAdvanced from './pages/DirectorAdvanced';
import PersonalCabinet from './components/PersonalCabinet';
import ParentMenuSelector from './components/ParentMenuSelector';
import { User } from './api';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'login' | 'director' | 'parent' | 'profile'>('login');

  useEffect(() => {
    // Проверяем сохраненную сессию
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setActiveView(userData.role === 'DIRECTOR' ? 'director' : 'parent');
      } catch (error) {
        console.error('Ошибка парсинга сохраненного пользователя:', error);
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    const user = userData.user || userData;
    setUser(user);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', userData.token || 'demo-token');
    setActiveView(user.role === 'DIRECTOR' ? 'director' : 'parent');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    setActiveView('login');
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}>
        <div style={{
          textAlign: 'center',
          color: 'white'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '1.2rem' }}>Загрузка приложения...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <ModernLogin onLogin={handleLogin} />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      {/* Навигационная панель */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 20px auto',
        background: 'white',
        borderRadius: '15px',
        padding: '15px 20px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <h1 style={{ margin: 0, color: '#333', fontSize: '1.5rem' }}>
            🍽️ Школьное питание
          </h1>
          
          {user.role === 'DIRECTOR' ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveView('director')}
                style={{
                  background: activeView === 'director' ? '#007bff' : '#f8f9fa',
                  color: activeView === 'director' ? 'white' : '#333',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                👨‍💼 Панель директора
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setActiveView('parent')}
                style={{
                  background: activeView === 'parent' ? '#007bff' : '#f8f9fa',
                  color: activeView === 'parent' ? 'white' : '#333',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                🍽️ Заказ питания
              </button>
              <button
                onClick={() => setActiveView('profile')}
                style={{
                  background: activeView === 'profile' ? '#007bff' : '#f8f9fa',
                  color: activeView === 'profile' ? 'white' : '#333',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                👤 Личный кабинет
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ color: '#666' }}>
            👋 Привет, {user.name}!
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            🚪 Выйти
          </button>
        </div>
      </div>

      {/* Основной контент */}
      <div>
        {activeView === 'director' && user.role === 'DIRECTOR' && (
          <DirectorAdvanced token={localStorage.getItem('token')} />
        )}
        
        {activeView === 'parent' && user.role === 'PARENT' && (
          <ParentMenuSelector user={user} />
        )}
        
        {activeView === 'profile' && (
          <PersonalCabinet
            user={user}
            onLogout={handleLogout}
          />
        )}
      </div>
    </div>
  );
}

export default App;
