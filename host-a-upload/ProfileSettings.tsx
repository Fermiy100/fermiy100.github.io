import { useState, useEffect } from 'react';
import { apiClient, User } from './api';

interface ProfileSettingsProps {
  currentUser: User;
  onProfileUpdated?: (user: User) => void;
}

export default function ProfileSettings({ currentUser, onProfileUpdated }: ProfileSettingsProps) {
  const [formData, setFormData] = useState({
    name: currentUser.name,
    email: currentUser.email,
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showPasswordFields) {
      if (formData.password !== formData.confirmPassword) {
        setMessage('❌ Пароли не совпадают');
        return;
      }
      
      if (formData.password.length < 6) {
        setMessage('❌ Пароль должен содержать минимум 6 символов');
        return;
      }
    }

    try {
      setLoading(true);
      setMessage('');
      
      const updateData: any = {
        name: formData.name,
        email: formData.email
      };
      
      if (showPasswordFields && formData.password) {
        updateData.password = formData.password;
      }
      
      const result = await apiClient.updateProfile(updateData);
      
      setMessage('✅ Профиль успешно обновлен');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
      setShowPasswordFields(false);
      
      if (onProfileUpdated) {
        onProfileUpdated(result.user);
      }
    } catch (error: any) {
      setMessage(`❌ Ошибка обновления: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div style={{
      background: 'white',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
    }}>
      <h3 style={{ margin: '0 0 20px 0' }}>⚙️ Настройки профиля</h3>
      
      {/* Сообщения */}
      {message && (
        <div style={{
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '20px',
          backgroundColor: message.includes('✅') ? '#d1fae5' : '#fee2e2',
          color: message.includes('✅') ? '#065f46' : '#991b1b',
          fontSize: '14px'
        }}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              ФИО
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>

          {/* Кнопка для показа полей пароля */}
          {!showPasswordFields && (
            <div>
              <button
                type="button"
                onClick={() => setShowPasswordFields(true)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                🔑 Изменить пароль
              </button>
            </div>
          )}

          {/* Поля пароля */}
          {showPasswordFields && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Новый пароль
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Подтвердите пароль
                </label>
                <input
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>
              
              <div>
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordFields(false);
                    setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  }}
                  style={{
                    background: '#ef4444',
                    color: 'white',
                    padding: '8px 16px',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: '600'
                  }}
                >
                  ❌ Отменить изменение пароля
                </button>
              </div>
            </>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            {loading ? '⏳ Сохраняем...' : '💾 Сохранить изменения'}
          </button>
        </div>
      </form>

      {/* Информация о профиле */}
      <div style={{
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#374151' }}>
          Информация о профиле
        </h4>
        <div style={{ fontSize: '12px', color: '#6b7280' }}>
          <div>ID: {currentUser.id}</div>
          <div>Роль: {currentUser.role === 'DIRECTOR' ? 'Директор' : 
                     currentUser.role === 'PARENT' ? 'Родитель' : 'Ученик'}</div>
          <div>Школа ID: {currentUser.school_id}</div>
          <div>Статус: {currentUser.verified ? '✅ Верифицирован' : '⏳ Ожидает верификации'}</div>
        </div>
      </div>
    </div>
  );
}
