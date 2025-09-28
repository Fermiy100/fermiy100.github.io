import { useState, useEffect } from 'react';
import { apiClient, MenuItem, Order } from '../utils/api';
import ParentMenuSelector from '../components/ParentMenuSelector';

interface ParentDemoProps {
  token: string;
}

export default function ParentDemo({ token: _token }: ParentDemoProps) {
  const [selectedItems, setSelectedItems] = useState<{ [key: string]: boolean }>({});
  const [totalCost, setTotalCost] = useState(0);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [_orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Загружаем информацию о пользователе
      const user = await apiClient.getCurrentUser();
      setCurrentUser(user);
      
      // Загружаем меню
      const menuData = await apiClient.getMenu();
      setMenuItems(menuData.items);
      
      // Загружаем существующие заказы
      const userOrders = await apiClient.getUserOrders();
      setOrders(userOrders);
      
      // Восстанавливаем выбранные элементы из заказов
      const selectedFromOrders: { [key: string]: boolean } = {};
      userOrders.forEach(order => {
        selectedFromOrders[order.menu_item_id.toString()] = true;
      });
      setSelectedItems(selectedFromOrders);
      
    } catch (error: any) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Пересчитываем общую стоимость
    const total = Object.keys(selectedItems)
      .filter(key => selectedItems[key])
      .reduce((sum, key) => {
        const item = menuItems.find(item => item.id.toString() === key);
        return sum + (item?.price || 0);
      }, 0);
    setTotalCost(total);
  }, [selectedItems, menuItems]);

  const handleItemToggle = (itemId: number) => {
    setSelectedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const handleSubmitOrder = async () => {
    const selectedCount = Object.values(selectedItems).filter(Boolean).length;
    if (selectedCount === 0) {
      alert('Выберите хотя бы одно блюдо');
      return;
    }
    
    try {
      const selectedItemIds = Object.keys(selectedItems)
        .filter(key => selectedItems[key])
        .map(key => parseInt(key));
      
      const weekStart = new Date().toISOString().split('T')[0];
      await apiClient.createOrder(selectedItemIds, weekStart);
      
      alert(`Заказ отправлен!\nВыбрано блюд: ${selectedCount}\nОбщая стоимость: ${totalCost} ₽`);
      
      // Перезагружаем заказы
      const userOrders = await apiClient.getUserOrders();
      setOrders(userOrders);
      
    } catch (error: any) {
      alert(`Ошибка отправки заказа: ${error.message}`);
    }
  };

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

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          Загружаем меню...
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="container">
        <div className="alert alert-error">
          Ошибка загрузки данных пользователя
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>Выбор блюд</h1>
          <div className="text-muted">
            Родитель/Ученик
          </div>
        </div>
        
        <div className="card-body">
          <ParentMenuSelector 
            schoolId={currentUser.school_id}
            weekStart={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>
    </div>
  );
}