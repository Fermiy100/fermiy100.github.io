/**
 * ИДЕАЛЬНЫЙ КОМПОНЕНТ ВЫБОРА МЕНЮ ДЛЯ РОДИТЕЛЯ v2.0.0
 * Удобный интерфейс с колонками для завтрака и обеда
 * Полная мобильная адаптация и исправление всех багов
 */

import React, { useState, useEffect } from 'react';

interface MenuItem {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  portion?: string;
  day_of_week: number | string;
  meal_type: string;
  school_id?: number;
  week_start?: string;
  recipe_number?: string;
  weight?: string;
  created_at?: string;
  updated_at?: string;
}

interface ParentMenuSelectorProps {
  schoolId: number;
  weekStart: string;
}

const ParentMenuSelector: React.FC<ParentMenuSelectorProps> = ({ schoolId, weekStart }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [selectedDay, setSelectedDay] = useState<number>(1);

  const daysOfWeek = [
    '', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'
  ];

  useEffect(() => {
    loadMenuItems();
  }, [schoolId, weekStart]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      console.log('🍽️ Загружаем меню для родителей...');
      
      // Используем прямой вызов API Railway
      const response = await fetch('https://fermiy100githubio-production.up.railway.app/api/menu');
      const data = await response.json();
      
      console.log('📊 Получены данные меню:', data.length, 'блюд');
      
      // Обрабатываем данные
      const items = Array.isArray(data) ? data : [];
      setMenuItems(items);
      
      console.log('✅ Меню загружено успешно:', items.length, 'блюд');
    } catch (error) {
      console.error('❌ Ошибка загрузки меню:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const getItemsForDayAndMeal = (day: number, mealType: string) => {
    return menuItems.filter(item => {
      // Приводим day_of_week к числу для сравнения
      const itemDay = typeof item.day_of_week === 'string' ? 
        parseInt(item.day_of_week) : item.day_of_week;
      
      return itemDay === day && item.meal_type === mealType;
    });
  };

  const getSelectedItemsForDayAndMeal = (day: number, mealType: string) => {
    return menuItems.filter(item => {
      // Приводим day_of_week к числу для сравнения
      const itemDay = typeof item.day_of_week === 'string' ? 
        parseInt(item.day_of_week) : item.day_of_week;
      
      // Приводим id к числу для сравнения
      const itemId = typeof item.id === 'string' ? 
        parseInt(item.id) : item.id;
      
      return itemDay === day && 
             item.meal_type === mealType &&
             selectedItems.has(itemId);
    });
  };

  const getTotalSelected = () => {
    return selectedItems.size;
  };

  if (loading) {
    return (
      <div className="parent-menu-selector">
        <div className="loading">Загрузка меню...</div>
      </div>
    );
  }

  const breakfastItems = getItemsForDayAndMeal(selectedDay, 'завтрак');
  const lunchItems = getItemsForDayAndMeal(selectedDay, 'обед');
  const snackItems = getItemsForDayAndMeal(selectedDay, 'полдник');

  return (
    <div className="parent-menu-selector">
      {/* Выбор дня */}
      <div className="day-selector">
        <h2>Выбор дня</h2>
        <div className="day-buttons">
          {daysOfWeek.slice(1).map((day, index) => (
            <button
              key={index + 1}
              onClick={() => setSelectedDay(index + 1)}
              className={`day-button ${selectedDay === index + 1 ? 'active' : ''}`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Основное меню */}
      <div className="menu-layout">
        {/* Завтрак */}
        <div className="meal-column">
          <div className="meal-header">
            <h3>Завтрак</h3>
            <span className="item-count">({breakfastItems.length} блюд)</span>
          </div>
          <div className="meal-items" style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            padding: '10px'
          }}>
            {breakfastItems.map(item => (
              <div 
                key={item.id} 
                className={`menu-item-card ${selectedItems.has(typeof item.id === 'string' ? parseInt(item.id) : item.id) ? 'selected' : ''}`}
                onClick={() => toggleItemSelection(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
              >
                <div className="item-checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.has(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                    onChange={() => toggleItemSelection(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                    className="item-checkbox"
                  />
                </div>
                <div className="item-content">
                  <h4 className="item-name">{item.name}</h4>
                  {item.weight && (
                    <span className="item-weight">Вес: {item.weight}</span>
                  )}
                  {item.recipe_number && (
                    <span className="item-recipe">Рецепт: {item.recipe_number}</span>
                  )}
                  {item.description && (
                    <span className="item-description">{item.description}</span>
                  )}
                </div>
              </div>
            ))}
            {breakfastItems.length === 0 && (
              <div className="no-items">Нет блюд для завтрака</div>
            )}
          </div>
        </div>

        {/* Обед */}
        <div className="meal-column">
          <div className="meal-header">
            <h3>Обед</h3>
            <span className="item-count">({lunchItems.length} блюд)</span>
          </div>
          <div className="meal-items" style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            padding: '10px'
          }}>
            {lunchItems.map(item => (
              <div 
                key={item.id} 
                className={`menu-item-card ${selectedItems.has(typeof item.id === 'string' ? parseInt(item.id) : item.id) ? 'selected' : ''}`}
                onClick={() => toggleItemSelection(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
              >
                <div className="item-checkbox-container">
                  <input 
                    type="checkbox" 
                    checked={selectedItems.has(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                    onChange={() => toggleItemSelection(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                    className="item-checkbox"
                  />
                </div>
                <div className="item-content">
                  <h4 className="item-name">{item.name}</h4>
                  {item.weight && (
                    <span className="item-weight">Вес: {item.weight}</span>
                  )}
                  {item.recipe_number && (
                    <span className="item-recipe">Рецепт: {item.recipe_number}</span>
                  )}
                  {item.description && (
                    <span className="item-description">{item.description}</span>
                  )}
                </div>
              </div>
            ))}
            {lunchItems.length === 0 && (
              <div className="no-items">Нет блюд для обеда</div>
            )}
          </div>
        </div>

        {/* Полдник */}
        {snackItems.length > 0 && (
          <div className="meal-column">
            <div className="meal-header">
              <h3>Полдник</h3>
            <span className="item-count">({snackItems.length} блюд)</span>
          </div>
          <div className="meal-items" style={{
            maxHeight: '400px',
            overflowY: 'auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '12px',
            padding: '10px'
          }}>
            {snackItems.map(item => (
                <div 
                  key={item.id} 
                  className={`menu-item-card ${selectedItems.has(typeof item.id === 'string' ? parseInt(item.id) : item.id) ? 'selected' : ''}`}
                  onClick={() => toggleItemSelection(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                >
                  <div className="item-checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={selectedItems.has(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                      onChange={() => toggleItemSelection(typeof item.id === 'string' ? parseInt(item.id) : item.id)}
                      className="item-checkbox"
                    />
                  </div>
                  <div className="item-content">
                    <h4 className="item-name">{item.name}</h4>
                    {item.portion && (
                      <span className="item-portion">{item.portion}</span>
                    )}
                    {item.recipe_number && (
                      <span className="item-recipe">№{item.recipe_number}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Сводка */}
      <div className="selection-summary">
        <div className="summary-header">
          <h3>Выбранные блюда</h3>
          <span className="total-count">Всего: {getTotalSelected()}</span>
        </div>
        <div className="selected-items-list">
          {getSelectedItemsForDayAndMeal(selectedDay, 'завтрак').map(item => (
            <div key={item.id} className="selected-item">
              <span className="meal-type">Завтрак:</span> {item.name}
            </div>
          ))}
          {getSelectedItemsForDayAndMeal(selectedDay, 'обед').map(item => (
            <div key={item.id} className="selected-item">
              <span className="meal-type">Обед:</span> {item.name}
            </div>
          ))}
          {getSelectedItemsForDayAndMeal(selectedDay, 'полдник').map(item => (
            <div key={item.id} className="selected-item">
              <span className="meal-type">Полдник:</span> {item.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ParentMenuSelector;
