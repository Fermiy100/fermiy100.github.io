import { useState } from 'react';
import LoginDemo from './pages/LoginDemo';
import DirectorAdvanced from './pages/DirectorAdvanced';
import ParentDemo from './pages/ParentDemo';
import './App.css';

function App() {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);

  function handleLogin(token: string, role: string) {
    setToken(token);
    setRole(role);
  }

  function handleLogout() {
    setToken(null);
    setRole(null);
    // Очищаем токен из localStorage
    localStorage.removeItem('token');
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
              Школьное питание
            </div>
            <div className="user-info">
              <span className={`role-badge ${role === 'DIRECTOR' ? 'role-director' : 'role-parent'}`}>
                {role === 'DIRECTOR' ? 'Директор' : 'Родитель/Ученик'}
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
