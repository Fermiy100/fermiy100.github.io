import { useState, useEffect } from "react";
import { apiClient, User, MenuItem, School } from "../utils/api";
import UserManagement from "./UserManagement";
import MenuItemEditor from "../components/MenuItemEditor";
import MenuItemCard from "../components/MenuItemCard";
import AddItemForm from "../components/AddItemForm";

export default function DirectorAdvanced({ token: _token }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'users'>('menu');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [_school, setSchool] = useState<School | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [menuView, setMenuView] = useState<'grid' | 'list'>('grid');
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());

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
        const menuData = await apiClient.getMenu();
        // API теперь возвращает прямой массив блюд
        setMenuItems(Array.isArray(menuData) ? menuData : menuData.items || []);
      }
    } catch (error: any) {
      setMsg(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setMsg("Выберите файл");
      return;
    }

    try {
      setLoading(true);
      setUploadProgress(0);
      setMsg("📤 Загружаем файл...");

      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("https://fermiy100githubio-production.up.railway.app/api/menu", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        setMsg(`Меню загружено! Добавлено ${result.addedCount} блюд`);
        setFile(null);
        loadData();
      } else {
        const error = await response.json();
        setMsg(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error("Ошибка загрузки:", error);
      setMsg("❌ Ошибка при загрузке файла");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  const clearAllMenu = async () => {
    if (!confirm('Вы уверены, что хотите удалить ВСЕ блюда из меню?')) {
      return;
    }
    
    try {
      const response = await fetch('https://fermiy100githubio-production.up.railway.app/api/menu/clear', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMsg(`✅ Удалено ${result.deletedCount} блюд из меню`);
        // Принудительно очищаем состояние
        setMenuItems([]);
        setBulkSelected(new Set());
        // Затем загружаем актуальные данные
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

  const deleteSelectedItems = async () => {
    if (bulkSelected.size === 0) {
      setMsg('❌ Выберите блюда для удаления');
      return;
    }

    if (!confirm(`Удалить ${bulkSelected.size} выбранных блюд?`)) {
      return;
    }

    try {
      const response = await fetch('/api/menu/bulk-delete.php', {
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
        loadData();
      } else {
        const error = await response.json();
        setMsg(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      setMsg('❌ Ошибка при удалении');
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

  const selectAllItems = () => {
    const allIds = new Set(menuItems.map(item => item.id));
    setBulkSelected(allIds);
  };

  const clearSelection = () => {
    setBulkSelected(new Set());
  };

  const handleAddItem = async (formData: any) => {
    try {
      await apiClient.addMenuItem(formData);
      setMsg(`✅ Блюдо "${formData.name}" добавлено`);
      setShowAddForm(false);
      loadData(); // Перезагружаем данные
    } catch (error: any) {
      setMsg(`❌ Ошибка добавления: ${error.message}`);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Удалить это блюдо?')) {
      return;
    }
    
    try {
      await apiClient.deleteMenuItem(itemId);
      setMsg('✅ Блюдо удалено');
      loadData(); // Перезагружаем данные
    } catch (error: any) {
      setMsg(`❌ Ошибка при удалении блюда: ${error.message}`);
    }
  };

  if (loading && !menuItems.length) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div>⏳ Загружаем данные...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
      <h1>Панель директора</h1>
      
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

      {/* Навигация */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: '10px 20px',
            marginRight: '10px',
            backgroundColor: activeTab === 'menu' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'menu' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Меню
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '10px 20px',
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Пользователи
        </button>
      </div>

      {activeTab === 'menu' && (
        <div>
          {/* Загрузка файла */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>📤 Загрузить меню из Excel</h3>
            
            <form onSubmit={handleFileUpload}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px'
                  }}
                />
                <button
                  type="submit"
                  disabled={loading || !file}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: loading ? '#6b7280' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Загружаем...' : 'Загрузить'}
                </button>
              </div>
              
              {uploadProgress > 0 && (
                <div style={{ marginBottom: '10px' }}>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${uploadProgress}%`,
                      height: '100%',
                      backgroundColor: '#3b82f6',
                      transition: 'width 0.3s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '5px' }}>
                    {uploadProgress}%
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Управление меню */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>⚙️ Управление меню</h3>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
              <button
                onClick={() => setShowAddForm(true)}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#10b981',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Добавить блюдо
              </button>
              
              <button
                onClick={clearAllMenu}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Удалить все
              </button>
              
              <button
                onClick={() => setMenuView(menuView === 'grid' ? 'list' : 'grid')}
                style={{
                  padding: '10px 15px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                {menuView === 'grid' ? '📋 Список' : '🔲 Сетка'}
              </button>
            </div>

            {/* Массовые операции */}
            {bulkSelected.size > 0 && (
              <div style={{
                padding: '15px',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                marginBottom: '20px',
                border: '2px solid #3b82f6'
              }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>
                    Выбрано: {bulkSelected.size} блюд
                  </span>
                  
                  <button
                    onClick={deleteSelectedItems}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    🗑️ Удалить выбранные
                  </button>
                  
                  <button
                    onClick={clearSelection}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#6b7280',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '14px'
                    }}
                  >
                    ❌ Отменить выбор
                  </button>
                </div>
              </div>
            )}

            {/* Кнопки выбора */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={selectAllItems}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✅ Выбрать все
              </button>
              
              <button
                onClick={clearSelection}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#6b7280',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ❌ Снять выбор
              </button>
            </div>
          </div>

          {/* Список блюд */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>
              🍽️ Блюда меню ({menuItems.length})
            </h3>
            
            {menuItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                📋 Меню пусто. Загрузите файл Excel или добавьте блюда вручную.
              </div>
            ) : (
              <div style={{
                display: menuView === 'grid' ? 'grid' : 'block',
                gridTemplateColumns: menuView === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
                gap: '15px'
              }}>
                {menuItems.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onEdit={setEditingItem}
                    onDelete={() => handleDeleteItem(item.id)}
                    showBulkSelection={true}
                    isBulkSelected={bulkSelected.has(item.id)}
                    onBulkSelect={() => toggleBulkSelection(item.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'users' && currentUser && (
        <UserManagement 
          currentUser={currentUser} 
          onUserCreated={() => {
            setMsg('✅ Пользователь создан');
          }}
        />
      )}

      {/* Форма добавления блюда */}
      {showAddForm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ margin: '0 0 20px 0' }}>➕ Добавить новое блюдо</h3>
            
            <AddItemForm 
              onAdd={handleAddItem}
              onCancel={() => setShowAddForm(false)}
            />
          </div>
        </div>
      )}

      {/* Модальные окна */}
      {editingItem && (
        <MenuItemEditor
          item={editingItem}
          onSave={async (updatedItem) => {
            setMenuItems(prev => prev.map(item => 
              item.id === editingItem.id ? { ...item, ...updatedItem } : item
            ));
            setEditingItem(null);
            setMsg('✅ Блюдо обновлено');
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}

      {showAddForm && (
        <MenuItemEditor
          item={undefined}
          onSave={async (newItem) => {
            const itemWithId = { ...newItem, id: Date.now(), school_id: currentUser?.school_id || 0, week_start: new Date().toISOString().split('T')[0] };
            setMenuItems(prev => [...prev, itemWithId]);
            setShowAddForm(false);
            setMsg('✅ Блюдо добавлено');
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}
    </div>
  );
}