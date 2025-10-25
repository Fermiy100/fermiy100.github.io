import React, { useState, useEffect } from 'react';
import { User } from '../api';
import { useMobile, MobileButton, MobileForm, MobileInput } from './MobileOptimized';

interface ProfileSettingsProps {
  user: User;
  onLogout: () => void;
}

export default function ProfileSettings({ user, onLogout }: ProfileSettingsProps) {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      sms: false,
      push: true,
      orderUpdates: true,
      menuChanges: false
    },
    privacy: {
      showProfile: true,
      allowMessages: true,
      showOrders: false
    },
    preferences: {
      language: 'ru',
      theme: 'light',
      timezone: 'Europe/Moscow'
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const isMobile = useMobile();

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Здесь будет API для сохранения настроек
      setMessage('✅ Настройки успешно сохранены!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('❌ Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleResetSettings = () => {
    if (confirm('Вы уверены, что хотите сбросить все настройки?')) {
      setSettings({
        notifications: {
          email: true,
          sms: false,
          push: true,
          orderUpdates: true,
          menuChanges: false
        },
        privacy: {
          showProfile: true,
          allowMessages: true,
          showOrders: false
        },
        preferences: {
          language: 'ru',
          theme: 'light',
          timezone: 'Europe/Moscow'
        }
      });
      setMessage('✅ Настройки сброшены к значениям по умолчанию');
    }
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
        ⚙️ Настройки профиля
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

      <MobileForm onSubmit={handleSaveSettings}>
        {/* Настройки уведомлений */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔔 Уведомления</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>📧 Email уведомления</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Получать уведомления о заказах на email
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.email}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, email: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>📱 SMS уведомления</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Получать SMS о статусе заказов
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.sms}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, sms: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🔔 Push уведомления</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Получать уведомления в браузере
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.push}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, push: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>📦 Обновления заказов</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Уведомления об изменении статуса заказов
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.orderUpdates}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, orderUpdates: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>🍽️ Изменения меню</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Уведомления о новых блюдах в меню
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.notifications.menuChanges}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, menuChanges: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
          </div>
        </div>

        {/* Настройки приватности */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🔒 Приватность</h3>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '15px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>👤 Показывать профиль</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Разрешить другим пользователям видеть ваш профиль
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showProfile}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, showProfile: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>💬 Разрешить сообщения</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Позволить другим пользователям отправлять вам сообщения
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.allowMessages}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, allowMessages: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '15px',
              background: 'white',
              borderRadius: '8px',
              border: '1px solid #e5e7eb'
            }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>📋 Показывать заказы</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  Разрешить другим видеть ваши заказы
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.privacy.showOrders}
                onChange={(e) => setSettings({
                  ...settings,
                  privacy: { ...settings.privacy, showOrders: e.target.checked }
                })}
                style={{ transform: 'scale(1.2)' }}
              />
            </div>
          </div>
        </div>

        {/* Настройки интерфейса */}
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🎨 Интерфейс</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: '15px'
          }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Язык:
              </label>
              <select
                value={settings.preferences.language}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, language: e.target.value }
                })}
                style={{
                  width: '100%',
                  padding: isMobile ? '15px' : '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px',
                  minHeight: isMobile ? '44px' : 'auto',
                  boxSizing: 'border-box'
                }}
              >
                <option value="ru">Русский</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontWeight: '500',
                color: '#333'
              }}>
                Тема:
              </label>
              <select
                value={settings.preferences.theme}
                onChange={(e) => setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, theme: e.target.value }
                })}
                style={{
                  width: '100%',
                  padding: isMobile ? '15px' : '10px',
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontSize: isMobile ? '16px' : '14px',
                  minHeight: isMobile ? '44px' : 'auto',
                  boxSizing: 'border-box'
                }}
              >
                <option value="light">Светлая</option>
                <option value="dark">Темная</option>
                <option value="auto">Автоматически</option>
              </select>
            </div>
          </div>
        </div>

        {/* Кнопки управления */}
        <div style={{
          display: 'flex',
          gap: '10px',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between'
        }}>
          <MobileButton
            type="submit"
            disabled={loading}
            variant="primary"
            style={{ flex: 1 }}
          >
            {loading ? '⏳ Сохраняем...' : '💾 Сохранить настройки'}
          </MobileButton>
          
          <MobileButton
            onClick={handleResetSettings}
            variant="secondary"
            style={{ flex: 1 }}
          >
            🔄 Сбросить настройки
          </MobileButton>
        </div>
      </MobileForm>
    </div>
  );
}
