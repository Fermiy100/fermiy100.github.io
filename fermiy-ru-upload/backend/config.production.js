// Конфигурация для reg.ru хостинга
module.exports = {
  // Основные настройки
  NODE_ENV: 'production',
  PORT: process.env.PORT || 3000,
  
  // База данных (SQLite для простоты)
  DB_PATH: './database.sqlite',
  
  // JWT секрет
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production',
  
  // CORS настройки для вашего домена
  CORS_ORIGIN: 'https://fermiy.ru',
  
  // Безопасность
  BCRYPT_ROUNDS: 12,
  RATE_LIMIT_WINDOW_MS: 900000, // 15 минут
  RATE_LIMIT_MAX_REQUESTS: 100,
  
  // Логирование
  LOG_LEVEL: 'info',
  
  // Файлы
  UPLOAD_PATH: './uploads',
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
};
