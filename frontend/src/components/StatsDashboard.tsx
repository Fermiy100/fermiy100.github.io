import { useState, useEffect } from 'react';
import { apiClient, MenuItem, Order } from '../utils/api';

interface StatsDashboardProps {
  currentUser: any;
}

interface Stats {
  totalMenuItems: number;
  totalOrders: number;
  totalRevenue: number;
  popularItems: Array<{ name: string; count: number; revenue: number }>;
  dailyStats: Array<{ day: string; orders: number; revenue: number }>;
  mealTypeStats: Array<{ type: string; count: number; revenue: number }>;
}

const dayNames = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];

export default function StatsDashboard({ currentUser }: StatsDashboardProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadStats();
  }, [currentUser]);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError('');

      // Загружаем меню и заказы
      const [menuData, ordersData] = await Promise.all([
        apiClient.getMenu(),
        apiClient.getUserOrders()
      ]);

      // API теперь возвращает прямой массив блюд
      const menuItems: MenuItem[] = Array.isArray(menuData) ? menuData : menuData.items || [];
      const orders: Order[] = ordersData;

      // Вычисляем статистику
      const calculatedStats = calculateStats(menuItems, orders);
      setStats(calculatedStats);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (menuItems: MenuItem[], orders: Order[]): Stats => {
    // Общая статистика
    const totalMenuItems = menuItems.length;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.price || 0), 0);

    // Популярные блюда
    const itemCounts = new Map<string, { count: number; revenue: number }>();
    orders.forEach(order => {
      const itemName = order.name || 'Неизвестное блюдо';
      const current = itemCounts.get(itemName) || { count: 0, revenue: 0 };
      itemCounts.set(itemName, {
        count: current.count + 1,
        revenue: current.revenue + (order.price || 0)
      });
    });

    const popularItems = Array.from(itemCounts.entries())
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Статистика по дням
    const dailyStats = dayNames.slice(1).map((day, index) => {
      const dayOrders = orders.filter(order => order.day_of_week === index + 1);
      return {
        day,
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.price || 0), 0)
      };
    });

    // Статистика по типам питания
    const mealTypeStats = ['завтрак', 'обед', 'полдник', 'ужин', 'дополнительно'].map(type => {
      const typeOrders = orders.filter(order => order.meal_type === type);
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: typeOrders.length,
        revenue: typeOrders.reduce((sum, order) => sum + (order.price || 0), 0)
      };
    });

    return {
      totalMenuItems,
      totalOrders,
      totalRevenue,
      popularItems,
      dailyStats,
      mealTypeStats
    };
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        Загрузка статистики...
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error">
        Ошибка загрузки статистики: {error}
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid gap-6">
      {/* Общая статистика */}
      <div className="grid grid-3 gap-4">
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {stats.totalMenuItems}
            </div>
            <div className="text-muted">Блюд в меню</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {stats.totalOrders}
            </div>
            <div className="text-muted">Всего заказов</div>
          </div>
        </div>
        
        <div className="card">
          <div className="card-body text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {stats.totalRevenue} ₽
            </div>
            <div className="text-muted">Общая выручка</div>
          </div>
        </div>
      </div>

      {/* Популярные блюда */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🍽️ Популярные блюда</h3>
        </div>
        <div className="card-body">
          {stats.popularItems.length > 0 ? (
            <div className="space-y-3">
              {stats.popularItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-muted">
                      {item.count} заказов • {item.revenue} ₽
                    </div>
                  </div>
                  <div className="text-2xl">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '📊'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-muted py-8">
              Пока нет заказов для отображения статистики
            </div>
          )}
        </div>
      </div>

      {/* Статистика по дням */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">📅 Статистика по дням недели</h3>
        </div>
        <div className="card-body">
          <div className="grid gap-3">
            {stats.dailyStats.map((day, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div className="font-medium">{day.day}</div>
                <div className="text-sm text-muted">
                  {day.orders} заказов • {day.revenue} ₽
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Статистика по типам питания */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">🍴 Статистика по типам питания</h3>
        </div>
        <div className="card-body">
          <div className="grid grid-2 gap-3">
            {stats.mealTypeStats.map((meal, index) => (
              <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                <div className="font-medium mb-1">{meal.type}</div>
                <div className="text-sm text-muted">
                  {meal.count} заказов
                </div>
                <div className="text-sm font-medium text-green-600">
                  {meal.revenue} ₽
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопка обновления */}
      <div className="text-center">
        <button
          onClick={loadStats}
          className="btn btn-secondary"
        >
          🔄 Обновить статистику
        </button>
      </div>
    </div>
  );
}
