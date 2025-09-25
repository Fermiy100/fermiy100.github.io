// Система аутентификации и управления пользователями

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'DIRECTOR' | 'PARENT' | 'STUDENT';
  schoolId?: string;
  schoolName?: string;
  verified: boolean;
  createdAt: string;
}

export interface School {
  id: string;
  name: string;
  address: string;
  directorId: string;
  createdAt: string;
}

// Демо-данные для тестирования
export const demoUsers: User[] = [
  {
    id: '1',
    email: 'director@school.test',
    name: 'Анна Петровна Иванова',
    role: 'DIRECTOR',
    schoolId: 'school-1',
    schoolName: 'Средняя школа №123',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    email: 'parent@school.test',
    name: 'Мария Сергеевна Сидорова',
    role: 'PARENT',
    schoolId: 'school-1',
    schoolName: 'Средняя школа №123',
    verified: true,
    createdAt: '2024-01-01T00:00:00Z'
  }
];

export const demoSchools: School[] = [
  {
    id: 'school-1',
    name: 'Средняя школа №123',
    address: 'г. Москва, ул. Примерная, д. 1',
    directorId: '1',
    createdAt: '2024-01-01T00:00:00Z'
  }
];

// Функция для аутентификации пользователя
export function authenticateUser(email: string, password: string): Promise<{ user: User; token: string }> {
  return new Promise((resolve, reject) => {
    // Имитация задержки сети
    setTimeout(() => {
      const user = demoUsers.find(u => u.email === email);
      
      if (user && password === 'P@ssw0rd1!') {
        if (!user.verified) {
          reject(new Error('Аккаунт не верифицирован. Обратитесь к администратору.'));
          return;
        }
        
        const token = btoa(`${user.id}:${Date.now()}:${user.role}`);
        resolve({ user, token });
      } else {
        reject(new Error('Неверный email или пароль'));
      }
    }, 1000);
  });
}

// Функция для проверки токена
export function validateToken(token: string): User | null {
  try {
    const decoded = atob(token);
    const [userId, timestamp] = decoded.split(':');
    
    // Проверяем, что токен не старше 24 часов
    const tokenTime = parseInt(timestamp);
    const now = Date.now();
    if (now - tokenTime > 24 * 60 * 60 * 1000) {
      return null;
    }
    
    const user = demoUsers.find(u => u.id === userId);
    return user || null;
  } catch {
    return null;
  }
}

// Функция для создания нового пользователя (для директоров)
export function createUser(userData: {
  email: string;
  name: string;
  role: 'PARENT' | 'STUDENT';
  schoolId: string;
}, createdBy: User): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Проверяем права директора
      if (createdBy.role !== 'DIRECTOR') {
        reject(new Error('Недостаточно прав для создания пользователей'));
        return;
      }
      
      // Проверяем, что директор создает пользователей для своей школы
      if (createdBy.schoolId !== userData.schoolId) {
        reject(new Error('Можно создавать пользователей только для своей школы'));
        return;
      }
      
      // Проверяем уникальность email
      if (demoUsers.find(u => u.email === userData.email)) {
        reject(new Error('Пользователь с таким email уже существует'));
        return;
      }
      
      const newUser: User = {
        id: `user-${Date.now()}`,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        schoolId: userData.schoolId,
        schoolName: demoSchools.find(s => s.id === userData.schoolId)?.name,
        verified: false, // Требует верификации
        createdAt: new Date().toISOString()
      };
      
      demoUsers.push(newUser);
      resolve(newUser);
    }, 1000);
  });
}

// Функция для верификации пользователя
export function verifyUser(userId: string, verifiedBy: User): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Проверяем права директора
      if (verifiedBy.role !== 'DIRECTOR') {
        reject(new Error('Недостаточно прав для верификации пользователей'));
        return;
      }
      
      const user = demoUsers.find(u => u.id === userId);
      if (!user) {
        reject(new Error('Пользователь не найден'));
        return;
      }
      
      // Проверяем, что директор верифицирует пользователей своей школы
      if (verifiedBy.schoolId !== user.schoolId) {
        reject(new Error('Можно верифицировать только пользователей своей школы'));
        return;
      }
      
      user.verified = true;
      resolve(user);
    }, 500);
  });
}

// Функция для получения списка пользователей школы
export function getSchoolUsers(schoolId: string, currentUser: User): Promise<User[]> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Проверяем права директора
      if (currentUser.role !== 'DIRECTOR') {
        reject(new Error('Недостаточно прав для просмотра списка пользователей'));
        return;
      }
      
      // Проверяем, что директор запрашивает пользователей своей школы
      if (currentUser.schoolId !== schoolId) {
        reject(new Error('Можно просматривать только пользователей своей школы'));
        return;
      }
      
      const schoolUsers = demoUsers.filter(u => u.schoolId === schoolId);
      resolve(schoolUsers);
    }, 500);
  });
}

// Функция для получения информации о школе
export function getSchoolInfo(schoolId: string): School | null {
  return demoSchools.find(s => s.id === schoolId) || null;
}

// Функция для обновления профиля пользователя
export function updateUserProfile(userId: string, updates: Partial<User>, currentUser: User): Promise<User> {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Пользователь может обновлять только свой профиль
      if (currentUser.id !== userId && currentUser.role !== 'DIRECTOR') {
        reject(new Error('Недостаточно прав для обновления профиля'));
        return;
      }
      
      const user = demoUsers.find(u => u.id === userId);
      if (!user) {
        reject(new Error('Пользователь не найден'));
        return;
      }
      
      // Директор может обновлять профили пользователей своей школы
      if (currentUser.role === 'DIRECTOR' && currentUser.schoolId !== user.schoolId) {
        reject(new Error('Можно обновлять только профили пользователей своей школы'));
        return;
      }
      
      // Обновляем разрешенные поля
      if (updates.name) user.name = updates.name;
      if (updates.email && currentUser.role === 'DIRECTOR') user.email = updates.email;
      
      resolve(user);
    }, 500);
  });
}
