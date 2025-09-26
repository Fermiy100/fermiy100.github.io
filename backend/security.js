/**
 * Улучшенные настройки безопасности
 */

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

// Конфигурация безопасности
export const SECURITY_CONFIG = {
  // JWT настройки
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: '24h',
  JWT_REFRESH_EXPIRES_IN: '7d',
  
  // Bcrypt настройки
  BCRYPT_ROUNDS: 12, // Увеличено с 10 до 12 для большей безопасности
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000, // 15 минут
  RATE_LIMIT_MAX_REQUESTS: 100, // 100 запросов за 15 минут
  
  // Пароли
  PASSWORD_MIN_LENGTH: 8,
  PASSWORD_REQUIREMENTS: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true
  },
  
  // Временные пароли
  TEMP_PASSWORD_LENGTH: 12,
  
  // Сессии
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 минут неактивности
};

// Валидация пароля
export function validatePassword(password) {
  const errors = [];
  
  if (password.length < SECURITY_CONFIG.PASSWORD_REQUIREMENTS.minLength) {
    errors.push(`Пароль должен содержать минимум ${SECURITY_CONFIG.PASSWORD_REQUIREMENTS.minLength} символов`);
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать заглавные буквы');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчные буквы');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    errors.push('Пароль должен содержать цифры');
  }
  
  if (SECURITY_CONFIG.PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Пароль должен содержать специальные символы');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

// Генерация безопасного пароля
export function generateSecurePassword(length = SECURITY_CONFIG.TEMP_PASSWORD_LENGTH) {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let password = '';
  
  // Гарантируем наличие всех типов символов
  password += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'[Math.floor(Math.random() * 26)]; // Заглавная буква
  password += 'abcdefghijklmnopqrstuvwxyz'[Math.floor(Math.random() * 26)]; // Строчная буква
  password += '0123456789'[Math.floor(Math.random() * 10)]; // Цифра
  password += '!@#$%^&*'[Math.floor(Math.random() * 8)]; // Специальный символ
  
  // Заполняем остальные символы
  for (let i = password.length; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)];
  }
  
  // Перемешиваем символы
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

// Хеширование пароля
export function hashPassword(password) {
  return bcrypt.hashSync(password, SECURITY_CONFIG.BCRYPT_ROUNDS);
}

// Проверка пароля
export function verifyPassword(password, hash) {
  return bcrypt.compareSync(password, hash);
}

// Создание JWT токена
export function createToken(payload) {
  return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
    expiresIn: SECURITY_CONFIG.JWT_EXPIRES_IN
  });
}

// Создание refresh токена
export function createRefreshToken(payload) {
  return jwt.sign(payload, SECURITY_CONFIG.JWT_SECRET, {
    expiresIn: SECURITY_CONFIG.JWT_REFRESH_EXPIRES_IN
  });
}

// Верификация JWT токена
export function verifyToken(token) {
  try {
    return jwt.verify(token, SECURITY_CONFIG.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Rate limiting middleware
export const createRateLimit = (windowMs = SECURITY_CONFIG.RATE_LIMIT_WINDOW_MS, max = SECURITY_CONFIG.RATE_LIMIT_MAX_REQUESTS) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Слишком много запросов. Попробуйте позже.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      res.status(429).json({
        error: 'Слишком много запросов. Попробуйте позже.',
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
  });
};

// Строгий rate limiting для аутентификации
export const authRateLimit = createRateLimit(15 * 60 * 1000, 5); // 5 попыток за 15 минут

// Обычный rate limiting
export const generalRateLimit = createRateLimit();

// Middleware для проверки роли
export function requireRole(roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Не авторизован' });
    }
    
    const userRoles = Array.isArray(roles) ? roles : [roles];
    if (!userRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }
    
    next();
  };
}

// Middleware для проверки школы
export function requireSchool(req, res, next) {
  if (!req.user || !req.user.school_id) {
    return res.status(403).json({ error: 'Школа не назначена' });
  }
  
  // Проверяем, что пользователь имеет доступ к запрашиваемой школе
  const requestedSchoolId = req.params.schoolId || req.body.school_id;
  if (requestedSchoolId && req.user.school_id != requestedSchoolId) {
    return res.status(403).json({ error: 'Доступ запрещен' });
  }
  
  next();
}

// Санитизация входных данных
export function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input
      .trim()
      .replace(/[<>]/g, '') // Удаляем потенциально опасные символы
      .substring(0, 1000); // Ограничиваем длину
  }
  return input;
}

// Валидация email
export function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Логирование безопасности
export function logSecurityEvent(event, details, req) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event,
    details,
    ip: req?.ip || req?.connection?.remoteAddress,
    userAgent: req?.get('User-Agent'),
    userId: req?.user?.id
  };
  
  console.log('🔒 Security Event:', JSON.stringify(logEntry, null, 2));
}

// Проверка на подозрительную активность
export function detectSuspiciousActivity(req) {
  const suspiciousPatterns = [
    /script/i,
    /javascript/i,
    /onload/i,
    /onerror/i,
    /<script/i,
    /eval\(/i,
    /expression\(/i
  ];
  
  const userInput = JSON.stringify(req.body) + JSON.stringify(req.query) + JSON.stringify(req.params);
  
  return suspiciousPatterns.some(pattern => pattern.test(userInput));
}

export default {
  SECURITY_CONFIG,
  validatePassword,
  generateSecurePassword,
  hashPassword,
  verifyPassword,
  createToken,
  createRefreshToken,
  verifyToken,
  createRateLimit,
  authRateLimit,
  generalRateLimit,
  requireRole,
  requireSchool,
  sanitizeInput,
  validateEmail,
  logSecurityEvent,
  detectSuspiciousActivity
};
