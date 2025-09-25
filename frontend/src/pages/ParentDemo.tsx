import { useState, useEffect } from 'react';
import { apiClient, MenuItem, Order } from '../utils/api';

interface ParentDemoProps {
  token: string;
}

export default function ParentDemo({ token: _token }: ParentDemoProps) {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [totalCost, setTotalCost] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [_orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем меню
      const menuData = await apiClient.getMenu();
      setMenuItems(menuData.items);
      
      // Загружаем существующие заказы
      const userOrders = await apiClient.getUserOrders();
      setOrders(userOrders);
      
      // Восстанавливаем выбранные элементы из заказов
      const selectedFromOrders: { [key: string]: boolean } = {};
      userOrders.forEach(order => {
        selectedFromOrders[order.menu_item_id.toString()] = true;
      });
      setSelectedItems(selectedFromOrders);
      
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Пересчитываем общую стоимость
    const total = Object.keys(selectedItems)
      .filter(key => selectedItems[key])
      .reduce((sum, key) => {
        const item = menuItems.find(item => item.id.toString() === key);
        return sum + (item?.price || 0);
      }, 0);
    setTotalCost(total);
  }, [selectedItems, menuItems]);

  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSubmitOrder = async () => {
    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    if (selectedCount === 0) {
      alert('Выберите хотя бы одно блюдо');
      return;
    }
    
    try {
      const selectedItemIds = Object.keys(selectedItems)
        .filter(key => selectedItems[key])
        .map(key => parseInt(key));
      
      const weekStart = new Date().toISOString().split('T')[0];
      await apiClient.createOrder(selectedItemIds, weekStart);
      
      alert(`Заказ отправлен!\nВыбрано блюд: ${selectedCount}\nОбщая стоимость: ${totalCost} ₽`);
      
      // Перезагружаем заказы
      const userOrders = await apiClient.getUserOrders();
      setOrders(userOrders);
      
    } catch (error: any) {
      alert(`Ошибка отправки заказа: ${error.message}`);
    }
  };

  const dayNames = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

  // Группируем блюда по дням и типам питания
  const groupedMenu = menuItems.reduce((acc: any, item: MenuItem) => {
    const key = `${item.day_of_week}-${item.meal_type}`;
    if (!acc[key]) {
      acc[key] = {
        day: dayNames[item.day_of_week] || `День ${item.day_of_week}`,
        mealType: item.meal_type,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  if (loading) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '100vh'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          display: 'inline-block',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ fontSize: '24px', marginBottom: '20px' }}>⏳</div>
          <div>Загружаем меню...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        display: 'flex', 
        gap: '12px', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        marginBottom: '20px' 
      }}>
        <h2>🍽️ Выбор блюд</h2>
        <div style={{ fontSize: '14px', color: '#6b7280' }}>
          Родитель/Ученик
        </div>
      </div>

      {/* Информация о заказе */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: '0 0 5px 0' }}>Ваш заказ</h3>
          <p style={{ margin: 0, opacity: 0.9 }}>
            Выбрано блюд: {Object.values(selectedItems).filter(Boolean).length}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
            {totalCost} ₽
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>
            Общая стоимость
          </div>
        </div>
      </div>

      {/* Меню по дням */}
      <div style={{ display: 'grid', gap: '20px' }}>
        {Object.values(groupedMenu).map((group: any, idx: number) => (
          <div key={idx} style={{
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            backgroundColor: '#f9fafb'
          }}>
            <h3 style={{
              margin: '0 0 16px 0',
              color: '#374151',
              fontSize: '18px',
              fontWeight: '600',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{group.day} — {group.mealType}</span>
              <span style={{ fontSize: '14px', color: '#6b7280', fontWeight: 'normal' }}>
                {group.items.length} блюд
              </span>
            </h3>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
              gap: '12px' 
            }}>
              {group.items.map((item: MenuItem) => (
                <div 
                  key={item.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    border: selectedItems[item.id] ? '2px solid #10b981' : '1px solid #e5e7eb',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative'
                  }}
                  onClick={() => handleItemToggle(item.id)}
                >
                  {selectedItems[item.id] && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      background: '#10b981',
                      color: 'white',
                      borderRadius: '50%',
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px'
                    }}>
                      ✓
                    </div>
                  )}
                  
                  <div style={{ 
                    fontWeight: '600', 
                    fontSize: '16px', 
                    marginBottom: '8px',
                    color: selectedItems[item.id] ? '#10b981' : '#374151'
                  }}>
                    {item.name}
                  </div>
                  
                  {item.description && (
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#6b7280', 
                      marginBottom: '8px' 
                    }}>
                      {item.description}
                    </div>
                  )}
                  
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center' 
                  }}>
                    <div style={{ 
                      fontSize: '16px', 
                      color: '#059669', 
                      fontWeight: '600' 
                    }}>
                      {item.price} ₽
                    </div>
                    
                    <div style={{
                      fontSize: '12px',
                      color: selectedItems[item.id] ? '#10b981' : '#9ca3af',
                      fontWeight: '500'
                    }}>
                      {selectedItems[item.id] ? 'Выбрано' : 'Нажмите для выбора'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Кнопка отправки заказа */}
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center',
        padding: '20px',
        background: '#f9fafb',
        borderRadius: '12px',
        border: '1px solid #e5e7eb'
      }}>
        <button
          onClick={handleSubmitOrder}
          disabled={Object.values(selectedItems).filter(Boolean).length === 0}
          style={{
            background: Object.values(selectedItems).filter(Boolean).length === 0 
              ? '#9ca3af' 
              : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: 'white',
            padding: '16px 32px',
            border: 'none',
            borderRadius: '8px',
            fontSize: '18px',
            fontWeight: '600',
            cursor: Object.values(selectedItems).filter(Boolean).length === 0 
              ? 'not-allowed' 
              : 'pointer',
            minWidth: '200px'
          }}
        >
          📤 Отправить заказ
        </button>
        
        {Object.values(selectedItems).filter(Boolean).length === 0 && (
          <p style={{ 
            margin: '10px 0 0 0', 
            color: '#6b7280', 
            fontSize: '14px' 
          }}>
            Выберите хотя бы одно блюдо для отправки заказа
          </p>
        )}
      </div>

      {/* Инструкции */}
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#f0f9ff',
        borderRadius: '12px',
        border: '1px solid #0ea5e9'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1e40af' }}>
          📝 Как сделать заказ:
        </h4>
        <ul style={{ margin: 0, paddingLeft: '20px', color: '#1e40af' }}>
          <li>Нажмите на блюдо для выбора (зеленая галочка появится)</li>
          <li>Стоимость автоматически пересчитывается</li>
          <li>Можно выбрать несколько блюд на каждый день</li>
          <li>Нажмите "Отправить заказ" для подтверждения</li>
        </ul>
      </div>
    </div>
  );
}
