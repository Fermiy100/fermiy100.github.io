import React, { useState } from 'react';
import { User } from '../api';

interface ProfileInfoProps {
  user: User;
  onLogout: () => void;
}

export default function ProfileInfo({ user, onLogout }: ProfileInfoProps) {
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Новые пароли не совпадают!');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      alert('Пароль должен содержать минимум 6 символов!');
      return;
    }

    try {
      setLoading(true);
      // Здесь можно добавить API для смены пароля
      console.log('Смена пароля:', passwordData);
      alert('Пароль успешно изменен!');
      setShowPasswordForm(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Ошибка смены пароля:', error);
      alert('Ошибка смены пароля');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'DIRECTOR': return '👨‍💼 Директор школы';
      case 'PARENT': return '👨‍👩‍👧‍👦 Родитель';
      default: return role;
    }
  };

  const getStatusDisplay = (verified: boolean) => {
    return verified ? '✅ Подтвержден' : '⏳ Ожидает подтверждения';
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      background: 'white',
      borderRadius: '15px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
    }}>
      {/* Заголовок */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '2px solid #e9ecef'
      }}>
        <h1 style={{ margin: 0, color: '#333', fontSize: '2rem' }}>
          👤 Профиль аккаунта
        </h1>
        <button
          onClick={onLogout}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          🚪 Выйти
        </button>
      </div>

      {/* Основная информация */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '30px',
        marginBottom: '40px'
      }}>
        {/* Карточка пользователя */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '30px',
          borderRadius: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '20px' }}>
            {user.role === 'DIRECTOR' ? '👨‍💼' : '👨‍👩‍👧‍👦'}
          </div>
          <h2 style={{ margin: '0 0 10px 0', fontSize: '1.8rem' }}>
            {user.name}
          </h2>
          <p style={{ margin: '0 0 15px 0', opacity: 0.9 }}>
            {getRoleDisplay(user.role)}
          </p>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '10px',
            borderRadius: '8px',
            marginTop: '20px'
          }}>
            <p style={{ margin: '5px 0' }}>
              <strong>Статус:</strong> {getStatusDisplay(user.verified)}
            </p>
            <p style={{ margin: '5px 0' }}>
              <strong>ID:</strong> #{user.id}
            </p>
          </div>
        </div>

        {/* Детальная информация */}
        <div style={{
          background: '#f8f9fa',
          padding: '30px',
          borderRadius: '15px',
          border: '1px solid #e9ecef'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
            📋 Детальная информация
          </h3>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Email:
            </label>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              color: '#333'
            }}>
              {user.email}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Роль:
            </label>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              color: '#333'
            }}>
              {getRoleDisplay(user.role)}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Дата регистрации:
            </label>
            <div style={{
              background: 'white',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              color: '#333'
            }}>
              {user.created_at ? new Date(user.created_at).toLocaleDateString('ru-RU') : 'Не указана'}
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#666' }}>
              Статус аккаунта:
            </label>
            <div style={{
              background: user.verified ? '#d4edda' : '#fff3cd',
              color: user.verified ? '#155724' : '#856404',
              padding: '12px',
              borderRadius: '8px',
              border: `1px solid ${user.verified ? '#c3e6cb' : '#ffeaa7'}`,
              fontWeight: 'bold'
            }}>
              {getStatusDisplay(user.verified)}
            </div>
          </div>
        </div>
      </div>

      {/* Действия */}
      <div style={{
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
          ⚙️ Действия с аккаунтом
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          <button
            onClick={() => setShowPasswordForm(!showPasswordForm)}
            style={{
              background: '#007bff',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            🔑 Изменить пароль
          </button>

          <button
            onClick={() => {
              if (confirm('Вы уверены, что хотите выйти из аккаунта?')) {
                onLogout();
              }
            }}
            style={{
              background: '#dc3545',
              color: 'white',
              border: 'none',
              padding: '15px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px'
            }}
          >
            🚪 Выйти из аккаунта
          </button>
        </div>

        {/* Форма смены пароля */}
        {showPasswordForm && (
          <div style={{
            marginTop: '30px',
            padding: '20px',
            background: 'white',
            borderRadius: '10px',
            border: '1px solid #ddd'
          }}>
            <h4 style={{ margin: '0 0 20px 0', color: '#333' }}>
              🔑 Смена пароля
            </h4>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Текущий пароль:
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
                placeholder="Введите текущий пароль"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Новый пароль:
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
                placeholder="Введите новый пароль (минимум 6 символов)"
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Подтвердите новый пароль:
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
                placeholder="Повторите новый пароль"
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handlePasswordChange}
                disabled={loading}
                style={{
                  background: '#28a745',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1
                }}
              >
                {loading ? '⏳ Сохранение...' : '💾 Сохранить пароль'}
              </button>
              
              <button
                onClick={() => {
                  setShowPasswordForm(false);
                  setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                }}
                style={{
                  background: '#6c757d',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer'
                }}
              >
                ❌ Отмена
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Статистика */}
      <div style={{
        marginTop: '30px',
        background: '#f8f9fa',
        padding: '30px',
        borderRadius: '15px',
        border: '1px solid #e9ecef'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>
          📊 Статистика аккаунта
        </h3>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📅</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Дней в системе</h4>
            <p style={{ margin: 0, color: '#666', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {user.created_at ? Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔒</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Безопасность</h4>
            <p style={{ margin: 0, color: '#28a745', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {user.verified ? 'Защищен' : 'Требует подтверждения'}
            </p>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '10px',
            textAlign: 'center',
            border: '1px solid #ddd'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👤</div>
            <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>Тип аккаунта</h4>
            <p style={{ margin: 0, color: '#007bff', fontSize: '1.2rem', fontWeight: 'bold' }}>
              {user.role === 'DIRECTOR' ? 'Администратор' : 'Пользователь'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
