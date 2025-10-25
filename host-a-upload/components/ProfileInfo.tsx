import React, { useState, useEffect } from 'react';
import { User } from '../api';
import { useMobile, MobileButton, MobileForm, MobileInput } from './MobileOptimized';

interface ProfileInfoProps {
  user: User;
  onLogout: () => void;
}

export default function ProfileInfo({ user, onLogout }: ProfileInfoProps) {
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    address: '',
    role: user.role,
    school_id: user.school_id || null
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'notifications'>('profile');
  const isMobile = useMobile();

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Здесь будет API для обновления профиля
      setMessage('✅ Профиль успешно обновлен!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка при обновлении профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('✅ Пароль успешно изменен!');
  };

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '800px',
      margin: '0 auto',
      background: 'white',
      borderRadius: isMobile ? '10px' : '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        fontSize: isMobile ? '1.5rem' : '2rem',
        textAlign: 'center',
        marginBottom: isMobile ? '20px' : '30px',
        color: '#333'
      }}>
        👤 Профиль пользователя
      </h1>

      {message && (
        <div style={{
          background: message.includes('✅') ? '#d4edda' : '#f8d7da',
          color: message.includes('✅') ? '#155724' : '#721c24',
          padding: '15px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
        }}>
          {message}
        </div>
      )}

      {/* Навигация по вкладкам */}
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '10px' : '0',
        marginBottom: '30px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: isMobile ? '15px 20px' : '10px 20px',
            background: activeTab === 'profile' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'profile' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            minHeight: isMobile ? '44px' : 'auto',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          📝 Личные данные
        </button>
        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: isMobile ? '15px 20px' : '10px 20px',
            background: activeTab === 'security' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'security' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            minHeight: isMobile ? '44px' : 'auto',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          🔒 Безопасность
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          style={{
            padding: isMobile ? '15px 20px' : '10px 20px',
            background: activeTab === 'notifications' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'notifications' ? 'white' : '#333',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: isMobile ? '16px' : '14px',
            minHeight: isMobile ? '44px' : 'auto',
            width: isMobile ? '100%' : 'auto'
          }}
        >
          🔔 Уведомления
        </button>
      </div>

      {/* Вкладка личных данных */}
      {activeTab === 'profile' && (
        <MobileForm onSubmit={handleSaveProfile}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '20px' : '15px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Имя:
              </label>
              <MobileInput
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                placeholder="Введите ваше имя"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Email:
              </label>
              <MobileInput
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="Введите email"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Телефон:
              </label>
              <MobileInput
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="Введите номер телефона"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Адрес:
              </label>
              <textarea
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                placeholder="Введите адрес"
                style={{
                  width: '100%',
                  padding: isMobile ? '15px' : '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px',
                  minHeight: isMobile ? '100px' : '80px',
                  resize: 'vertical',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <MobileButton
                onClick={handleSaveProfile}
                disabled={loading}
                variant="primary"
                style={{ flex: 1 }}
              >
                {loading ? '⏳ Сохраняем...' : '💾 Сохранить изменения'}
              </MobileButton>
            </div>
          </div>
        </MobileForm>
      )}

      {/* Вкладка безопасности */}
      {activeTab === 'security' && (
        <MobileForm onSubmit={handleChangePassword}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: isMobile ? '20px' : '15px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Текущий пароль:
              </label>
              <MobileInput
                type="password"
                placeholder="Введите текущий пароль"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Новый пароль:
              </label>
              <MobileInput
                type="password"
                placeholder="Введите новый пароль"
              />
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Подтвердите пароль:
              </label>
              <MobileInput
                type="password"
                placeholder="Подтвердите новый пароль"
              />
            </div>

            <MobileButton
              onClick={handleChangePassword}
              variant="primary"
              style={{ width: '100%' }}
            >
              🔒 Изменить пароль
            </MobileButton>
          </div>
        </MobileForm>
      )}

      {/* Вкладка уведомлений */}
      {activeTab === 'notifications' && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: isMobile ? '20px' : '15px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>📧 Email уведомления</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Получать уведомления о заказах на email
              </p>
            </div>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>📱 SMS уведомления</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Получать SMS о статусе заказов
              </p>
            </div>
            <input type="checkbox" style={{ transform: 'scale(1.2)' }} />
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <div>
              <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🔔 Push уведомления</h4>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                Получать уведомления в браузере
              </p>
            </div>
            <input type="checkbox" defaultChecked style={{ transform: 'scale(1.2)' }} />
          </div>
        </div>
      )}

      {/* Кнопка выхода */}
      <div style={{
        marginTop: '30px',
        paddingTop: '20px',
        borderTop: '1px solid #e5e7eb',
        textAlign: 'center'
      }}>
        <MobileButton
          onClick={onLogout}
          variant="danger"
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          🚪 Выйти из аккаунта
        </MobileButton>
      </div>
    </div>
  );
}