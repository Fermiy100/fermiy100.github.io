// API клиент для работы с backend

const API_BASE_URL = 'https://fermiy.ru/api';  // PHP backend

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
      'Accept': 'application/json',
      'Cache-Control': 'no-cache',
      ...options.headers,
    };

    if (this.token) {
      (headers as any).Authorization = `Bearer ${this.token}`;
    }

    try {
      console.log(`🌐 API Request: ${options.method || 'GET'} ${url}`);
      
      const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include',
        mode: 'cors',
      });

      console.log(`📊 Response status: ${response.status} ${response.statusText}`);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.warn('Could not parse error response:', parseError);
        }
        throw new Error(errorMessage);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.warn('Non-JSON response:', text);
        throw new Error('Сервер вернул некорректный ответ');
      }

      const data = await response.json();
      console.log(`✅ API Response:`, data);
      return data;
    } catch (error: any) {
      console.error('❌ API Request Error:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Нет подключения к серверу. Проверьте интернет-соединение.');
      }
      
      if (error.message.includes('Unexpected token')) {
        throw new Error('Сервер вернул некорректные данные. Попробуйте позже.');
      }
      
      if (error.message.includes('Failed to fetch')) {
        throw new Error('Сервер недоступен. Попробуйте позже.');
      }
      
      throw error;
    }
  }

  // Auth methods
  async login(emailOrLogin: string, password: string): Promise<AuthResponse> {
    // Если это логин (не содержит @), преобразуем в email
    const email = emailOrLogin.includes('@') ? emailOrLogin : `${emailOrLogin}@school.local`;
    
    return this.request<AuthResponse>('/auth/login.php', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getCurrentUser(): Promise<User> {
    return this.request<User>('/auth/me.php');
  }

  // School methods
  async getSchool(schoolId: number): Promise<School> {
    return this.request<School>(`/school/${schoolId}.php`);
  }

  async getSchoolUsers(schoolId: number): Promise<User[]> {
    return this.request<User[]>('/users.php');
  }

  // User management
  async createUser(userData: {
    email: string;
    name: string;
    role: 'PARENT' | 'STUDENT';
    password: string;
  }): Promise<User> {
    return this.request<User>('/users.php', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async verifyUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/verify.php`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  async updateUser(userId: number, userData: Partial<User>): Promise<User> {
    return this.request<User>(`/users/${userId}/update.php`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  }

  async deleteUser(userId: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/users/${userId}/delete`, {
      method: 'DELETE'
    });
  }

  async updateProfile(data: {
    name: string;
    email: string;
    password?: string;
  }): Promise<{ message: string; user: User }> {
    return this.request<{ message: string; user: User }>('/profile/update.php', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Menu methods
  async uploadMenu(file: File): Promise<{ message: string; itemsCount: number; weekStart: string }> {
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

  async getMenu(weekStart?: string): Promise<MenuResponse> {
    const params = weekStart ? `?week=${weekStart}` : '';
    return this.request<MenuResponse>(`/menu-test.php${params}`);
  }

  // Order methods
  async createOrder(orderData: any): Promise<{ success: boolean; message: string; order?: any }> {
    return this.request<{ success: boolean; message: string; order?: any }>('/orders.php', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  }

  async getOrders(): Promise<any[]> {
    return this.request<any[]>('/orders.php');
  }

  async getUserOrders(weekStart?: string): Promise<Order[]> {
    const params = weekStart ? `?week=${weekStart}` : '';
    return this.request<Order[]>(`/orders.php${params}`);
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
