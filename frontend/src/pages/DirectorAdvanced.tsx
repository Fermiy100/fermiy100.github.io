import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';
import MenuItemCard from '../components/MenuItemCard';

export default function DirectorAdvanced({ token: _token }: any) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [school, setSchool] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

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
        const menuData = await apiClient.getMenu(user.school_id.toString());
        setMenuItems(menuData.items || []);
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

  const handleFileUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.xlsx') && !file.name.toLowerCase().endsWith('.xls')) {
      setMsg('❌ Пожалуйста, выберите Excel файл (.xlsx или .xls)');
      return;
    }

    setUploading(true);
    setMsg('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/menu/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        setMsg(`✅ Меню загружено! Добавлено ${result.addedCount} блюд`);
        loadData();
      } else {
        const error = await response.json();
        setMsg(`❌ Ошибка загрузки: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      setMsg('❌ Ошибка при загрузке файла');
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
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

      {/* Загрузка Excel файла */}
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        marginBottom: '20px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#333' }}>
          📁 Загрузка меню
        </h2>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          style={{
            border: `3px dashed ${dragOver ? '#007bff' : '#dee2e6'}`,
            borderRadius: '12px',
            padding: '40px 20px',
            textAlign: 'center',
            backgroundColor: dragOver ? '#f8f9ff' : '#f8f9fa',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            position: 'relative'
          }}
        >
          {uploading ? (
            <div>
              <div style={{ 
                fontSize: '48px', 
                marginBottom: '20px',
                animation: 'spin 1s linear infinite'
              }}>
                ⏳
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#007bff' }}>
                Загружаем меню...
              </h3>
              <p style={{ margin: '0', color: '#666' }}>
                Пожалуйста, подождите
              </p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>
                📊
              </div>
              <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>
                Перетащите Excel файл сюда
              </h3>
              <p style={{ margin: '0 0 20px 0', color: '#666' }}>
                или нажмите для выбора файла
              </p>
              
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="file-upload"
              />
              
              <label
                htmlFor="file-upload"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'background-color 0.2s ease'
                }}
              >
                📁 Выбрать файл
              </label>
              
              <div style={{ 
                marginTop: '15px', 
                fontSize: '14px', 
                color: '#6c757d' 
              }}>
                Поддерживаются форматы: .xlsx, .xls
              </div>
            </div>
          )}
        </div>
      </div>

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
                onEdit={() => {}}
                onDelete={() => {}}
                      />
                    ))}
                  </div>
                )}
              </div>
    </div>
  );
}