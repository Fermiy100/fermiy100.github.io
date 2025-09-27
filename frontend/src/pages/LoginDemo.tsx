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
    'director@school.com': { password: 'password123', role: 'DIRECTOR', name: 'Директор школы' },
    'parent@school.com': { password: 'password123', role: 'PARENT', name: 'Родитель/Ученик' }
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
      background: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <div className="text-center mb-6">
            <div className="logo" style={{ fontSize: '32px', marginBottom: '8px' }}>
              🍎 Система школьного питания
            </div>
            <p className="text-muted" style={{ marginBottom: '20px' }}>
              Мощная платформа для управления питанием в 500+ школах
            </p>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr', 
              gap: '8px', 
              fontSize: '14px',
              color: '#666'
            }}>
              <div>👨‍💼 Панель директора</div>
              <div>👨‍👩‍👧‍👦 Выбор еды</div>
              <div>📊 Аналитика</div>
              <div>🔒 Безопасность</div>
            </div>
          </div>

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                type="email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Введите email"
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Пароль</label>
              <input
                type="password"
                className="input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
              />
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', marginBottom: '20px' }}
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Вход...
                </>
              ) : (
                'Войти'
              )}
            </button>
          </form>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
            <p className="text-center text-muted mb-4">
              Быстрый вход для тестирования:
            </p>
            
            <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <button
                onClick={() => quickLogin('director@school.test')}
                className="btn btn-secondary btn-sm"
              >
                👨‍💼 Директор
              </button>
              
              <button
                onClick={() => quickLogin('parent@school.test')}
                className="btn btn-secondary btn-sm"
              >
                👨‍👩‍👧‍👦 Родитель
              </button>
            </div>
          </div>

          <div className="alert alert-info mt-4">
            <div className="text-center">
              <strong>🔑 Тестовые аккаунты:</strong>
              <div className="text-muted" style={{ fontSize: '12px', marginTop: '4px' }}>
                <div>Директор: director@school.test</div>
                <div>Родитель: parent@school.test</div>
                <div>Пароль: P@ssw0rd1!</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
