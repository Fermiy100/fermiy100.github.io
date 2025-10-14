import { useState, useEffect } from 'react';
import { apiClient, User, School } from './utils/api';

interface UserManagementProps {
  currentUser: User;
  onUserCreated?: (user: User) => void;
}

export default function UserManagement({ currentUser, onUserCreated }: UserManagementProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [school, setSchool] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [message, setMessage] = useState('');
  const [verifying, setVerifying] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [createdUserPassword, setCreatedUserPassword] = useState<string>('');

  // Форма создания пользователя
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    role: 'PARENT' as 'PARENT' | 'STUDENT',
    password: ''
  });

  // Функция генерации пароля
  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let password = '';
    
    // Генерируем пароль длиной 12-16 символов
    const length = 12 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    setNewUser(prev => ({ ...prev, password }));
  };

  useEffect(() => {
    loadData();
  }, [currentUser]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем информацию о школе (временно отключено из-за Railway)
      if (currentUser.school_id) {
        // Временно используем mock данные школы
        const mockSchool = {
          id: 1,
          name: 'TOP IT Дегунино',
          address: 'г. Москва, Дегунино',
          director_id: 1
        };
        setSchool(mockSchool);
        
        // Загружаем пользователей школы
        const schoolUsers = await apiClient.getSchoolUsers(currentUser.school_id);
        setUsers(schoolUsers);
      }
    } catch (error: any) {
      setMessage(`❌ Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser.school_id) {
      setMessage('❌ Ошибка: не указана школа. Попробуйте перезагрузить страницу.');
      return;
    }

    if (!newUser.email || !newUser.name || !newUser.password) {
      setMessage('❌ Заполните все поля и сгенерируйте пароль');
      return;
    }

    try {
      setMessage('');
      const userData = {
        ...newUser,
        school_id: currentUser.school_id
      };
      const createdUser = await apiClient.createUser(userData);
      
      setUsers(prev => [...prev, createdUser]);
      setCreatedUserPassword(newUser.password);
      setNewUser({ email: '', name: '', role: 'PARENT', password: '' });
      setShowCreateForm(false);
      setMessage(`✅ Пользователь ${createdUser.name} создан. Пароль: ${newUser.password}`);
      
      if (onUserCreated) {
        onUserCreated(createdUser);
      }
    } catch (error: any) {
      setMessage(`❌ Ошибка создания пользователя: ${error.message}`);
    }
  };

  const handleVerifyUser = async (userId: number) => {
    try {
      setVerifying(userId.toString());
      setMessage('');
      
      await apiClient.verifyUser(userId);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, verified: true } : u));
      setMessage(`✅ Пользователь верифицирован`);
    } catch (error: any) {
      setMessage(`❌ Ошибка верификации: ${error.message}`);
    } finally {
      setVerifying(null);
    }
  };

  const handleDeleteUser = async (userId: number, userName: string) => {
    if (!confirm(`Вы уверены, что хотите удалить пользователя "${userName}"? Это действие нельзя отменить.`)) {
      return;
    }

    try {
      setDeleting(userId.toString());
      setMessage('');
      
      await apiClient.deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      setMessage(`✅ Пользователь "${userName}" удален`);
    } catch (error: any) {
      setMessage(`❌ Ошибка удаления: ${error.message}`);
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
        <div>Загружаем данные...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2>👥 Управление пользователями</h2>
        <button
          onClick={() => setShowCreateForm(true)}
          style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          ➕ Создать пользователя
        </button>
      </div>

      {/* Информация о школе */}
      {school && (
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px'
        }}>
          <h3 style={{ margin: '0 0 10px 0' }}>🏫 {school.name}</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>{school.address}</p>
        </div>
      )}

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

      {/* Форма создания пользователя */}
      {showCreateForm && (
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '20px',
          marginBottom: '20px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          <h3 style={{ margin: '0 0 20px 0' }}>Создать нового пользователя</h3>
          
          <form onSubmit={handleCreateUser}>
            <div style={{ display: 'grid', gap: '15px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Email
                </label>
                <input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
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
                  ФИО
                </label>
                <input
                  type="text"
                  value={newUser.name}
                  onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
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
                  Роль
                </label>
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value as 'PARENT' | 'STUDENT' }))}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  <option value="PARENT">Родитель</option>
                  <option value="STUDENT">Ученик</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '600' }}>
                  Пароль
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    value={newUser.password}
                    onChange={(e) => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Сгенерируйте пароль"
                    readOnly
                    style={{
                      flex: 1,
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: '#f9fafb'
                    }}
                  />
                  <button
                    type="button"
                    onClick={generatePassword}
                    style={{
                      padding: '10px 15px',
                      backgroundColor: '#3b82f6',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      fontWeight: '600'
                    }}
                  >
                    🔑 Сгенерировать
                  </button>
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                  Пароль будет содержать 12-16 символов (буквы и цифры)
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="submit"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Создать
              </button>
              
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                style={{
                  background: '#6b7280',
                  color: 'white',
                  padding: '10px 20px',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                Отмена
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Список пользователей */}
      <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        <div style={{
          background: '#f9fafb',
          padding: '15px 20px',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>
            Пользователи школы ({users.length})
          </h3>
        </div>
        
        {users.length === 0 ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>
            Пользователи не найдены
          </div>
        ) : (
          <div style={{ maxHeight: '500px', overflow: 'auto' }}>
            {users.map((user) => (
              <div
                key={user.id}
                style={{
                  padding: '15px 20px',
                  borderBottom: '1px solid #f3f4f6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                    {user.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
                    {user.email}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                    {user.role === 'DIRECTOR' ? 'Директор' : 
                     user.role === 'PARENT' ? 'Родитель' : 'Ученик'}
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {!user.verified ? (
                    <button
                      onClick={() => handleVerifyUser(user.id)}
                      disabled={verifying === user.id.toString()}
                      style={{
                        background: verifying === user.id.toString() ? '#9ca3af' : '#f59e0b',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: verifying === user.id.toString() ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {verifying === user.id.toString() ? '⏳' : '✓'} Верифицировать
                    </button>
                  ) : (
                    <span style={{
                      background: '#d1fae5',
                      color: '#065f46',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      ✓ Верифицирован
                    </span>
                  )}
                  
                  {/* Кнопка удаления - только для не-директоров */}
                  {user.role !== 'DIRECTOR' && user.id !== currentUser.id && (
                    <button
                      onClick={() => handleDeleteUser(user.id, user.name)}
                      disabled={deleting === user.id.toString()}
                      style={{
                        background: deleting === user.id.toString() ? '#9ca3af' : '#ef4444',
                        color: 'white',
                        padding: '6px 12px',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: deleting === user.id.toString() ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}
                    >
                      {deleting === user.id.toString() ? '⏳' : '🗑️'} Удалить
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Статистика */}
      <div style={{
        marginTop: '20px',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '15px'
      }}>
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3b82f6' }}>
            {users.length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Всего пользователей
          </div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981' }}>
            {users.filter(u => u.verified).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Верифицированных
          </div>
        </div>
        
        <div style={{
          background: 'white',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          padding: '15px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b' }}>
            {users.filter(u => !u.verified).length}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280' }}>
            Ожидают верификации
          </div>
        </div>
      </div>
    </div>
  );
}
