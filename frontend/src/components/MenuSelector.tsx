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
      setMenuItems(data);
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
    return menuItems.filter(item => item.day_of_week === day);
  };

  const getItemsForMeal = (day: string, mealType: string) => {
    return getItemsForDay(day).filter(item => item.meal_type === mealType);
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
        <div className="meal-column">
          <div className="meal-header">
            <h3>🌅 Завтрак</h3>
            <div className="item-count">
              {getItemsForMeal(selectedDay, 'завтрак').length}
            </div>
          </div>
          <div className="meal-items">
            {getItemsForMeal(selectedDay, 'завтрак').map(item => (
              <div
                key={item.id}
                className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="item-checkbox">
                  {selectedItems.has(item.id) ? '✅' : '☐'}
                </div>
                <div className="item-content">
                  <div className="item-name">{item.name}</div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                  {item.price && (
                    <div className="item-price">{item.price} ₽</div>
                  )}
                </div>
              </div>
            ))}
            {getItemsForMeal(selectedDay, 'завтрак').length === 0 && (
              <div className="no-items">Нет блюд для завтрака</div>
            )}
          </div>
        </div>

        {/* Обед */}
        <div className="meal-column">
          <div className="meal-header">
            <h3>🍽️ Обед</h3>
            <div className="item-count">
              {getItemsForMeal(selectedDay, 'обед').length}
            </div>
          </div>
          <div className="meal-items">
            {getItemsForMeal(selectedDay, 'обед').map(item => (
              <div
                key={item.id}
                className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="item-checkbox">
                  {selectedItems.has(item.id) ? '✅' : '☐'}
                </div>
                <div className="item-content">
                  <div className="item-name">{item.name}</div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                  {item.price && (
                    <div className="item-price">{item.price} ₽</div>
                  )}
                </div>
              </div>
            ))}
            {getItemsForMeal(selectedDay, 'обед').length === 0 && (
              <div className="no-items">Нет блюд для обеда</div>
            )}
          </div>
        </div>

        {/* Полдник */}
        <div className="meal-column">
          <div className="meal-header">
            <h3>🍎 Полдник</h3>
            <div className="item-count">
              {getItemsForMeal(selectedDay, 'полдник').length}
            </div>
          </div>
          <div className="meal-items">
            {getItemsForMeal(selectedDay, 'полдник').map(item => (
              <div
                key={item.id}
                className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
                onClick={() => toggleItem(item.id)}
              >
                <div className="item-checkbox">
                  {selectedItems.has(item.id) ? '✅' : '☐'}
                </div>
                <div className="item-content">
                  <div className="item-name">{item.name}</div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                  {item.price && (
                    <div className="item-price">{item.price} ₽</div>
                  )}
                </div>
              </div>
            ))}
            {getItemsForMeal(selectedDay, 'полдник').length === 0 && (
              <div className="no-items">Нет блюд для полдника</div>
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