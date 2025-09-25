import { useState } from 'react';
import { apiClient, tokenUtils } from '../utils/api';

interface LoginDemoProps {
  onLogin: (token: string, role: string) => void;
}

export default function LoginDemo({ onLogin }: LoginDemoProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Тестовые аккаунты
  const testAccounts = {
    'director@school.test': { password: 'P@ssw0rd1!', role: 'DIRECTOR', name: 'Директор школы' },
    'parent@school.test': { password: 'P@ssw0rd1!', role: 'PARENT', name: 'Родитель/Ученик' }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { user, token } = await apiClient.login(email, password);
      tokenUtils.setToken(token);
      onLogin(token, user.role);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = (email: string) => {
    const account = testAccounts[email as keyof typeof testAccounts];
    if (account) {
      setEmail(email);
      setPassword(account.password);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            margin: '0 0 10px 0',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🍽️ Школьное питание
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Войдите в свой аккаунт
          </p>
        </div>

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151'
            }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Введите email"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600',
              color: '#374151'
            }}>
              Пароль
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              required
              style={{
                width: '100%',
                padding: '12px',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '16px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: '12px',
              borderRadius: '8px',
              backgroundColor: '#fee2e2',
              color: '#991b1b',
              fontSize: '14px',
              marginBottom: '20px'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '12px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginBottom: '20px'
            }}
          >
            {loading ? '⏳ Вход...' : '🔑 Войти'}
          </button>
        </form>

        <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
          <p style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            fontSize: '14px',
            margin: '0 0 15px 0'
          }}>
            Быстрый вход для тестирования:
          </p>
          
          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <button
              onClick={() => quickLogin('director@school.test')}
              style={{
                width: '100%',
                background: '#1f2937',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              👨‍💼 Директор школы
            </button>
            
            <button
              onClick={() => quickLogin('parent@school.test')}
              style={{
                width: '100%',
                background: '#059669',
                color: 'white',
                padding: '10px',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              👨‍👩‍👧‍👦 Родитель/Ученик
            </button>
          </div>
        </div>

        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f0f9ff',
          borderRadius: '8px',
          border: '1px solid #0ea5e9'
        }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1e40af', fontSize: '14px' }}>
            🔑 Тестовые аккаунты:
          </h4>
          <div style={{ fontSize: '12px', color: '#1e40af' }}>
            <div><strong>Директор:</strong> director@school.test / P@ssw0rd1!</div>
            <div><strong>Родитель:</strong> parent@school.test / P@ssw0rd1!</div>
          </div>
        </div>
      </div>
    </div>
  );
}
