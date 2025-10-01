import React, { useState, useEffect } from 'react';
import { User, School, MenuItem } from '../utils/auth';
import { apiClient } from '../utils/api';
import MenuItemCard from '../components/MenuItemCard';

export default function DirectorAdvanced({ token: _token }: any) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [school, setSchool] = useState<School | null>(null);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Загружаем данные при входе
  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      
      // Загружаем текущего пользователя
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);
      
      // Загружаем информацию о школе
      if (user.school_id) {
        const schoolData = await apiClient.getSchool(user.school_id);
        setSchool(schoolData);
        
        // Загружаем меню
        const menuData = await apiClient.getMenu(user.school_id);
        setMenuItems(menuData);
      }
    } catch (error: any) {
      setMsg(`❌ Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const clearAllMenu = async () => {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ блюда из меню?')) {
      return;
    }
    
    try {
      const response = await fetch('/api/menu/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMsg(`✅ Удалено ${result.deletedCount} блюд из меню`);
        loadData();
      } else {
        const error = await response.json();
        setMsg(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка очистки меню:', error);
      setMsg('❌ Ошибка при удалении блюд');
    }
  };

  const bulkDelete = async () => {
    if (bulkSelected.size === 0) {
      setMsg('❌ Выберите блюда для удаления');
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
        body: JSON.stringify({ ids: Array.from(bulkSelected) })
      });

      if (response.ok) {
        const result = await response.json();
        setMsg(`✅ Удалено ${result.deletedCount} блюд`);
        setBulkSelected(new Set());
        setShowBulkActions(false);
        loadData();
      } else {
        const error = await response.json();
        setMsg(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      setMsg('❌ Ошибка при удалении блюд');
    }
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
    const allIds = new Set(menuItems.map(item => item.id));
    setBulkSelected(allIds);
  };

  const clearBulkSelection = () => {
    setBulkSelected(new Set());
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px'
      }}>
        Загрузка...
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'DIRECTOR') {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: 'red'
      }}>
        ❌ Доступ запрещен
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ margin: '0 0 10px 0', color: '#333' }}>
          Панель директора
        </h1>
        <p style={{ margin: '0', color: '#666' }}>
          Школа: {school?.name || 'Не указана'}
        </p>
      </div>

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

      {/* Панель управления меню */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          Управление меню
        </h2>
        
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
          <button
            onClick={clearAllMenu}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🗑️ Удалить все блюда
          </button>

          <button
            onClick={() => setShowBulkActions(!showBulkActions)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            📋 Массовые операции
          </button>
        </div>

        {showBulkActions && (
          <div style={{
            background: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '16px' }}>
              Массовые операции ({bulkSelected.size} выбрано)
            </h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <button
                onClick={selectAllVisible}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Выбрать все
              </button>

              <button
                onClick={clearBulkSelection}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Очистить выбор
              </button>

              <button
                onClick={bulkDelete}
                disabled={bulkSelected.size === 0}
                style={{
                  padding: '8px 16px',
                  backgroundColor: bulkSelected.size > 0 ? '#dc3545' : '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: bulkSelected.size > 0 ? 'pointer' : 'not-allowed',
                  fontSize: '14px'
                }}
              >
                Удалить выбранные
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Список блюд */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          Блюда в меню ({menuItems.length})
        </h2>

        {menuItems.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: '40px' }}>
            Меню пусто. Загрузите Excel файл с меню.
          </p>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {menuItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                showBulkSelection={showBulkActions}
                isBulkSelected={bulkSelected.has(item.id)}
                onBulkSelect={() => toggleBulkSelection(item.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}