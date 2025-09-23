import { useState } from 'react';
import Login from './pages/Login';
import Director from './pages/Director';
import Parent from './pages/Parent';
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
  }

  if (!token) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div>
      <div style={{ padding: '12px 20px', background: '#f9fafb', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Школьное питание</strong> — {role === 'DIRECTOR' ? 'Директор' : role === 'PARENT' ? 'Родитель' : role}
        </div>
        <button onClick={handleLogout} style={{ background: '#ef4444', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
          Выйти
        </button>
      </div>
      
      {role === 'DIRECTOR' && <Director token={token} />}
      {role === 'PARENT' && <Parent token={token} />}
    </div>
  );
}

export default App;
