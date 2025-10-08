/**
 * Утилиты для работы с куки
 * Автоматический вход и сохранение сессии
 */

export interface UserSession {
  email: string;
  role: string;
  name: string;
  token?: string;
  expires: number;
}

export class CookieManager {
  private static readonly COOKIE_NAME = 'school_meals_session';
  private static readonly EXPIRES_DAYS = 7; // Куки действуют 7 дней

  /**
   * Сохранить сессию пользователя в куки
   */
  static setSession(user: { email: string; role: string; name: string; token?: string }): void {
    const session: UserSession = {
      email: user.email,
      role: user.role,
      name: user.name,
      token: user.token,
      expires: Date.now() + (this.EXPIRES_DAYS * 24 * 60 * 60 * 1000)
    };

    const cookieValue = encodeURIComponent(JSON.stringify(session));
    const expires = new Date(session.expires).toUTCString();
    
    document.cookie = `${this.COOKIE_NAME}=${cookieValue}; expires=${expires}; path=/; secure; samesite=strict`;
    
    console.log('🍪 Сессия сохранена в куки:', user.email);
  }

  /**
   * Получить сессию пользователя из куки
   */
  static getSession(): UserSession | null {
    try {
      const cookies = document.cookie.split(';');
      const sessionCookie = cookies.find(cookie => 
        cookie.trim().startsWith(`${this.COOKIE_NAME}=`)
      );

      if (!sessionCookie) {
        return null;
      }

      const cookieValue = sessionCookie.split('=')[1];
      const session: UserSession = JSON.parse(decodeURIComponent(cookieValue));

      // Проверяем, не истекла ли сессия
      if (session.expires < Date.now()) {
        this.clearSession();
        return null;
      }

      console.log('🍪 Сессия восстановлена из куки:', session.email);
      return session;
    } catch (error) {
      console.error('❌ Ошибка чтения куки:', error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Очистить сессию (выход)
   */
  static clearSession(): void {
    document.cookie = `${this.COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    console.log('🍪 Сессия очищена');
  }

  /**
   * Проверить, есть ли активная сессия
   */
  static hasActiveSession(): boolean {
    return this.getSession() !== null;
  }

  /**
   * Получить информацию о пользователе из куки
   */
  static getCurrentUser(): { email: string; role: string; name: string } | null {
    const session = this.getSession();
    if (!session) {
      return null;
    }

    return {
      email: session.email,
      role: session.role,
      name: session.name
    };
  }
}
