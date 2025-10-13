import React, { useState, useEffect } from 'react';
import { MenuItem, User } from '../utils/api';

interface OrderFormProps {
  menuItems: MenuItem[];
  user: User;
  onOrderSubmit: (order: any) => void;
}

interface OrderItem {
  menuItem: MenuItem;
  quantity: number;
  notes: string;
}

export default function OrderForm({ menuItems, user, onOrderSubmit }: OrderFormProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [selectedMealType, setSelectedMealType] = useState<string>('завтрак');
  const [orderNotes, setOrderNotes] = useState('');
  const [loading, setLoading] = useState(false);

  // Фильтруем блюда по выбранному дню и типу приема пищи
  const filteredItems = menuItems.filter(item => 
    item.day_of_week === selectedDay && 
    item.meal_type === selectedMealType
  );

  const addToOrder = (menuItem: MenuItem) => {
    const existingItem = orderItems.find(item => item.menuItem.id === menuItem.id);
    
    if (existingItem) {
      setOrderItems(prev => prev.map(item =>
        item.menuItem.id === menuItem.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setOrderItems(prev => [...prev, {
        menuItem,
        quantity: 1,
        notes: ''
      }]);
    }
  };

  const removeFromOrder = (menuItemId: number) => {
    setOrderItems(prev => prev.filter(item => item.menuItem.id !== menuItemId));
  };

  const updateQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromOrder(menuItemId);
      return;
    }
    
    setOrderItems(prev => prev.map(item =>
      item.menuItem.id === menuItemId
        ? { ...item, quantity }
        : item
    ));
  };

  const updateNotes = (menuItemId: number, notes: string) => {
    setOrderItems(prev => prev.map(item =>
      item.menuItem.id === menuItemId
        ? { ...item, notes }
        : item
    ));
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => 
      total + (item.menuItem.price * item.quantity), 0
    );
  };

  const submitOrder = async () => {
    if (orderItems.length === 0) {
      alert('Выберите хотя бы одно блюдо');
      return;
    }

    try {
      setLoading(true);
      
      const order = {
        user_id: user.id,
        items: orderItems.map(item => ({
          id: item.menuItem.id,
          name: item.menuItem.name,
          price: item.menuItem.price,
          quantity: item.quantity,
          notes: item.notes
        })),
        total_price: calculateTotal(),
        notes: orderNotes,
        day_of_week: selectedDay,
        meal_type: selectedMealType
      };

      const response = await fetch('/api/orders.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(order)
      });

      if (response.ok) {
        const result = await response.json();
        onOrderSubmit(result.order);
        setOrderItems([]);
        setOrderNotes('');
        alert('Заказ успешно создан!');
      } else {
        throw new Error('Ошибка создания заказа');
      }
    } catch (error) {
      console.error('Ошибка создания заказа:', error);
      alert('Ошибка создания заказа');
    } finally {
      setLoading(false);
    }
  };

  const getDayName = (dayNumber: number) => {
    const days = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
    return days[dayNumber] || `День ${dayNumber}`;
  };

  const getMealTypeName = (mealType: string) => {
    const types: { [key: string]: string } = {
      'завтрак': 'Завтрак',
      'обед': 'Обед',
      'полдник': 'Полдник',
      'ужин': 'Ужин'
    };
    return types[mealType] || mealType;
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
      <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
        🍽️ Заказ питания
      </h1>

      {/* Выбор дня и типа приема пищи */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '20px',
        marginBottom: '30px',
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '10px'
      }}>
        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            📅 День недели:
          </label>
          <select
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem'
            }}
          >
            {[1, 2, 3, 4, 5].map(day => (
              <option key={day} value={day}>
                {getDayName(day)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            🍽️ Тип приема пищи:
          </label>
          <select
            value={selectedMealType}
            onChange={(e) => setSelectedMealType(e.target.value)}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #ddd',
              borderRadius: '5px',
              fontSize: '1rem'
            }}
          >
            <option value="завтрак">Завтрак</option>
            <option value="обед">Обед</option>
            <option value="полдник">Полдник</option>
            <option value="ужин">Ужин</option>
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '30px' }}>
        {/* Меню блюд */}
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            {getMealTypeName(selectedMealType)} - {getDayName(selectedDay)}
          </h2>
          
          {filteredItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              background: '#f8f9fa',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🍽️</div>
              <p>Нет блюд для выбранного дня и типа приема пищи</p>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '15px'
            }}>
              {filteredItems.map(item => (
                <div
                  key={item.id}
                  style={{
                    border: '1px solid #ddd',
                    borderRadius: '10px',
                    padding: '15px',
                    background: 'white',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                    {item.name}
                  </h3>
                  
                  <div style={{ marginBottom: '10px', color: '#666' }}>
                    <p style={{ margin: '5px 0' }}>
                      <strong>Вес:</strong> {item.weight}
                    </p>
                    {item.recipe_number && (
                      <p style={{ margin: '5px 0' }}>
                        <strong>Рецепт:</strong> №{item.recipe_number}
                      </p>
                    )}
                    <p style={{ margin: '5px 0' }}>
                      <strong>Цена:</strong> {item.price} ₽
                    </p>
                  </div>
                  
                  <button
                    onClick={() => addToOrder(item)}
                    style={{
                      background: '#28a745',
                      color: 'white',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '1rem'
                    }}
                  >
                    ➕ Добавить в заказ
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Корзина заказа */}
        <div>
          <h2 style={{ color: '#333', marginBottom: '20px' }}>
            🛒 Ваш заказ
          </h2>
          
          {orderItems.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: '#666',
              background: '#f8f9fa',
              borderRadius: '10px'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🛒</div>
              <p>Корзина пуста</p>
            </div>
          ) : (
            <div>
              <div style={{ marginBottom: '20px' }}>
                {orderItems.map(item => (
                  <div
                    key={item.menuItem.id}
                    style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      marginBottom: '10px',
                      background: 'white'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ margin: 0, color: '#333' }}>
                        {item.menuItem.name}
                      </h4>
                      <button
                        onClick={() => removeFromOrder(item.menuItem.id)}
                        style={{
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '25px',
                          height: '25px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
                        }}
                      >
                        ×
                      </button>
                    </div>
                    
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginBottom: '10px'
                    }}>
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity - 1)}
                        style={{
                          background: '#6c757d',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer'
                        }}
                      >
                        −
                      </button>
                      
                      <span style={{ minWidth: '30px', textAlign: 'center' }}>
                        {item.quantity}
                      </span>
                      
                      <button
                        onClick={() => updateQuantity(item.menuItem.id, item.quantity + 1)}
                        style={{
                          background: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '3px',
                          width: '30px',
                          height: '30px',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>
                      
                      <span style={{ marginLeft: 'auto', fontWeight: 'bold' }}>
                        {item.menuItem.price * item.quantity} ₽
                      </span>
                    </div>
                    
                    <textarea
                      value={item.notes}
                      onChange={(e) => updateNotes(item.menuItem.id, e.target.value)}
                      placeholder="Особые пожелания..."
                      rows={2}
                      style={{
                        width: '100%',
                        padding: '5px',
                        border: '1px solid #ddd',
                        borderRadius: '3px',
                        fontSize: '0.9rem',
                        resize: 'vertical'
                      }}
                    />
                  </div>
                ))}
              </div>
              
              <div style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                background: '#f8f9fa',
                marginBottom: '20px'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '10px'
                }}>
                  <span>Итого:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
                    {calculateTotal()} ₽
                  </span>
                </div>
              </div>
              
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Комментарий к заказу:
                </label>
                <textarea
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="Дополнительные пожелания..."
                  rows={3}
                  style={{
                    width: '100%',
                    padding: '10px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    fontSize: '1rem',
                    resize: 'vertical'
                  }}
                />
              </div>
              
              <button
                onClick={submitOrder}
                disabled={loading || orderItems.length === 0}
                style={{
                  background: loading || orderItems.length === 0 ? '#6c757d' : '#007bff',
                  color: 'white',
                  border: 'none',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  cursor: loading || orderItems.length === 0 ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  width: '100%',
                  opacity: loading || orderItems.length === 0 ? 0.6 : 1
                }}
              >
                {loading ? '⏳ Оформление заказа...' : '✅ Оформить заказ'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
