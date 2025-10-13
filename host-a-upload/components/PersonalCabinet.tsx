import React, { useState, useEffect } from 'react';
import { User, MenuItem } from '../utils/api';

interface PersonalCabinetProps {
  user: User;
  onLogout: () => void;
}

interface UserOrder {
  id: number;
  user_id: number;
  items: MenuItem[];
  total_price: number;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function PersonalCabinet({ user, onLogout }: PersonalCabinetProps) {
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'settings'>('profile');
  const [profileData, setProfileData] = useState({
    name: user.name,
    email: user.email,
    phone: '',
    address: '',
    preferences: {
      allergies: '',
      dietary_restrictions: '',
      favorite_dishes: ''
    }
  });

  useEffect(() => {
    loadUserOrders();
  }, [user.id]);

  const loadUserOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/orders.php');
      if (response.ok) {
        const allOrders = await response.json();
        const userOrders = allOrders.filter((order: UserOrder) => order.user_id === user.id);
        setOrders(userOrders);
      }
    } catch (error) {
      console.error('Ошибка загрузки заказов:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    try {
      setLoading(true);
      // Здесь можно добавить API для обновления профиля
      console.log('Обновление профиля:', profileData);
      alert('Профиль обновлен!');
    } catch (error) {
      console.error('Ошибка обновления профиля:', error);
      alert('Ошибка обновления профиля');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#ffc107';
      case 'confirmed': return '#17a2b8';
      case 'preparing': return '#fd7e14';
      case 'ready': return '#28a745';
      case 'delivered': return '#6c757d';
      case 'cancelled': return '#dc3545';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Ожидает подтверждения';
      case 'confirmed': return 'Подтвержден';
      case 'preparing': return 'Готовится';
      case 'ready': return 'Готов к выдаче';
      case 'delivered': return 'Выдан';
      case 'cancelled': return 'Отменен';
      default: return status;
    }
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
          👤 Личный кабинет
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

      {/* Навигация */}
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '30px'
      }}>
        {[
          { id: 'profile', label: '👤 Профиль', icon: '👤' },
          { id: 'orders', label: '📋 Мои заказы', icon: '📋' },
          { id: 'settings', label: '⚙️ Настройки', icon: '⚙️' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              background: activeTab === tab.id ? '#007bff' : '#f8f9fa',
              color: activeTab === tab.id ? 'white' : '#333',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.3s ease'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Содержимое вкладок */}
      {activeTab === 'profile' && (
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>👤 Информация о профиле</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Имя:
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Email:
              </label>
              <input
                type="email"
                value={profileData.email}
                disabled
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  background: '#f8f9fa'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Телефон:
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Адрес:
              </label>
              <input
                type="text"
                value={profileData.address}
                onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem'
                }}
              />
            </div>
          </div>

          <h3 style={{ color: '#333', marginBottom: '15px' }}>🍽️ Пищевые предпочтения</h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '30px'
          }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Аллергии:
              </label>
              <textarea
                value={profileData.preferences.allergies}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  preferences: {...profileData.preferences, allergies: e.target.value}
                })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Укажите аллергии, если есть"
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Диетические ограничения:
              </label>
              <textarea
                value={profileData.preferences.dietary_restrictions}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  preferences: {...profileData.preferences, dietary_restrictions: e.target.value}
                })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Вегетарианство, веганство и т.д."
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Любимые блюда:
              </label>
              <textarea
                value={profileData.preferences.favorite_dishes}
                onChange={(e) => setProfileData({
                  ...profileData, 
                  preferences: {...profileData.preferences, favorite_dishes: e.target.value}
                })}
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  fontSize: '1rem',
                  resize: 'vertical'
                }}
                placeholder="Какие блюда вы предпочитаете"
              />
            </div>
          </div>

          <button
            onClick={updateProfile}
            disabled={loading}
            style={{
              background: '#28a745',
              color: 'white',
              border: 'none',
              padding: '12px 30px',
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '1rem',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? '⏳ Сохранение...' : '💾 Сохранить изменения'}
          </button>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>📋 История заказов</h2>
          
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '2rem' }}>⏳</div>
              <p>Загрузка заказов...</p>
            </div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>📋</div>
              <p>У вас пока нет заказов</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {orders.map(order => (
                <div
                  key={order.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '20px',
                    background: '#f8f9fa'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '15px'
                  }}>
                    <h3 style={{ margin: 0, color: '#333' }}>
                      Заказ #{order.id}
                    </h3>
                    <span
                      style={{
                        background: getStatusColor(order.status),
                        color: 'white',
                        padding: '5px 15px',
                        borderRadius: '20px',
                        fontSize: '0.9rem'
                      }}
                    >
                      {getStatusText(order.status)}
                    </span>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Дата:</strong> {new Date(order.created_at).toLocaleString('ru-RU')}
                    </p>
                    <p style={{ margin: '5px 0', color: '#666' }}>
                      <strong>Сумма:</strong> {order.total_price} ₽
                    </p>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Блюда:</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {order.items.map((item, index) => (
                        <div
                          key={index}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            padding: '5px 10px',
                            background: 'white',
                            borderRadius: '5px'
                          }}
                        >
                          <span>{item.name}</span>
                          <span style={{ color: '#666' }}>{item.price} ₽</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>⚙️ Настройки</h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '20px'
          }}>
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '20px',
              background: '#f8f9fa'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔔 Уведомления</h3>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input type="checkbox" defaultChecked style={{ marginRight: '10px' }} />
                Email уведомления о заказах
              </label>
              <label style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
                <input type="checkbox" defaultChecked style={{ marginRight: '10px' }} />
                Уведомления о готовности
              </label>
              <label style={{ display: 'flex', alignItems: 'center' }}>
                <input type="checkbox" style={{ marginRight: '10px' }} />
                Рекламные рассылки
              </label>
            </div>
            
            <div style={{
              border: '1px solid #ddd',
              borderRadius: '10px',
              padding: '20px',
              background: '#f8f9fa'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>🔒 Безопасность</h3>
              <button
                style={{
                  background: '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  marginBottom: '10px',
                  width: '100%'
                }}
              >
                🔑 Изменить пароль
              </button>
              <button
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                🗑️ Удалить аккаунт
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
