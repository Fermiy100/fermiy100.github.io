import { useState, useEffect } from "react";
import { apiClient, User, MenuItem, School } from "../utils/api";
import UserManagement from "./UserManagement";

export default function DirectorAdvanced({ token: _token }: any) {
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [activeTab, setActiveTab] = useState<'menu' | 'users'>('menu');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [_school, setSchool] = useState<School | null>(null);

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
    <div style={{padding: 20, maxWidth: 1200, margin: '0 auto'}}>
      <div style={{display: "flex", gap: 12, alignItems: "center", justifyContent: "space-between", marginBottom: 20}}>
        <h2>🍽️ Панель директора</h2>
        <div style={{fontSize: 14, color: "#6b7280"}}>
          {currentUser?.name || 'Директор школы'}
        </div>
      </div>

      {/* Вкладки */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '20px',
        background: '#f3f4f6',
        borderRadius: '8px',
        padding: '4px'
      }}>
        <button
          onClick={() => setActiveTab('menu')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === 'menu' ? 'white' : 'transparent',
            color: activeTab === 'menu' ? '#374151' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: activeTab === 'menu' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          📋 Управление меню
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            flex: 1,
            padding: '10px 16px',
            border: 'none',
            borderRadius: '6px',
            background: activeTab === 'users' ? 'white' : 'transparent',
            color: activeTab === 'users' ? '#374151' : '#6b7280',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            boxShadow: activeTab === 'users' ? '0 1px 3px rgba(0, 0, 0, 0.1)' : 'none'
          }}
        >
          👥 Управление пользователями
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
      ) : (
        <div>

      {/* Загрузка файла */}
      <div className="card" style={{padding: 20, marginBottom: 20}}>
        <h3 style={{marginTop: 0, marginBottom: 15}}>📤 Загрузка нового меню</h3>
        
        <form onSubmit={upload}>
          <div style={{marginBottom: 15}}>
            <label style={{display: "block", marginBottom: 8, fontWeight: 600}}>
              Выберите файл Excel с меню:
            </label>
            <input 
              type="file" 
              accept=".xlsx,.xls"
              onChange={handleFileSelect}
              style={{
                width: "100%",
                padding: 10,
                border: "2px dashed #d1d5db",
                borderRadius: 8,
                backgroundColor: "#f9fafb"
              }}
            />
            <div style={{fontSize: 12, color: "#6b7280", marginTop: 5}}>
              Поддерживаются файлы .xlsx и .xls
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading || !file}
            style={{
              background: loading ? "#9ca3af" : "#0f172a",
              color: "white",
              padding: "12px 24px",
              borderRadius: 8,
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              fontSize: 16,
              fontWeight: 600
            }}
          >
            {loading ? "⏳ Загружается..." : "📤 Загрузить меню"}
          </button>
        </form>

        {uploadProgress > 0 && uploadProgress < 100 && (
          <div style={{marginTop: 15}}>
            <div style={{display: "flex", justifyContent: "space-between", marginBottom: 5}}>
              <span style={{fontSize: 14}}>Прогресс загрузки</span>
              <span style={{fontSize: 14}}>{uploadProgress}%</span>
            </div>
            <div style={{
              width: "100%",
              height: 8,
              backgroundColor: "#e5e7eb",
              borderRadius: 4,
              overflow: "hidden"
            }}>
              <div style={{
                width: `${uploadProgress}%`,
                height: "100%",
                backgroundColor: "#10b981",
                transition: "width 0.3s ease"
              }} />
            </div>
          </div>
        )}

        {msg && (
          <div style={{
            marginTop: 15,
            padding: 12,
            borderRadius: 8,
            backgroundColor: msg.includes("✅") ? "#d1fae5" : msg.includes("❌") ? "#fee2e2" : "#fef3c7",
            color: msg.includes("✅") ? "#065f46" : msg.includes("❌") ? "#991b1b" : "#92400e",
            fontSize: 14
          }}>
            {msg}
          </div>
        )}

      </div>

      {/* Текущее меню */}
      {menuItems.length > 0 && (
        <div className="card" style={{padding: 20}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20}}>
            <h3 style={{margin: 0}}>
              📋 Текущее меню
            </h3>
            <div style={{fontSize: 14, color: "#6b7280"}}>
              Всего блюд: {menuItems.length}
            </div>
          </div>

          <div style={{display: "grid", gap: 16}}>
            {Object.values(groupedMenu).map((group: any, idx: number) => (
              <div key={idx} style={{
                border: "1px solid #e5e7eb",
                borderRadius: 8,
                padding: 16,
                backgroundColor: "#f9fafb"
              }}>
                <h4 style={{
                  margin: "0 0 12px 0",
                  color: "#374151",
                  fontSize: 16,
                  fontWeight: 600
                }}>
                  {group.day} — {group.mealType}
                </h4>
                
                <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 8}}>
                  {group.items.map((item: MenuItem, itemIdx: number) => (
                    <div key={itemIdx} style={{
                      padding: 8,
                      backgroundColor: "white",
                      borderRadius: 6,
                      border: "1px solid #e5e7eb"
                    }}>
                      <div style={{fontWeight: 600, fontSize: 14, marginBottom: 4}}>
                        {item.name}
                      </div>
                      {item.description && (
                        <div style={{fontSize: 12, color: "#6b7280", marginBottom: 4}}>
                          {item.description}
                        </div>
                      )}
                      {item.price > 0 && (
                        <div style={{fontSize: 12, color: "#059669", fontWeight: 600}}>
                          {item.price} ₽
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Инструкции */}
      <div className="card" style={{padding: 20, marginTop: 20, backgroundColor: "#f0f9ff"}}>
        <h4 style={{marginTop: 0, color: "#1e40af"}}>📝 Инструкция по загрузке меню</h4>
        <ul style={{margin: 0, paddingLeft: 20, color: "#1e40af"}}>
          <li>Файл должен быть в формате Excel (.xlsx или .xls)</li>
          <li>В таблице должны быть указаны дни недели (Понедельник, Вторник и т.д.)</li>
          <li>Типы питания: Завтрак, Обед, Полдник, Ужин, Дополнительный гарнир</li>
          <li>Каждое блюдо должно быть в отдельной ячейке</li>
          <li>Можно указать порцию (например: "200г") и цену (например: "150 руб")</li>
          <li>Парсер автоматически распознает структуру таблицы</li>
        </ul>
      </div>
        </div>
      )}
    </div>
  );
}
