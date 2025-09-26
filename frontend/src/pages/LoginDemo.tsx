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
              Школьное питание
            </div>
            <p className="text-muted">
              Войдите в свой аккаунт
            </p>
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
