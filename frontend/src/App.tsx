import { useState, useEffect } from 'react';
import LoginDemo from './pages/LoginDemo';
import DirectorAdvanced from './pages/DirectorAdvanced';
import ParentDemo from './pages/ParentDemo';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Проверяем сохраненный токен при загрузке
    const savedToken = localStorage.getItem('auth_token');
    const savedRole = localStorage.getItem('user_role');
    
    if (savedToken && savedRole) {
      setToken(savedToken);
      setRole(savedRole);
    }
    setLoading(false);
  }, []);

  function handleLogin(token: string, role: string) {
    setToken(token);
    setRole(role);
    localStorage.setItem('auth_token', token);
    localStorage.setItem('user_role', role);
  }

  function handleLogout() {
    setToken(null);
    setRole(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
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
