import { useState, useEffect } from 'react';
import LoginDemo from './pages/LoginDemo';
import DirectorAdvanced from './pages/DirectorAdvanced';
import ParentDemo from './pages/ParentDemo';
import { CookieManager } from './utils/cookies';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем куки при загрузке
    const session = CookieManager.getSession();
    
    if (session) {
      setToken(session.email); // Используем email как токен
      setRole(session.role);
      setUserName(session.name);
      console.log('🍪 Автоматический вход из куки:', session.email);
    } else {
      // Fallback на localStorage для совместимости
      const savedToken = localStorage.getItem('auth_token');
      const savedRole = localStorage.getItem('user_role');
      const savedName = localStorage.getItem('user_name');
      
      if (savedToken && savedRole) {
        setToken(savedToken);
        setRole(savedRole);
        setUserName(savedName || 'Пользователь');
      }
    }
    setLoading(false);
  }, []);

  function handleLogin(token: string, role: string, name: string = 'Пользователь') {
    setToken(token);
    setRole(role);
    setUserName(name);
    
    // Сохраняем в куки
    CookieManager.setSession({
      email: token,
      role: role,
      name: name
    });
    
    // Также сохраняем в localStorage для совместимости
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_role', role);
    localStorage.setItem('user_name', name);
  }

  function handleLogout() {
    setToken(null);
    setRole(null);
    setUserName(null);
    
    // Очищаем куки
    CookieManager.clearSession();
    
    // Очищаем localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Загрузка системы школьного питания...</p>
      </div>
    );
  }

  if (!token) {
    return <LoginDemo onLogin={handleLogin} />;
  }

  return (
    <div className="fade-in">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              🍎 Система школьного питания
            </div>
            <div className="user-info">
              <span className={`role-badge ${role === 'DIRECTOR' ? 'role-director' : 'role-parent'}`}>
                {role === 'DIRECTOR' ? '👨‍💼 Директор' : '👨‍👩‍👧‍👦 Родитель/Ученик'}
              </span>
              <button onClick={handleLogout} className="btn btn-danger btn-sm">
                Выйти
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="container" style={{ paddingTop: '24px', paddingBottom: '24px' }}>
        {role === 'DIRECTOR' && <DirectorAdvanced token={token} />}
        {role === 'PARENT' && <ParentDemo token={token} />}
      </main>
    </div>
  );
}

export default App;
