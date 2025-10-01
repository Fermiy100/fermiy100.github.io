import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

interface MenuSelectorProps {
  schoolId: number;
}

export default function MenuSelector({ schoolId }: MenuSelectorProps) {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [filterDay, setFilterDay] = useState<number>(1);
  const [filterMeal, setFilterMeal] = useState<string>('завтрак');
  const [msg, setMsg] = useState('');

  const daysOfWeek = [
    '', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'
  ];

  const mealTypes = ['завтрак', 'обед', 'полдник'];

  useEffect(() => {
    loadMenu();
  }, [schoolId]);

  const loadMenu = async () => {
    try {
      setLoading(true);
      const data = await apiClient.getMenu(schoolId.toString());
      setMenuItems(data.items || []);
    } catch (error: any) {
      setMsg(`❌ Ошибка загрузки меню: ${error.message}`);
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

  const clearAllSelections = () => {
    setSelectedItems(new Set());
    setMsg('✅ Выбор очищен');
  };

  const getFilteredItems = () => {
    return menuItems.filter(item => 
      item.day_of_week === filterDay && 
      item.meal_type === filterMeal
    );
  };

  const getTotalCost = () => {
    return Array.from(selectedItems).reduce((total, itemId) => {
      const item = menuItems.find(i => i.id === itemId);
      return total + (item?.price || 0);
    }, 0);
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '200px',
        fontSize: '18px'
      }}>
        Загрузка меню...
      </div>
    );
  }

  const filteredItems = getFilteredItems();

  return (
    <div className="parent-menu-selector">
      {msg && (
        <div style={{
          background: msg.includes('❌') ? '#fee' : '#efe',
          border: `1px solid ${msg.includes('❌') ? '#fcc' : '#cfc'}`,
          borderRadius: '8px',
          padding: '15px',
          marginBottom: '20px',
          color: msg.includes('❌') ? '#c33' : '#363'
        }}>
          {msg}
        </div>
      )}

      {/* Выбор дня недели */}
      <div className="day-selector">
        <h2>Выберите день недели</h2>
        <div className="day-buttons">
          {[1, 2, 3, 4, 5].map(day => (
            <button
              key={day}
              onClick={() => setFilterDay(day)}
              className={filterDay === day ? 'active' : ''}
            >
              {daysOfWeek[day].slice(0, 2)}
            </button>
          ))}
        </div>
      </div>

      {/* Выбор приема пищи */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>
          Выберите прием пищи
        </h3>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {mealTypes.map(meal => (
            <button
              key={meal}
              onClick={() => setFilterMeal(meal)}
              style={{
                padding: '10px 20px',
                backgroundColor: filterMeal === meal ? '#007bff' : '#f8f9fa',
                color: filterMeal === meal ? 'white' : '#333',
                border: '1px solid #dee2e6',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                textTransform: 'capitalize'
              }}
            >
              {meal}
            </button>
          ))}
        </div>
      </div>

      {/* Меню на выбранный день и прием пищи */}
      <div className="menu-layout">
        <div className="meal-column">
          <div className="meal-header">
            <h3>{mealTypes.find(m => m === filterMeal)}</h3>
            <div className="item-count">
              {filteredItems.length} блюд
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <p style={{ 
              color: '#666', 
              textAlign: 'center', 
              padding: '40px',
              fontStyle: 'italic'
            }}>
              Нет блюд для {daysOfWeek[filterDay]} - {filterMeal}
            </p>
          ) : (
            <div style={{ display: 'grid', gap: '10px' }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleItemSelection(item.id)}
                  style={{
                    background: selectedItems.has(item.id) ? '#e3f2fd' : 'white',
                    border: `2px solid ${selectedItems.has(item.id) ? '#2196f3' : '#e0e0e0'}`,
                    borderRadius: '8px',
                    padding: '15px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: '0 0 5px 0', color: '#333' }}>
                        {item.name}
                      </h4>
                      {item.description && (
                        <p style={{ margin: '0', color: '#666', fontSize: '14px' }}>
                          {item.description}
                        </p>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        color: '#2196f3' 
                      }}>
                        {item.price} ₽
                      </div>
                      {selectedItems.has(item.id) && (
                        <div style={{ 
                          fontSize: '12px', 
                          color: '#2196f3',
                          fontWeight: '600'
                        }}>
                          ✓ Выбрано
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Панель выбранных блюд */}
      {selectedItems.size > 0 && (
        <div style={{
          background: 'white',
          border: '2px solid #4caf50',
          borderRadius: '12px',
          padding: '20px',
          marginTop: '20px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h3 style={{ margin: '0', color: '#333' }}>
              Выбранные блюда ({selectedItems.size})
            </h3>
            <button
              onClick={clearAllSelections}
              style={{
                padding: '8px 16px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Очистить выбор
            </button>
          </div>

          <div style={{ display: 'grid', gap: '10px', marginBottom: '15px' }}>
            {Array.from(selectedItems).map(itemId => {
              const item = menuItems.find(i => i.id === itemId);
              if (!item) return null;
              
              return (
                <div key={itemId} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  background: '#f8f9fa',
                  borderRadius: '6px'
                }}>
                  <span style={{ fontWeight: '600' }}>{item.name}</span>
                  <span style={{ color: '#4caf50', fontWeight: 'bold' }}>
                    {item.price} ₽
                  </span>
                </div>
              );
            })}
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '15px',
            background: '#4caf50',
            borderRadius: '8px',
            color: 'white'
          }}>
            <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
              Итого:
            </span>
            <span style={{ fontSize: '24px', fontWeight: 'bold' }}>
              {getTotalCost()} ₽
            </span>
          </div>
        </div>
      )}
    </div>
  );
}