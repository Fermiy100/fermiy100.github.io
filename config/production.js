/**
 * Production конфигурация для масштабирования
 */

export const PRODUCTION_CONFIG = {
  // Database
  DATABASE: {
    // Для production используем PostgreSQL
    URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/school_meals',
    POOL_SIZE: 20,
    IDLE_TIMEOUT: 30000,
    CONNECTION_TIMEOUT: 2000,
    MAX_CONNECTIONS: 100
  },

  // Redis для кэширования
  REDIS: {
    URL: process.env.REDIS_URL || 'redis://localhost:6379',
    TTL: {
      MENU_CACHE: 300, // 5 минут
      USER_CACHE: 600, // 10 минут
      STATS_CACHE: 1800 // 30 минут
    }
  },

  // Rate Limiting для масштабирования
  RATE_LIMITS: {
    LOGIN: {
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 5, // 5 попыток входа
      skipSuccessfulRequests: true
    },
    API: {
      windowMs: 15 * 60 * 1000, // 15 минут
      max: 1000, // 1000 запросов на IP
      standardHeaders: true,
      legacyHeaders: false
    },
    UPLOAD: {
      windowMs: 60 * 60 * 1000, // 1 час
      max: 10 // 10 загрузок файлов в час
    }
  },

  // File Upload
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['.xlsx', '.xls'],
    TEMP_DIR: '/tmp/uploads'
  },

  // Security
  SECURITY: {
    JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    JWT_EXPIRES_IN: '24h',
    BCRYPT_ROUNDS: 12,
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 минут
    MAX_LOGIN_ATTEMPTS: 5,
    LOCKOUT_TIME: 15 * 60 * 1000 // 15 минут
  },

  // Performance
  PERFORMANCE: {
    COMPRESSION_LEVEL: 6,
    CACHE_CONTROL: {
      STATIC: 'public, max-age=31536000', // 1 год
      API: 'private, max-age=300', // 5 минут
      MENU: 'public, max-age=300' // 5 минут
    }
  },

  // Monitoring
  MONITORING: {
    ENABLE_METRICS: true,
    LOG_LEVEL: 'info',
    ERROR_TRACKING: true,
    PERFORMANCE_TRACKING: true
  },

  // Clustering
  CLUSTERING: {
    ENABLED: process.env.NODE_ENV === 'production',
    WORKERS: process.env.WEB_CONCURRENCY || require('os').cpus().length
  }
};

export default PRODUCTION_CONFIG;
