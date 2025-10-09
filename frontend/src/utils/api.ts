// API клиент для работы с backend

const API_BASE_URL = import.meta.env.PROD 
  ? 'https://fermiy.ru'  // GitHub Pages - JSON files
  : 'http://localhost:10000/api';       // Development URL

export interface User {
  id: number;
  email: string;
  name: string;
  role: 'DIRECTOR' | 'PARENT' | 'STUDENT';
  school_id: number;
  verified: boolean;
}

export interface School {
  id: number;
  name: string;
  address: string;
  director_id: number;
}

export interface MenuItem {
  id: number;
  school_id: number;
  name: string;
  description?: string;
  price: number;
  meal_type: string;
  day_of_week: number | string; // Поддержка обоих форматов
  weight?: string;
  recipe_number?: string;
  portion?: string;
  week_start: string;
}

export interface Order {
  id: number;
  user_id: number;
  school_id: number;
  menu_item_id: number;
  quantity: number;
  week_start: string;
  day_of_week: number;
  name: string;
  price: number;
  meal_type: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface MenuResponse {
  items: MenuItem[];
  weekStart: string;
  title: string;
}

// API класс
class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      (headers as any).Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      console.error('API Request Error:', error);
      if (error.message.includes('Unexpected token')) {
        throw new Error('Сервер недоступен. Попробуйте позже.');
      }
      throw error;
    }
  }

  // Auth methods
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    if (import.meta.env.PROD) {
      // В продакшене возвращаем мокового пользователя
      return {
        id: 1,
        email: 'director@school.test',
        name: 'Директор школы',
        role: 'DIRECTOR',
        school_id: 1,
        verified: true
      };
    } else {
      return this.request<User>('/auth/me.php');
    }
  }

  // School methods
  async getSchool(schoolId: number): Promise<School> {
    return this.request<School>(`/school/${schoolId}.php`);
  }

  async getSchoolUsers(_schoolId: number): Promise<User[]> {
    if (import.meta.env.PROD) {
      // В продакшене используем встроенные данные
      return (window as any).MOCK_DATA?.users || [];
    } else {
      return this.request<User[]>('/users.php');
    }
  }

  // User management
  async createUser(userData: {
    email: string;
    name: string;
    role: 'PARENT' | 'STUDENT';
    password: string;
    school_id?: number;
  }): Promise<User> {
    if (import.meta.env.PROD) {
      // В продакшене создаем пользователя локально
      const newUser: User = {
        id: Date.now(), // Простой ID
        email: userData.email,
        name: userData.name,
        role: userData.role,
        school_id: userData.school_id || 1,
        verified: false
      };
      
      // В реальном приложении здесь был бы запрос к серверу
      // Пока просто возвращаем созданного пользователя
      return newUser;
    } else {
      return this.request<User>('/users.php', {
        method: 'POST',
        body: JSON.stringify(userData),
      });
    }
  }

  async verifyUser(userId: number): Promise<{ message: string }> {
    if (import.meta.env.PROD) {
      // В продакшене просто возвращаем успех
      return { message: 'Пользователь верифицирован' };
    } else {
      return this.request<{ message: string }>(`/users/${userId}/verify`, {
        method: 'POST',
      });
    }
  }

  // Menu methods
  async uploadMenu(file: File): Promise<{ message: string; itemsCount: number; weekStart: string }> {
    if (import.meta.env.PROD) {
      // В продакшене имитируем загрузку файла
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            message: 'Меню успешно загружено',
            itemsCount: 15,
            weekStart: new Date().toISOString().split('T')[0]
          });
        }, 1000);
      });
    } else {
      const formData = new FormData();
      formData.append('file', file);

      const url = `${API_BASE_URL}/menu/upload.php`;
      const headers: HeadersInit = {};

      if (this.token) {
        (headers as any).Authorization = `Bearer ${this.token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Ошибка сервера' }));
        throw new Error(error.error || `HTTP ${response.status}`);
      }

      return response.json();
    }
  }

  async getMenu(weekStart?: string): Promise<MenuResponse> {
    if (import.meta.env.PROD) {
      // В продакшене используем встроенные данные
      const items = (window as any).MOCK_DATA?.menu || [];
      return {
        title: 'Меню школьной столовой',
        weekStart: weekStart || new Date().toISOString().split('T')[0],
        items: items
      };
    } else {
      // В разработке используем API
      const params = weekStart ? `?week=${weekStart}` : '';
      return this.request<MenuResponse>(`/menu.php${params}`);
    }
  }

  // Order methods
  async createOrder(menuItemIds: number[], weekStart: string): Promise<{ message: string; itemsCount: number }> {
    return this.request<{ message: string; itemsCount: number }>('/orders', {
      method: 'POST',
      body: JSON.stringify({ menuItemIds, weekStart }),
    });
  }

  async getUserOrders(weekStart?: string): Promise<Order[]> {
    const params = weekStart ? `?week=${weekStart}` : '';
    return this.request<Order[]>(`/orders${params}`);
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request<{ status: string; timestamp: string }>('/health.php');
  }

  // Menu editing methods
  async updateMenuItem(id: number, data: Partial<MenuItem>): Promise<{ message: string }> {
    return this.request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  async deleteMenuItem(id: number): Promise<{ message: string }> {
    return this.request(`/menu/delete.php?id=${id}`, {
      method: 'DELETE'
    });
  }

  async addMenuItem(data: Omit<MenuItem, 'id' | 'school_id' | 'week_start'>): Promise<{ message: string; id: number }> {
    return this.request('/menu/add.php', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

// Создаем единственный экземпляр API клиента
export const apiClient = new ApiClient();

// Утилиты для работы с токенами
export const tokenUtils = {
  setToken(token: string) {
    localStorage.setItem('auth_token', token);
    apiClient.setToken(token);
  },

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  },

  removeToken() {
    localStorage.removeItem('auth_token');
    apiClient.setToken(null);
  },

  isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return payload.exp > now;
    } catch {
      return false;
    }
  }
};

// Инициализация токена при загрузке
const savedToken = tokenUtils.getToken();
if (savedToken && tokenUtils.isTokenValid(savedToken)) {
  apiClient.setToken(savedToken);
} else {
  tokenUtils.removeToken();
}
