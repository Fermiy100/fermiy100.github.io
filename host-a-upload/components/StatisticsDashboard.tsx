import React, { useState, useEffect } from 'react';
import { useMobile } from './MobileOptimized';
import { LoadingSpinner } from './LoadingSpinner';

interface StatisticsData {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  activeUsers: number;
  popularDishes: Array<{
    name: string;
    orders: number;
    revenue: number;
  }>;
  dailyOrders: Array<{
    date: string;
    orders: number;
    revenue: number;
  }>;
}

interface StatisticsDashboardProps {
  token: string;
}

export default function StatisticsDashboard({ token }: StatisticsDashboardProps) {
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week');
  const isMobile = useMobile();

  useEffect(() => {
    loadStatistics();
  }, [timeRange]);

  const loadStatistics = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Здесь будет реальный API для статистики
      // Пока используем моковые данные
      const mockStats: StatisticsData = {
        totalUsers: 156,
        totalOrders: 1247,
        totalRevenue: 89450,
        activeUsers: 89,
        popularDishes: [
          { name: 'Суп овощной', orders: 234, revenue: 11700 },
          { name: 'Котлета мясная', orders: 198, revenue: 15840 },
          { name: 'Каша овсяная', orders: 187, revenue: 9350 },
          { name: 'Фрукты', orders: 156, revenue: 4680 },
          { name: 'Йогурт', orders: 134, revenue: 4020 }
        ],
        dailyOrders: [
          { date: '2024-01-15', orders: 45, revenue: 3200 },
          { date: '2024-01-16', orders: 52, revenue: 3800 },
          { date: '2024-01-17', orders: 38, revenue: 2900 },
          { date: '2024-01-18', orders: 61, revenue: 4200 },
          { date: '2024-01-19', orders: 48, revenue: 3500 },
          { date: '2024-01-20', orders: 29, revenue: 2100 },
          { date: '2024-01-21', orders: 15, revenue: 1200 }
        ]
      };
      
      setStats(mockStats);
    } catch (err) {
      setError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ru-RU').format(num);
  };

  if (loading) {
    return <LoadingSpinner text="Загружаем статистику..." />;
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#dc3545',
        background: '#f8d7da',
        borderRadius: '8px',
        border: '1px solid #f5c6cb'
      }}>
        ❌ {error}
      </div>
    );
  }

  if (!stats) {
    return (
      <div style={{
        padding: '20px',
        textAlign: 'center',
        color: '#666'
      }}>
        📊 Нет данных для отображения
      </div>
    );
  }

  return (
    <div style={{
      padding: isMobile ? '10px' : '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      background: 'white',
      borderRadius: isMobile ? '10px' : '15px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      width: '100%',
      boxSizing: 'border-box'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '30px',
        flexDirection: isMobile ? 'column' : 'row',
        gap: isMobile ? '15px' : '0'
      }}>
        <h1 style={{
          fontSize: isMobile ? '1.5rem' : '2rem',
          margin: 0,
          color: '#333'
        }}>
          📊 Статистика
        </h1>
        
        <div style={{
          display: 'flex',
          gap: '10px',
          flexDirection: isMobile ? 'column' : 'row',
          width: isMobile ? '100%' : 'auto'
        }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            style={{
              padding: isMobile ? '12px 16px' : '8px 12px',
              border: '1px solid #dee2e6',
              borderRadius: '8px',
              fontSize: isMobile ? '16px' : '14px',
              minHeight: isMobile ? '44px' : 'auto',
              width: isMobile ? '100%' : 'auto',
              boxSizing: 'border-box'
            }}
          >
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="year">Год</option>
          </select>
        </div>
      </div>

      {/* Основные метрики */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>👥</div>
          <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatNumber(stats.totalUsers)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Всего пользователей</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📦</div>
          <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatNumber(stats.totalOrders)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Всего заказов</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>💰</div>
          <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatCurrency(stats.totalRevenue)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Общая выручка</div>
        </div>

        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          color: 'white',
          padding: '20px',
          borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '10px' }}>🔥</div>
          <div style={{ fontSize: isMobile ? '1.5rem' : '2rem', fontWeight: 'bold', marginBottom: '5px' }}>
            {formatNumber(stats.activeUsers)}
          </div>
          <div style={{ fontSize: '14px', opacity: 0.9 }}>Активных пользователей</div>
        </div>
      </div>

      {/* Популярные блюда */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        marginBottom: '30px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>🍽️ Популярные блюда</h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px'
        }}>
          {stats.popularDishes.map((dish, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '10px' : '0'
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '5px' }}>
                  {dish.name}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {formatNumber(dish.orders)} заказов
                </div>
              </div>
              
              <div style={{
                textAlign: isMobile ? 'center' : 'right',
                color: '#28a745',
                fontWeight: '600'
              }}>
                {formatCurrency(dish.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* График заказов по дням */}
      <div style={{
        background: '#f8f9fa',
        padding: '20px',
        borderRadius: '10px',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ margin: '0 0 20px 0', color: '#333' }}>📈 Заказы по дням</h3>
        
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px'
        }}>
          {stats.dailyOrders.map((day, index) => (
            <div
              key={index}
              style={{
                background: 'white',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '10px' : '0'
              }}
            >
              <div>
                <div style={{ fontWeight: '600', color: '#333' }}>
                  {new Date(day.date).toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long'
                  })}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {formatNumber(day.orders)} заказов
                </div>
              </div>
              
              <div style={{
                color: '#28a745',
                fontWeight: '600',
                fontSize: isMobile ? '16px' : '14px'
              }}>
                {formatCurrency(day.revenue)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
