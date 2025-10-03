import { useState, useEffect } from 'react';
import { apiClient, MenuItem } from '../utils/api';

interface MenuSelectorProps {
  onSelectionChange: (selectedItems: MenuItem[]) => void;
}

export default function MenuSelector({ onSelectionChange }: MenuSelectorProps) {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedDay, setSelectedDay] = useState<string>('понедельник');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];

  useEffect(() => {
    loadMenu();
  }, []);

  useEffect(() => {
    const selected = menuItems.filter(item => selectedItems.has(item.id));
    onSelectionChange(selected);
  }, [selectedItems, menuItems, onSelectionChange]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMenu();
      setMenuItems(data.items || []);
    } catch (error: any) {
      setMsg(`❌ Ошибка загрузки меню: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const getItemsForDay = (day: string) => {
    return menuItems.filter(item => String(item.day_of_week) === day);
  };

  const getItemsForMeal = (day: string, mealType: string) => {
    return getItemsForDay(day)
      .filter(item => item.meal_type === mealType)
      .sort((a, b) => a.name.localeCompare(b.name, 'ru'));
  };

  const getMealTypeIcon = (mealType: string) => {
    switch (mealType) {
      case 'завтрак': return '🌅';
      case 'обед': return '🍽️';
      case 'полдник': return '🥛';
      default: return '🍴';
    }
  };

  const getMealTypeColor = (mealType: string) => {
    switch (mealType) {
      case 'завтрак': return '#FFE5B4';
      case 'обед': return '#E5F3FF';
      case 'полдник': return '#F0FFF0';
      default: return '#F5F5F5';
    }
  };

  const formatPrice = (price: number) => {
    return price ? `${price} ₽` : '';
  };


  const getTotalByMealType = (mealType: string) => {
    return Array.from(selectedItems).reduce((total, itemId) => {
      const item = menuItems.find(m => m.id === itemId);
      if (item?.meal_type === mealType) {
        return total + (item?.price || 0);
      }
      return total;
    }, 0);
  };

  const clearAllSelections = () => {
    setSelectedItems(new Set());
    setMsg('✅ Выбор очищен');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>⏳ Загружаем меню...</div>
      </div>
    );
  }

  return (
    <div className="parent-menu-selector">
      {msg && (
        <div style={{
          padding: '10px',
          margin: '10px 0',
          borderRadius: '5px',
          backgroundColor: msg.includes('❌') ? '#fee' : '#efe',
          border: `1px solid ${msg.includes('❌') ? '#fcc' : '#cfc'}`,
          color: msg.includes('❌') ? '#c33' : '#363'
        }}>
          {msg}
        </div>
      )}

      {/* Выбор дня недели */}
      <div className="day-selector">
        <h2>📅 Выберите день недели</h2>
        <div className="day-buttons">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={selectedDay === day ? 'active' : ''}
            >
              {day.charAt(0).toUpperCase() + day.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Меню на выбранный день */}
      <div className="menu-layout">
        {/* Завтрак */}
        <div className="meal-column" style={{ backgroundColor: getMealTypeColor('завтрак'), borderRadius: '10px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="meal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getMealTypeIcon('завтрак')} Завтрак
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <div className="item-count" style={{ 
                backgroundColor: '#fff', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                {getItemsForMeal(selectedDay, 'завтрак').length} блюд
              </div>
              {getTotalByMealType('завтрак') > 0 && (
                <div style={{ 
                  backgroundColor: '#4CAF50', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '8px', 
                  fontSize: '11px'
                }}>
                  {getTotalByMealType('завтрак')} ₽
                </div>
              )}
            </div>
          </div>
          <div className="meal-items">
            {getItemsForMeal(selectedDay, 'завтрак').map(item => (
              <div
                key={item.id}
                className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
                style={{
                  backgroundColor: selectedItems.has(item.id) ? '#4CAF50' : '#fff',
                  color: selectedItems.has(item.id) ? 'white' : 'black',
                  border: `2px solid ${selectedItems.has(item.id) ? '#4CAF50' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '8px 0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedItems.has(item.id) ? '0 4px 12px rgba(76,175,80,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="item-checkbox" style={{ fontSize: '18px', marginTop: '2px' }}>
                    {selectedItems.has(item.id) ? '✅' : '☐'}
                  </div>
                  <div className="item-content" style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</div>
                    {item.description && (
                      <div className="item-description" style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>{item.description}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.weight && (
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{item.weight}</div>
                      )}
                      {item.price && (
                        <div className="item-price" style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatPrice(item.price)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getItemsForMeal(selectedDay, 'завтрак').length === 0 && (
              <div className="no-items" style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#666', 
                fontStyle: 'italic',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                Нет блюд для завтрака
              </div>
            )}
          </div>
        </div>

        {/* Обед */}
        <div className="meal-column" style={{ backgroundColor: getMealTypeColor('обед'), borderRadius: '10px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="meal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getMealTypeIcon('обед')} Обед
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <div className="item-count" style={{ 
                backgroundColor: '#fff', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                {getItemsForMeal(selectedDay, 'обед').length} блюд
              </div>
              {getTotalByMealType('обед') > 0 && (
                <div style={{ 
                  backgroundColor: '#2196F3', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '8px', 
                  fontSize: '11px'
                }}>
                  {getTotalByMealType('обед')} ₽
                </div>
              )}
            </div>
          </div>
          <div className="meal-items">
            {getItemsForMeal(selectedDay, 'обед').map(item => (
              <div
                key={item.id}
                className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
                style={{
                  backgroundColor: selectedItems.has(item.id) ? '#2196F3' : '#fff',
                  color: selectedItems.has(item.id) ? 'white' : 'black',
                  border: `2px solid ${selectedItems.has(item.id) ? '#2196F3' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '8px 0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedItems.has(item.id) ? '0 4px 12px rgba(33,150,243,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="item-checkbox" style={{ fontSize: '18px', marginTop: '2px' }}>
                    {selectedItems.has(item.id) ? '✅' : '☐'}
                  </div>
                  <div className="item-content" style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</div>
                    {item.description && (
                      <div className="item-description" style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>{item.description}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.weight && (
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{item.weight}</div>
                      )}
                      {item.price && (
                        <div className="item-price" style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatPrice(item.price)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getItemsForMeal(selectedDay, 'обед').length === 0 && (
              <div className="no-items" style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#666', 
                fontStyle: 'italic',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                Нет блюд для обеда
              </div>
            )}
          </div>
        </div>

        {/* Полдник */}
        <div className="meal-column" style={{ backgroundColor: getMealTypeColor('полдник'), borderRadius: '10px', padding: '15px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div className="meal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              {getMealTypeIcon('полдник')} Полдник
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
              <div className="item-count" style={{ 
                backgroundColor: '#fff', 
                padding: '4px 8px', 
                borderRadius: '12px', 
                fontSize: '12px',
                marginBottom: '4px'
              }}>
                {getItemsForMeal(selectedDay, 'полдник').length} блюд
              </div>
              {getTotalByMealType('полдник') > 0 && (
                <div style={{ 
                  backgroundColor: '#FF9800', 
                  color: 'white', 
                  padding: '2px 6px', 
                  borderRadius: '8px', 
                  fontSize: '11px'
                }}>
                  {getTotalByMealType('полдник')} ₽
                </div>
              )}
            </div>
          </div>
          <div className="meal-items">
            {getItemsForMeal(selectedDay, 'полдник').map(item => (
              <div
                key={item.id}
                className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
                style={{
                  backgroundColor: selectedItems.has(item.id) ? '#FF9800' : '#fff',
                  color: selectedItems.has(item.id) ? 'white' : 'black',
                  border: `2px solid ${selectedItems.has(item.id) ? '#FF9800' : '#ddd'}`,
                  borderRadius: '8px',
                  padding: '12px',
                  margin: '8px 0',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: selectedItems.has(item.id) ? '0 4px 12px rgba(255,152,0,0.3)' : '0 2px 4px rgba(0,0,0,0.1)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                  <div className="item-checkbox" style={{ fontSize: '18px', marginTop: '2px' }}>
                    {selectedItems.has(item.id) ? '✅' : '☐'}
                  </div>
                  <div className="item-content" style={{ flex: 1 }}>
                    <div className="item-name" style={{ fontWeight: 'bold', marginBottom: '4px' }}>{item.name}</div>
                    {item.description && (
                      <div className="item-description" style={{ fontSize: '13px', opacity: 0.8, marginBottom: '6px' }}>{item.description}</div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      {item.weight && (
                        <div style={{ fontSize: '12px', opacity: 0.7 }}>{item.weight}</div>
                      )}
                      {item.price && (
                        <div className="item-price" style={{ fontWeight: 'bold', fontSize: '14px' }}>{formatPrice(item.price)}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {getItemsForMeal(selectedDay, 'полдник').length === 0 && (
              <div className="no-items" style={{ 
                textAlign: 'center', 
                padding: '20px', 
                color: '#666', 
                fontStyle: 'italic',
                backgroundColor: '#f9f9f9',
                borderRadius: '8px',
                border: '2px dashed #ddd'
              }}>
                Нет блюд для полдника
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Кнопки управления */}
      <div style={{
        display: 'flex',
        gap: '10px',
        justifyContent: 'center',
        marginTop: '20px',
        flexWrap: 'wrap'
      }}>
        <button
          onClick={clearAllSelections}
          style={{
            padding: '10px 20px',
            backgroundColor: '#6b7280',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          🗑️ Очистить выбор
        </button>
        
        <button
          onClick={loadMenu}
          style={{
            padding: '10px 20px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600'
          }}
        >
          🔄 Обновить меню
        </button>
      </div>

      {/* Информация о выборе */}
      {selectedItems.size > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f0f9ff',
          border: '2px solid #0ea5e9',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '16px', fontWeight: '600', color: '#0c4a6e' }}>
            ✅ Выбрано блюд: {selectedItems.size}
          </div>
        </div>
      )}
    </div>
  );
}