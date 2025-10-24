доimport { useState, useEffect } from "react";
import { apiClient, User, MenuItem, School } from "./api";
import UserManagement from "./UserManagement";
import ProfileSettings from "./ProfileSettings";

export default function DirectorAdvanced({ token: _token }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string>("");
  const [msg, setMsg] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'users' | 'profile'>('menu');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [_school, setSchool] = useState<School | null>(null);
  const [menuView, setMenuView] = useState<'grid' | 'list'>('grid');
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());

  // Загружаем данные при входе
  useEffect(() => {
    // Отключаем автоматическую загрузку меню
    // loadData();
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
           const items = Array.isArray(menuData) ? menuData : menuData.items || [];
           // Фильтруем undefined/null элементы
           setMenuItems(items.filter(item => item && item.id));
          setBulkSelected(new Set());
      }
    } catch (error: any) {
      setMsg(`Ошибка загрузки: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  const validateFile = (f: File | null): string => {
    if (!f) return 'Файл не выбран';
    const allowed = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const ext = f.name.toLowerCase().split('.').pop() || '';
    const allowedExt = ['xlsx','xls'];
    if (!allowed.includes(f.type) && !allowedExt.includes(ext)) return 'Некорректный формат файла. Допустимы .xlsx или .xls';
    const maxSizeMb = 10;
    if (f.size > maxSizeMb * 1024 * 1024) return `Слишком большой файл (> ${maxSizeMb} МБ)`;
    return '';
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateFile(file);
    if (err) { setFileError(err); setMsg(`❌ ${err}`); return; }

    try {
      setLoading(true);
      setUploadProgress(0);
      setMsg("📤 Загружаем файл...");

      const formData = new FormData();
      formData.append("file", file!);

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
        setFileError("");
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
      setActionLoading(true);
      const response = await fetch('/api/menu/clear.php', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        setMsg(`✅ Удалено ${result.deletedCount} блюд из меню`);
        setMenuItems([]);
        setBulkSelected(new Set());
        loadData();
      } else {
        const error = await response.json();
        setMsg(`❌ Ошибка: ${error.error}`);
      }
    } catch (error) {
      console.error('Ошибка очистки меню:', error);
      setMsg('❌ Ошибка при удалении блюд');
    } finally {
      setActionLoading(false);
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
      setMenuItems(prev => prev.filter(item => item && !bulkSelected.has(item.id)));
      const optimisticCount = bulkSelected.size;
      setMsg(`⏳ Удаляем ${optimisticCount} блюд...`);
      setActionLoading(true);
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
        loadData();
      }
    } catch (error) {
      console.error('Ошибка массового удаления:', error);
      setMsg('❌ Ошибка при удалении');
      loadData();
    } finally {
      setActionLoading(false);
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
    if (!menuItems.length) return;
    const allIds = new Set(menuItems.filter(item => item && item.id).map(item => item.id));
    setBulkSelected(allIds);
  };

  const clearSelection = () => {
    setBulkSelected(new Set());
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm('Удалить это блюдо?')) {
      return;
    }
    
    try {
      setMenuItems(prev => prev.filter(item => item && item.id !== itemId));
      setActionLoading(true);
      await apiClient.deleteMenuItem(itemId);
      setMsg('✅ Блюдо удалено');
      loadData();
    } catch (error: any) {
      setMsg(`❌ Ошибка при удалении блюда: ${error.message}`);
      loadData();
    } finally {
      setActionLoading(false);
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
    <div style={{ 
      maxWidth: '1200px', 
      margin: '0 auto', 
      padding: window.innerWidth <= 768 ? '10px' : '20px',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <h1 style={{
        fontSize: window.innerWidth <= 768 ? '1.5rem' : '2rem',
        textAlign: window.innerWidth <= 768 ? 'center' : 'left',
        marginBottom: window.innerWidth <= 768 ? '15px' : '20px'
      }}>
        Панель директора
      </h1>
      
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
      <div style={{ 
        marginBottom: '20px',
        display: 'flex',
        flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
        gap: window.innerWidth <= 768 ? '10px' : '0'
      }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            padding: window.innerWidth <= 768 ? '15px 20px' : '10px 20px',
            marginRight: window.innerWidth <= 768 ? '0' : '10px',
            backgroundColor: activeTab === 'menu' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'menu' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: window.innerWidth <= 768 ? '16px' : '14px',
            minHeight: window.innerWidth <= 768 ? '44px' : 'auto',
            width: window.innerWidth <= 768 ? '100%' : 'auto'
          }}
        >
          Меню
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: window.innerWidth <= 768 ? '15px 20px' : '10px 20px',
            marginRight: window.innerWidth <= 768 ? '0' : '10px',
            backgroundColor: activeTab === 'users' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'users' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: window.innerWidth <= 768 ? '16px' : '14px',
            minHeight: window.innerWidth <= 768 ? '44px' : 'auto',
            width: window.innerWidth <= 768 ? '100%' : 'auto'
          }}
        >
          Пользователи
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          style={{
            padding: window.innerWidth <= 768 ? '15px 20px' : '10px 20px',
            backgroundColor: activeTab === 'profile' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'profile' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: window.innerWidth <= 768 ? '16px' : '14px',
            minHeight: window.innerWidth <= 768 ? '44px' : 'auto',
            width: window.innerWidth <= 768 ? '100%' : 'auto'
          }}
        >
          Профиль
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
            marginBottom: '20px'
          }}>
            <h3>📤 Загрузить меню из Excel</h3>
            
            <form onSubmit={handleFileUpload}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setFile(f);
                    setFileError(validateFile(f));
                  }}
                  style={{ flex: 1, padding: '8px' }}
                />
                <button
                  type="submit"
                  disabled={loading || !!fileError || !file}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: (loading || !!fileError || !file) ? '#6b7280' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: (loading || !!fileError || !file) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {loading ? 'Загружаем...' : 'Загрузить'}
                </button>
              </div>
              {fileError && (
                <div style={{ color: '#b91c1c', marginBottom: '10px' }}>
                  ❌ {fileError}
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
            marginBottom: '20px'
          }}>
            <h3>⚙️ Управление меню</h3>
            
            {/* Кнопка загрузки меню */}
            {menuItems.length === 0 && !loading && (
              <div style={{
                textAlign: 'center',
                marginBottom: '20px',
                padding: '15px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '2px dashed #dee2e6'
              }}>
                <p style={{ marginBottom: '10px', color: '#666' }}>
                  Меню не загружено. Нажмите кнопку для загрузки блюд.
                </p>
                <button
                  onClick={loadData}
                  disabled={loading}
                  style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '6px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.9rem',
                    opacity: loading ? 0.6 : 1
                  }}
                >
                  {loading ? '⏳ Загружаем...' : '📋 Загрузить меню'}
                </button>
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={clearAllMenu}
                disabled={actionLoading || menuItems.length === 0}
                style={{
                  padding: '10px 15px',
                  backgroundColor: menuItems.length === 0 ? '#6c757d' : '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: (actionLoading || menuItems.length === 0) ? 'not-allowed' : 'pointer'
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
                  cursor: 'pointer'
                }}
              >
                {menuView === 'grid' ? '📋 Список' : '🔲 Сетка'}
              </button>
            </div>

            {/* Массовые операции */}
            {bulkSelected.size > 0 && (
              <div style={{ padding: '15px', backgroundColor: '#f3f4f6', borderRadius: '8px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <span>Выбрано: {bulkSelected.size} блюд</span>
                  
                  <button
                    onClick={deleteSelectedItems}
                    disabled={actionLoading}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer'
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
                      cursor: 'pointer'
                    }}
                  >
                    ❌ Отменить выбор
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
              <button
                onClick={selectAllItems}
                disabled={!menuItems.length}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: menuItems.length ? 'pointer' : 'not-allowed'
                }}
              >
                ✅ Выбрать все
              </button>
            </div>
          </div>

          {/* Список блюд */}
          <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '20px'
          }}>
            <h3>🍽️ Блюда меню ({menuItems.length})</h3>
            
            {menuItems.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                📋 Меню пусто. Загрузите файл Excel.
              </div>
            ) : (
              <div style={{
                display: menuView === 'grid' ? 'grid' : 'block',
                gridTemplateColumns: menuView === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : 'none',
                gap: '15px'
              }}>
                {menuItems.filter(item => item && item.id).map((item) => (
                  <div
                    key={item.id}
                    style={{
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      padding: '15px',
                      backgroundColor: bulkSelected.has(item.id) ? '#eff6ff' : 'white'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>{item.name}</div>
                        <div style={{ fontSize: '14px', color: '#6b7280' }}>
                          {item.meal_type} • {item.day_of_week}
                        </div>
                        {item.weight && <div style={{ fontSize: '12px', color: '#9ca3af' }}>Вес: {item.weight}</div>}
                        {item.recipe_number && <div style={{ fontSize: '12px', color: '#9ca3af' }}>Рецепт: {item.recipe_number}</div>}
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                          type="checkbox"
                          checked={bulkSelected.has(item.id)}
                          onChange={() => toggleBulkSelection(item.id)}
                        />
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          style={{
                            padding: '4px 8px',
                            backgroundColor: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
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

      {activeTab === 'profile' && currentUser && (
        <ProfileSettings 
          currentUser={currentUser} 
          onProfileUpdated={(updatedUser) => {
            setCurrentUser(updatedUser);
            setMsg('✅ Профиль обновлен');
          }}
        />
      )}
    </div>
  );
}