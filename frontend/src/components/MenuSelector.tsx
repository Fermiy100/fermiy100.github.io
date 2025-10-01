/**
 * КОМПОНЕНТ ВЫБОРА БЛЮД
 * Удобный интерфейс для выбора блюд по дням и приемам пищи
 */

import React, { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  portion?: string;
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
  // const [showAddForm, setShowAddForm] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [stats, setStats] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
  const [calculatorData, setCalculatorData] = useState<any>(null);
  const [showFavorites, setShowFavorites] = useState(false);
  const [favorites, setFavorites] = useState<MenuItem[]>([]);
  // const [showExport, setShowExport] = useState(false);
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

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
      const response = await apiClient.getMenu(weekStart);
      const items = response.items;
      setMenuItems(items);
    } catch (error) {
      console.error('Ошибка загрузки меню:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearAllMenu = async () => {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ блюда из меню?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/menu/clear?week=${weekStart}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Удалено ${result.deletedCount} блюд из меню`);
        loadMenuItems();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка очистки меню:', error);
      alert('Ошибка при удалении блюд');
    }
  };

  const deleteMenuItem = async (id: number) => {
    if (!confirm('Удалить это блюдо?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        alert('Блюдо удалено');
        loadMenuItems();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка удаления блюда:', error);
      alert('Ошибка при удалении блюда');
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`/api/menu/stats?week=${weekStart}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const statsData = await response.json();
        setStats(statsData);
        setShowStats(true);
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      alert('Ошибка при загрузке статистики');
    }
  };

  const searchMenu = async () => {
    try {
      const params = new URLSearchParams({
        week: weekStart,
        ...(searchQuery && { query: searchQuery }),
        ...(filterMeal && { meal_type: filterMeal }),
        ...(filterDay && { day_of_week: filterDay.toString() })
      });

      const response = await fetch(`/api/menu/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMenuItems(data.items);
      } else {
        const error = await response.json();
        alert(`Ошибка поиска: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
      alert('Ошибка при поиске');
    }
  };

  const calculateCost = async () => {
    try {
      const selectedArray = Array.from(selectedItems);
      const params = new URLSearchParams({
        week: weekStart,
        selected_items: JSON.stringify(selectedArray)
      });

      const response = await fetch(`/api/menu/calculator?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCalculatorData(data);
        setShowCalculator(true);
      } else {
        const error = await response.json();
        alert(`Ошибка расчета: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка расчета:', error);
      alert('Ошибка при расчете стоимости');
    }
  };

  const loadFavorites = async () => {
    try {
      const response = await fetch('/api/favorites', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setFavorites(data.favorites);
        setShowFavorites(true);
      } else {
        const error = await response.json();
        alert(`Ошибка загрузки избранного: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки избранного:', error);
      alert('Ошибка при загрузке избранного');
    }
  };

  const addToFavorites = async (itemId: number) => {
    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ menu_item_id: itemId })
      });
      
      if (response.ok) {
        alert('Блюдо добавлено в избранное');
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка добавления в избранное:', error);
      alert('Ошибка при добавлении в избранное');
    }
  };

  const exportMenu = async () => {
    try {
      const response = await fetch(`/api/menu/export?week=${weekStart}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `menu_${weekStart}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert('Меню экспортировано в Excel');
      } else {
        const error = await response.json();
        alert(`Ошибка экспорта: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      alert('Ошибка при экспорте');
    }
  };

  const bulkDelete = async () => {
    if (bulkSelected.size === 0) {
      alert('Выберите блюда для удаления');
      return;
    }

    if (!confirm(`Удалить ${bulkSelected.size} выбранных блюд?`)) {
      return;
    }

    try {
      const response = await fetch('/api/menu/bulk-delete', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          week: weekStart,
          ids: Array.from(bulkSelected)
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`Удалено ${result.deletedCount} блюд`);
        setBulkSelected(new Set());
        setShowBulkActions(false);
        loadMenuItems();
      } else {
        const error = await response.json();
        alert(`Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      alert('Ошибка при массовом удалении');
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

  const toggleBulkSelection = (itemId: number) => {
    const newSelected = new Set(bulkSelected);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setBulkSelected(newSelected);
  };

  const selectAllVisible = () => {
    const visibleItems = getFilteredItems();
    const newSelected = new Set(bulkSelected);
    visibleItems.forEach(item => newSelected.add(item.id));
    setBulkSelected(newSelected);
  };

  const clearBulkSelection = () => {
    setBulkSelected(new Set());
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

      {/* Кнопки управления */}
      <div className="menu-controls">
        <button onClick={clearAllMenu} className="btn btn-danger">
          🗑️ Удалить все блюда
        </button>
        <button onClick={loadStats} className="btn btn-info">
          📊 Статистика
        </button>
        <button onClick={() => setShowSearch(!showSearch)} className="btn btn-warning">
          🔍 Поиск
        </button>
        <button onClick={calculateCost} className="btn btn-primary">
          💰 Калькулятор
        </button>
        <button onClick={loadFavorites} className="btn btn-success">
          ⭐ Избранное
        </button>
        <button onClick={exportMenu} className="btn btn-secondary">
          📤 Экспорт Excel
        </button>
        <button onClick={() => setShowBulkActions(!showBulkActions)} className="btn btn-dark">
          📋 Массовые операции
        </button>
      </div>

      {/* Поиск */}
      {showSearch && (
        <div className="search-panel">
          <div className="search-controls">
            <input
              type="text"
              placeholder="Поиск по названию или описанию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button onClick={searchMenu} className="btn btn-primary">
              🔍 Найти
            </button>
            <button onClick={() => {
              setSearchQuery('');
              loadMenuItems();
            }} className="btn btn-secondary">
              🔄 Сбросить
            </button>
          </div>
        </div>
      )}

      {/* Массовые операции */}
      {showBulkActions && (
        <div className="bulk-actions-panel">
          <div className="bulk-controls">
            <button onClick={selectAllVisible} className="btn btn-sm btn-primary">
              ✅ Выбрать все видимые
            </button>
            <button onClick={clearBulkSelection} className="btn btn-sm btn-secondary">
              ❌ Очистить выбор
            </button>
            <button onClick={bulkDelete} className="btn btn-sm btn-danger">
              🗑️ Удалить выбранные ({bulkSelected.size})
            </button>
          </div>
        </div>
      )}

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
                <div className="item-actions">
                  {showBulkActions && (
                    <input
                      type="checkbox"
                      checked={bulkSelected.has(item.id)}
                      onChange={() => toggleBulkSelection(item.id)}
                      className="bulk-checkbox"
                      title="Выбрать для массовых операций"
                    />
                  )}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      addToFavorites(item.id);
                    }}
                    className="btn-favorite"
                    title="Добавить в избранное"
                  >
                    ⭐
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMenuItem(item.id);
                    }}
                    className="btn-delete"
                    title="Удалить блюдо"
                  >
                    ❌
                  </button>
                </div>
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

      {/* Модальное окно статистики */}
      {showStats && stats && (
        <div className="modal-overlay" onClick={() => setShowStats(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>📊 Статистика меню</h3>
            <div className="stats-grid">
              <div className="stat-item">
                <h4>Всего блюд</h4>
                <p>{stats.totalDishes}</p>
              </div>
              <div className="stat-item">
                <h4>Средняя цена</h4>
                <p>{stats.averagePrice} ₽</p>
              </div>
              <div className="stat-item">
                <h4>Общая стоимость</h4>
                <p>{stats.totalPrice} ₽</p>
              </div>
            </div>
            <button onClick={() => setShowStats(false)} className="btn btn-primary">
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно калькулятора */}
      {showCalculator && calculatorData && (
        <div className="modal-overlay" onClick={() => setShowCalculator(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>💰 Калькулятор стоимости</h3>
            <div className="calculator-grid">
              <div className="calc-item">
                <h4>Выбрано блюд</h4>
                <p>{calculatorData.items}</p>
              </div>
              <div className="calc-item">
                <h4>Общая стоимость</h4>
                <p className="total-cost">{calculatorData.total} ₽</p>
              </div>
            </div>
            <div className="cost-breakdown">
              <h4>Разбивка по дням:</h4>
              {Object.entries(calculatorData.byDay).map(([day, cost]) => (
                <div key={day} className="day-cost">
                  <span>{daysOfWeek[parseInt(day)]}:</span>
                  <span>{cost as number} ₽</span>
                </div>
              ))}
            </div>
            <button onClick={() => setShowCalculator(false)} className="btn btn-primary">
              Закрыть
            </button>
          </div>
        </div>
      )}

      {/* Модальное окно избранного */}
      {showFavorites && (
        <div className="modal-overlay" onClick={() => setShowFavorites(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>⭐ Избранные блюда</h3>
            <div className="favorites-list">
              {favorites.length === 0 ? (
                <p>Нет избранных блюд</p>
              ) : (
                favorites.map(item => (
                  <div key={item.id} className="favorite-item">
                    <h4>{item.name}</h4>
                    <p>{item.meal_type} - {daysOfWeek[item.day_of_week]}</p>
                    <p className="price">{item.price} ₽</p>
                  </div>
                ))
              )}
            </div>
            <button onClick={() => setShowFavorites(false)} className="btn btn-primary">
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuSelector;
