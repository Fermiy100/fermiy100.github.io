/**
 * КОМПОНЕНТ ВЫБОРА БЛЮД
 * Удобный интерфейс для выбора блюд по дням и приемам пищи
 */

import React, { useState, useEffect } from 'react';
import { getMenuItems, updateMenuItem } from '../utils/api';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  portion: string;
  day_of_week: number;
  meal_type: string;
  school_id: number;
  week_start: string;
  recipe_number?: string;
  weight?: string;
}

interface MenuSelectorProps {
  schoolId: number;
  weekStart: string;
}

const MenuSelector: React.FC<MenuSelectorProps> = ({ schoolId, weekStart }) => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [filterDay, setFilterDay] = useState<number>(1);
  const [filterMeal, setFilterMeal] = useState<string>('завтрак');

  const daysOfWeek = [
    '', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'
  ];

  const mealTypes = [
    { key: 'завтрак', name: 'Завтрак' },
    { key: 'обед', name: 'Обед' },
    { key: 'полдник', name: 'Полдник' }
  ];

  useEffect(() => {
    loadMenuItems();
  }, [schoolId, weekStart]);

  const loadMenuItems = async () => {
    try {
      setLoading(true);
      const items = await getMenuItems(schoolId, weekStart);
      setMenuItems(items);
    } catch (error) {
      console.error('Ошибка загрузки меню:', error);
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

  const getFilteredItems = () => {
    return menuItems.filter(item => 
      item.day_of_week === filterDay && 
      item.meal_type === filterMeal
    );
  };

  const getSelectedItemsForDay = (day: number, meal: string) => {
    return menuItems.filter(item => 
      item.day_of_week === day && 
      item.meal_type === meal &&
      selectedItems.has(item.id)
    );
  };

  const getTotalSelected = () => {
    return selectedItems.size;
  };

  if (loading) {
    return (
      <div className="menu-selector">
        <div className="loading">Загрузка меню...</div>
      </div>
    );
  }

  return (
    <div className="menu-selector">
      <div className="menu-header">
        <h2>Выбор блюд на неделю</h2>
        <div className="selected-count">
          Выбрано: {getTotalSelected()} блюд
        </div>
      </div>

      {/* Фильтры */}
      <div className="menu-filters">
        <div className="filter-group">
          <label>День недели:</label>
          <select 
            value={filterDay} 
            onChange={(e) => setFilterDay(Number(e.target.value))}
            className="filter-select"
          >
            {daysOfWeek.slice(1).map((day, index) => (
              <option key={index + 1} value={index + 1}>
                {day}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Прием пищи:</label>
          <select 
            value={filterMeal} 
            onChange={(e) => setFilterMeal(e.target.value)}
            className="filter-select"
          >
            {mealTypes.map(meal => (
              <option key={meal.key} value={meal.key}>
                {meal.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Список блюд для выбора */}
      <div className="menu-items">
        <h3>
          {mealTypes.find(m => m.key === filterMeal)?.name} - {daysOfWeek[filterDay]}
        </h3>
        
        <div className="items-grid">
          {getFilteredItems().map(item => (
            <div 
              key={item.id} 
              className={`menu-item ${selectedItems.has(item.id) ? 'selected' : ''}`}
              onClick={() => toggleItemSelection(item.id)}
            >
              <div className="item-header">
                <input 
                  type="checkbox" 
                  checked={selectedItems.has(item.id)}
                  onChange={() => toggleItemSelection(item.id)}
                  className="item-checkbox"
                />
                <h4 className="item-name">{item.name}</h4>
              </div>
              
              <div className="item-details">
                {item.portion && (
                  <span className="item-portion">{item.portion}</span>
                )}
                {item.recipe_number && (
                  <span className="item-recipe">№{item.recipe_number}</span>
                )}
                {item.description && (
                  <p className="item-description">{item.description}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {getFilteredItems().length === 0 && (
          <div className="no-items">
            Нет блюд для {mealTypes.find(m => m.key === filterMeal)?.name} в {daysOfWeek[filterDay]}
          </div>
        )}
      </div>

      {/* Сводка по дням */}
      <div className="menu-summary">
        <h3>Сводка выбора</h3>
        <div className="summary-grid">
          {daysOfWeek.slice(1).map((day, dayIndex) => (
            <div key={dayIndex + 1} className="summary-day">
              <h4>{day}</h4>
              {mealTypes.map(meal => {
                const selected = getSelectedItemsForDay(dayIndex + 1, meal.key);
                return (
                  <div key={meal.key} className="summary-meal">
                    <span className="meal-name">{meal.name}</span>
                    <span className="meal-count">({selected.length})</span>
                    {selected.length > 0 && (
                      <div className="selected-items">
                        {selected.map(item => (
                          <div key={item.id} className="selected-item">
                            {item.name}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MenuSelector;
