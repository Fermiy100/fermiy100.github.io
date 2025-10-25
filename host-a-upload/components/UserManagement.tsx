import React, { useState, useEffect } from 'react';
import { User } from '../api';
import { useMobile, MobileButton, MobileForm, MobileInput } from './MobileOptimized';

interface UserManagementProps {
  token: string;
}

export default function UserManagement({ token }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    role: 'PARENT' as 'DIRECTOR' | 'PARENT',
    school_id: 1
  });
  const isMobile = useMobile();

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users.php', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const usersData = await response.json();
        setUsers(usersData);
      } else {
        setMessage('❌ Ошибка загрузки пользователей');
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('/api/users.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newUser)
      });
      
      if (response.ok) {
        setMessage('✅ Пользователь успешно добавлен!');
        setNewUser({ name: '', email: '', password: '', role: 'PARENT', school_id: 1 });
        setShowAddUser(false);
        loadUsers();
      } else {
        setMessage('❌ Ошибка при добавлении пользователя');
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения к серверу');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/users.php?id=${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setMessage('✅ Пользователь удален!');
        loadUsers();
      } else {
        setMessage('❌ Ошибка при удалении пользователя');
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения к серверу');
    }
  };

  const handleToggleUserStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      const response = await fetch(`/api/users.php?id=${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        setMessage(`✅ Статус пользователя изменен на ${newStatus === 'active' ? 'активный' : 'неактивный'}`);
        loadUsers();
      } else {
        setMessage('❌ Ошибка при изменении статуса');
      }
    } catch (error) {
      setMessage('❌ Ошибка подключения к серверу');
    }
  };

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '1000px',
      margin: '0 auto',
      background: 'white',
      borderRadius: isMobile ? '10px' : '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '15px' : '0'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          margin: 0,
          color: '#333'
        }}>
          👥 Управление пользователями
        </h1>
        
        <MobileButton
          onClick={() => setShowAddUser(!showAddUser)}
          variant="primary"
          style={{ width: isMobile ? '100%' : 'auto' }}
        >
          {showAddUser ? '❌ Отмена' : '➕ Добавить пользователя'}
        </MobileButton>
      </div>

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

      {/* Форма добавления пользователя */}
      {showAddUser && (
        <div style={{
          background: '#f8f9fa',
          padding: '20px',
          borderRadius: '10px',
          marginBottom: '30px',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>➕ Добавить нового пользователя</h3>
          
          <MobileForm onSubmit={handleAddUser}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
              gap: '15px',
              marginBottom: '20px'
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
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Введите имя"
                  required
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
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  placeholder="Введите email"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Пароль:
                </label>
                <MobileInput
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Введите пароль"
                  required
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontWeight: '500',
                  color: '#333'
                }}>
                  Роль:
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value as 'DIRECTOR' | 'PARENT'})}
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
                  <option value="PARENT">Родитель</option>
                  <option value="DIRECTOR">Директор</option>
                </select>
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '10px',
              flexDirection: isMobile ? 'column' : 'row'
            }}>
              <MobileButton
                type="submit"
                disabled={loading}
                variant="primary"
                style={{ flex: 1 }}
              >
                {loading ? '⏳ Добавляем...' : '✅ Добавить пользователя'}
              </MobileButton>
              
              <MobileButton
                onClick={() => setShowAddUser(false)}
                variant="secondary"
                style={{ flex: 1 }}
              >
                ❌ Отмена
              </MobileButton>
            </div>
          </MobileForm>
        </div>
      )}

      {/* Список пользователей */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '50px',
          color: '#666'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
          <p>Загружаем пользователей...</p>
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {users.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '50px',
              color: '#666',
              background: '#f8f9fa',
              borderRadius: '10px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👥</div>
              <p>Пользователи не найдены</p>
            </div>
          ) : (
            users.map((user) => (
              <div
                key={user.id}
                style={{
                  background: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexDirection: isMobile ? 'column' : 'row',
                  gap: isMobile ? '15px' : '0'
                }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{
                      margin: '0 0 10px 0',
                      color: '#333',
                      fontSize: isMobile ? '1.1rem' : '1.2rem'
                    }}>
                      {user.name}
                    </h3>
                    
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '5px',
                      color: '#666',
                      fontSize: isMobile ? '14px' : '13px'
                    }}>
                      <p style={{ margin: 0 }}>📧 {user.email}</p>
                      <p style={{ margin: 0 }}>
                        👤 {user.role === 'DIRECTOR' ? 'Директор' : 'Родитель'}
                      </p>
                      <p style={{ margin: 0 }}>
                        🏫 Школа ID: {user.school_id}
                      </p>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: isMobile ? 'stretch' : 'center'
                  }}>
                    <MobileButton
                      onClick={() => handleToggleUserStatus(user.id, 'active')}
                      variant="secondary"
                      style={{ 
                        fontSize: isMobile ? '14px' : '12px',
                        padding: isMobile ? '10px 15px' : '8px 12px'
                      }}
                    >
                      🔄 Изменить статус
                    </MobileButton>
                    
                    <MobileButton
                      onClick={() => handleDeleteUser(user.id)}
                      variant="danger"
                      style={{ 
                        fontSize: isMobile ? '14px' : '12px',
                        padding: isMobile ? '10px 15px' : '8px 12px'
                      }}
                    >
                      🗑️ Удалить
                    </MobileButton>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
