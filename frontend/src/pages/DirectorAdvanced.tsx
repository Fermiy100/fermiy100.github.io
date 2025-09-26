import { useState, useEffect } from "react";
import { apiClient, User, MenuItem, School } from "../utils/api";
import UserManagement from "./UserManagement";
import MenuItemEditor from "../components/MenuItemEditor";
import MenuItemCard from "../components/MenuItemCard";
import StatsDashboard from "../components/StatsDashboard";

export default function DirectorAdvanced({ token: _token }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'users' | 'stats'>('menu');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [_school, setSchool] = useState<School | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [menuView, setMenuView] = useState<'grid' | 'list'>('grid');

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
        setMenuItems(menuData.items);
      }
    } catch (error: any) {
      setMsg(`❌ Ошибка загрузки данных: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setMsg("");

    // Валидация файла
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = selectedFile.name.toLowerCase();
    const isValidFile = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidFile) {
      setMsg("❌ Пожалуйста, выберите файл Excel (.xlsx или .xls)");
      return;
    }

    setMsg("✅ Файл выбран. Нажмите 'Загрузить меню' для обработки.");
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    setMsg(""); 
    setLoading(true);
    setUploadProgress(0);

    if (!file) {
      setMsg("❌ Выберите файл Excel (.xlsx)");
      setLoading(false);
      return;
    }

    try {
      setUploadProgress(25);
      
      // Загружаем файл на сервер
      const result = await apiClient.uploadMenu(file);
      
      setUploadProgress(75);
      
      // Перезагружаем меню
      const menuData = await apiClient.getMenu();
      setMenuItems(menuData.items);
      
      setUploadProgress(100);
      
      setMsg(`✅ ${result.message}! Обработано ${result.itemsCount} блюд.`);
      
    } catch (error: any) {
      setMsg(`❌ Ошибка: ${error.message}`);
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  }

  // Функции для редактирования меню
  async function handleEditItem(item: MenuItem) {
    setEditingItem(item);
    setShowAddForm(false);
  }

  async function handleDeleteItem(id: number) {
    try {
      await apiClient.deleteMenuItem(id);
      setMenuItems(prev => prev.filter(item => item.id !== id));
      setMsg("✅ Блюдо удалено");
    } catch (error: any) {
      setMsg(`❌ Ошибка удаления: ${error.message}`);
    }
  }

  async function handleSaveItem(data: Omit<MenuItem, 'id' | 'school_id' | 'week_start'>) {
    try {
      if (editingItem) {
        // Обновляем существующий элемент
        await apiClient.updateMenuItem(editingItem.id, data);
        setMenuItems(prev => prev.map(item => 
          item.id === editingItem.id ? { ...item, ...data } : item
        ));
        setMsg("✅ Блюдо обновлено");
      } else {
        // Добавляем новый элемент
        const result = await apiClient.addMenuItem(data);
        const newItem = { ...data, id: result.id, school_id: currentUser?.school_id || 0, week_start: new Date().toISOString().split('T')[0] };
        setMenuItems(prev => [...prev, newItem]);
        setMsg("✅ Блюдо добавлено");
      }
      
      setEditingItem(null);
      setShowAddForm(false);
    } catch (error: any) {
      setMsg(`❌ Ошибка сохранения: ${error.message}`);
    }
  }

  function handleCancelEdit() {
    setEditingItem(null);
    setShowAddForm(false);
  }

  function handleAddNew() {
    setShowAddForm(true);
    setEditingItem(null);
  }

  const dayNames = ["", "Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];

  // Группируем блюда по дням и типам питания
  const groupedMenu = menuItems.reduce((acc: any, item: MenuItem) => {
    const key = `${item.day_of_week}-${item.meal_type}`;
    if (!acc[key]) {
      acc[key] = {
        day: dayNames[item.day_of_week] || `День ${item.day_of_week}`,
        mealType: item.meal_type,
        items: []
      };
    }
    acc[key].items.push(item);
    return acc;
  }, {});

  return (
    <div>
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Панель директора</h2>
        <div className="text-muted">
          {currentUser?.name || 'Директор школы'}
        </div>
      </div>

      {/* Вкладки */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'menu' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📋 Управление меню
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'users' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          👥 Управление пользователями
        </button>
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            activeTab === 'stats' 
              ? 'bg-white text-gray-900 shadow-sm' 
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          📊 Статистика
        </button>
      </div>

      {/* Контент вкладок */}
      {activeTab === 'users' && currentUser ? (
        <UserManagement 
          currentUser={currentUser}
          onUserCreated={(user) => {
            setMsg(`✅ Пользователь ${user.name} создан`);
          }}
        />
      ) : activeTab === 'stats' && currentUser ? (
        <StatsDashboard currentUser={currentUser} />
      ) : (
        <div>
          {/* Сообщения */}
          {msg && (
            <div className={`alert ${msg.includes("✅") ? "alert-success" : "alert-error"} mb-6`}>
              {msg}
            </div>
          )}

          {/* Загрузка файла */}
          <div className="card mb-6">
            <div className="card-header">
              <h3 className="card-title">📤 Загрузка нового меню</h3>
            </div>
            <div className="card-body">
              <form onSubmit={upload}>
                <div className="form-group">
                  <label className="form-label">Выберите файл Excel с меню:</label>
                  <input 
                    type="file" 
                    accept=".xlsx,.xls"
                    onChange={handleFileSelect}
                    className="input"
                    style={{ border: '2px dashed #d1d5db', backgroundColor: '#f9fafb' }}
                  />
                  <div className="text-muted mt-2">
                    Поддерживаются файлы .xlsx и .xls
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  disabled={loading || !file}
                  className="btn btn-primary"
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>
                      Загрузка...
                    </>
                  ) : (
                    '📤 Загрузить меню'
                  )}
                </button>
              </form>

              {uploadProgress > 0 && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="text-muted text-sm mt-2">
                    {uploadProgress}% завершено
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Управление меню */}
          {menuItems.length > 0 && (
            <div className="card mb-6">
              <div className="card-header">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">📋 Текущее меню ({menuItems.length} блюд)</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setMenuView(menuView === 'grid' ? 'list' : 'grid')}
                      className="btn btn-secondary btn-sm"
                    >
                      {menuView === 'grid' ? '📋 Список' : '🔲 Сетка'}
                    </button>
                    <button
                      onClick={handleAddNew}
                      className="btn btn-success btn-sm"
                    >
                      ➕ Добавить блюдо
                    </button>
                  </div>
                </div>
              </div>
              <div className="card-body">

                {menuView === 'grid' ? (
                  <div className="menu-grid">
                    {menuItems.map((item) => (
                      <MenuItemCard
                        key={item.id}
                        item={item}
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}
                        showActions={true}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Object.values(groupedMenu).map((group: any) => (
                      <div key={`${group.day}-${group.mealType}`} className="card">
                        <div className="card-header">
                          <h4 className="card-title">
                            {group.day} - {group.mealType}
                          </h4>
                        </div>
                        <div className="card-body">
                          <div className="grid gap-2">
                            {group.items.map((item: MenuItem) => (
                              <MenuItemCard
                                key={item.id}
                                item={item}
                                onEdit={handleEditItem}
                                onDelete={handleDeleteItem}
                                showActions={true}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Форма редактирования/добавления */}
          {(editingItem || showAddForm) && (
            <div className="mb-6">
              <MenuItemEditor
                item={editingItem || undefined}
                onSave={handleSaveItem}
                onCancel={handleCancelEdit}
                isEditing={!!editingItem}
              />
            </div>
          )}

          {/* Инструкции */}
          <div className="alert alert-info">
            <h4 className="font-semibold mb-2">📝 Инструкция по загрузке меню</h4>
            <ul className="text-sm space-y-1">
              <li>• Файл должен быть в формате Excel (.xlsx или .xls)</li>
              <li>• В таблице должны быть указаны дни недели (Понедельник, Вторник и т.д.)</li>
              <li>• Типы питания: Завтрак, Обед, Полдник, Ужин, Дополнительный гарнир</li>
              <li>• Каждое блюдо должно быть в отдельной ячейке</li>
              <li>• Можно указать порцию (например: "200г") и цену (например: "150 руб")</li>
              <li>• Парсер автоматически распознает структуру таблицы</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
