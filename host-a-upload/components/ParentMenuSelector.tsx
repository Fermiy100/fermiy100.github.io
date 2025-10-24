import React, { useState, useEffect } from 'react';
import { apiClient, MenuItem, User } from '../api';
import { useMobile, MobileButton, MobileForm, MobileInput } from './MobileOptimized';

interface ParentMenuSelectorProps {
  user: User;
}

export default function ParentMenuSelector({ user }: ParentMenuSelectorProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState<string>('ПОНЕДЕЛЬНИК');
  const [selectedDishes, setSelectedDishes] = useState<{[key: string]: number}>({});
  const [msg, setMsg] = useState<string | null>(null);
  const isMobile = useMobile();

  const days = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА'];
  const mealTypes = [
    { key: 'breakfast', name: 'ЗАВТРАК', icon: '🌅', color: '#17a2b8' },
    { key: 'lunch', name: 'ОБЕД', icon: '🍽️', color: '#28a745' },
    { key: 'snack', name: 'ПОЛДНИК', icon: '🍎', color: '#ffc107' }
  ];

  const [autoLoad, setAutoLoad] = useState(false);

  useEffect(() => {
    // Не загружаем автоматически, только по требованию
    // loadMenuData();
  }, []);

  const loadMenuData = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Загружаем меню для родителей...');
      
      const menuData = await apiClient.getMenu();
      console.log('Получены данные меню:', menuData.length, 'блюд');
      
      // Фильтруем только валидные элементы
      const validItems = menuData.filter(item => item && item.id);
      setMenuItems(validItems);
      
      console.log('Меню загружено успешно:', validItems.length, 'блюд');
    } catch (err: any) {
      console.error('Ошибка загрузки меню:', err);
      setError(`Ошибка загрузки данных: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const getDishesForDayAndMeal = (day: string, mealType: string) => {
    return menuItems.filter(item => 
      item.day_of_week === day && 
      item.meal_type.toLowerCase() === mealType.toLowerCase()
    );
  };

  const toggleDish = (dishId: number) => {
    setSelectedDishes(prev => {
      const newSelected = { ...prev };
      if (newSelected[dishId]) {
        delete newSelected[dishId];
      } else {
        newSelected[dishId] = 1;
      }
      return newSelected;
    });
  };

  const updateQuantity = (dishId: number, quantity: number) => {
    if (quantity <= 0) {
      setSelectedDishes(prev => {
        const newSelected = { ...prev };
        delete newSelected[dishId];
        return newSelected;
      });
    } else {
      setSelectedDishes(prev => ({
        ...prev,
        [dishId]: quantity
      }));
    }
  };

  const getTotalPrice = () => {
    return Object.entries(selectedDishes).reduce((total, [dishId, quantity]) => {
      const dish = menuItems.find(item => item.id === parseInt(dishId));
      return total + (dish ? dish.price * quantity : 0);
    }, 0);
  };

  const getSelectedDishesCount = () => {
    return Object.values(selectedDishes).reduce((total, quantity) => total + quantity, 0);
  };

  const placeOrder = async () => {
    if (Object.keys(selectedDishes).length === 0) {
      setMsg('❌ Выберите хотя бы одно блюдо');
      return;
    }

    try {
      setLoading(true);
      const orderItems = Object.entries(selectedDishes).map(([dishId, quantity]) => {
        const dish = menuItems.find(item => item.id === parseInt(dishId));
        return {
          dish_id: parseInt(dishId),
          name: dish?.name || '',
          quantity: quantity,
          price: dish?.price || 0
        };
      });

      const order = {
        user_id: user.id,
        items: orderItems,
        total_price: getTotalPrice()
      };

      await apiClient.createOrder(order);
      setSelectedDishes({});
      setMsg('✅ Заказ успешно оформлен!');
    } catch (err: any) {
      setError(`Ошибка оформления заказа: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '400px',
        color: '#666'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>⏳</div>
          <p>Загрузка меню...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        background: '#f8d7da',
        color: '#721c24',
        padding: '20px',
        borderRadius: '8px',
        margin: '20px',
        border: '1px solid #f5c6cb'
      }}>
        ❌ {error}
        <button
          onClick={loadMenuData}
          style={{
            background: '#dc3545',
            color: 'white',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '4px',
            marginLeft: '10px',
            cursor: 'pointer'
          }}
        >
          🔄 Попробовать снова
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: window.innerWidth <= 768 ? '10px' : '20px', 
      maxWidth: '1200px', 
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        background: 'white',
        borderRadius: window.innerWidth <= 768 ? '10px' : '15px',
        padding: window.innerWidth <= 768 ? '15px' : '30px',
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb',
        width: '100%',
        boxSizing: 'border-box'
      }}>
        <h2 style={{ 
          textAlign: 'center', 
          marginBottom: window.innerWidth <= 768 ? '20px' : '30px', 
          color: '#333',
          fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem'
        }}>
          🍽️ Выбор блюд
        </h2>

        {/* Кнопка загрузки меню */}
        {menuItems.length === 0 && !loading && (
          <div style={{
            textAlign: 'center',
            marginBottom: '30px',
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '10px',
            border: '2px dashed #dee2e6'
          }}>
            <p style={{ marginBottom: '15px', color: '#666' }}>
              Меню не загружено. Нажмите кнопку для загрузки блюд.
            </p>
            <button
              onClick={loadMenuData}
              disabled={loading}
              style={{
                background: '#007bff',
                color: 'white',
                border: 'none',
                padding: '12px 24px',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '1rem',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? '⏳ Загружаем...' : '📋 Загрузить меню'}
            </button>
          </div>
        )}

        {msg && (
          <div style={{
            background: msg.startsWith('✅') ? '#d4edda' : '#f8d7da',
            color: msg.startsWith('✅') ? '#155724' : '#721c24',
            padding: '15px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: `1px solid ${msg.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'}`
          }}>
            {msg}
          </div>
        )}

        {/* Выбор дня */}
        <div style={{ marginBottom: window.innerWidth <= 768 ? '20px' : '30px' }}>
          <h3 style={{ 
            marginBottom: '15px', 
            color: '#333',
            fontSize: window.innerWidth <= 768 ? '1.1rem' : '1.2rem'
          }}>
            📅 ВЫБОР ДНЯ
          </h3>
          <div style={{ 
            display: 'flex', 
            gap: window.innerWidth <= 768 ? '5px' : '10px', 
            flexWrap: 'wrap',
            justifyContent: window.innerWidth <= 768 ? 'center' : 'flex-start'
          }}>
            {days.map(day => (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                style={{
                  background: selectedDay === day ? '#dc3545' : '#f8f9fa',
                  color: selectedDay === day ? 'white' : '#333',
                  border: '2px solid #dee2e6',
                  padding: window.innerWidth <= 768 ? '12px 16px' : '12px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  transition: 'all 0.3s ease',
                  minHeight: window.innerWidth <= 768 ? '44px' : 'auto',
                  flex: window.innerWidth <= 768 ? '1' : 'none',
                  minWidth: window.innerWidth <= 768 ? '80px' : 'auto',
                  fontSize: window.innerWidth <= 768 ? '12px' : '14px'
                }}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Блюда по типам питания */}
        <div style={{ marginBottom: '30px' }}>
          {mealTypes.map(meal => {
            const dishes = getDishesForDayAndMeal(selectedDay, meal.key);
            return (
              <div key={meal.key} style={{ marginBottom: '25px' }}>
                <div style={{
                  background: meal.color,
                  color: 'white',
                  padding: '15px',
                  borderRadius: '10px 10px 0 0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {meal.icon} {meal.name}
                  </h3>
                  <span style={{ 
                    background: 'rgba(255,255,255,0.2)', 
                    padding: '5px 10px', 
                    borderRadius: '15px',
                    fontSize: '0.9rem'
                  }}>
                    ({dishes.length} блюд)
                  </span>
                </div>
                
                <div style={{
                  background: 'white',
                  border: `2px solid ${meal.color}`,
                  borderTop: 'none',
                  borderRadius: '0 0 10px 10px',
                  padding: '20px',
                  minHeight: '100px'
                }}>
                  {dishes.length === 0 ? (
                    <div style={{ 
                      textAlign: 'center', 
                      color: '#666', 
                      padding: '20px',
                      fontStyle: 'italic'
                    }}>
                      Нет блюд для {meal.name.toLowerCase()}а
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
                      {dishes.map(dish => (
                        <div key={dish.id} style={{
                          border: '1px solid #dee2e6',
                          borderRadius: '8px',
                          padding: '15px',
                          background: selectedDishes[dish.id] ? '#e3f2fd' : 'white',
                          transition: 'all 0.3s ease'
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <h4 style={{ margin: 0, color: '#333', fontSize: '1.1rem' }}>
                              {dish.name}
                            </h4>
                            <span style={{ 
                              background: '#007bff', 
                              color: 'white', 
                              padding: '4px 8px', 
                              borderRadius: '4px',
                              fontSize: '0.9rem',
                              fontWeight: 'bold'
                            }}>
                              {dish.price} ₽
                            </span>
                          </div>
                          
                          {dish.weight && (
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                              📏 Вес: {dish.weight}
                            </p>
                          )}
                          
                          {dish.recipe_number && (
                            <p style={{ margin: '5px 0', color: '#666', fontSize: '0.9rem' }}>
                              📋 Рецепт: {dish.recipe_number}
                            </p>
                          )}

                          {selectedDishes[dish.id] ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
                              <button
                                onClick={() => updateQuantity(dish.id, selectedDishes[dish.id] - 1)}
                                style={{
                                  background: '#dc3545',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '30px',
                                  height: '30px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                -
                              </button>
                              <span style={{ 
                                background: '#007bff', 
                                color: 'white', 
                                padding: '5px 10px', 
                                borderRadius: '4px',
                                minWidth: '40px',
                                textAlign: 'center'
                              }}>
                                {selectedDishes[dish.id]}
                              </span>
                              <button
                                onClick={() => updateQuantity(dish.id, selectedDishes[dish.id] + 1)}
                                style={{
                                  background: '#28a745',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: '30px',
                                  height: '30px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                +
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => toggleDish(dish.id)}
                              style={{
                                background: '#28a745',
                                color: 'white',
                                border: 'none',
                                padding: '8px 16px',
                                borderRadius: '5px',
                                cursor: 'pointer',
                                marginTop: '10px',
                                width: '100%'
                              }}
                            >
                              ➕ Добавить
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Выбранные блюда */}
        {Object.keys(selectedDishes).length > 0 && (
          <div style={{
            background: '#f8f9fa',
            border: '2px solid #dee2e6',
            borderRadius: '10px',
            padding: '20px',
            marginBottom: '20px'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#333' }}>🛒 Выбранные блюда</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ 
                  background: '#007bff', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  fontWeight: 'bold'
                }}>
                  Всего: {getSelectedDishesCount()} блюд
                </span>
                <span style={{ 
                  background: '#28a745', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '20px',
                  fontWeight: 'bold',
                  marginLeft: '10px'
                }}>
                  Сумма: {getTotalPrice()} ₽
                </span>
              </div>
              <button
                onClick={placeOrder}
                disabled={loading}
                style={{
                  background: loading ? '#6c757d' : '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '8px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold'
                }}
              >
                {loading ? '⏳ Оформляем...' : '🛒 Оформить заказ'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
