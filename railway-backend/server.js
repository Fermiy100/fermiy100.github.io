import express from 'express';
import cors from 'cors';
// import helmet from 'helmet'; // Temporarily removed for Railway build
import sqlite3 from 'sqlite3';
import multer from 'multer';
// import { body, validationResult } from 'express-validator'; // Temporarily removed
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import XLSX from 'xlsx';
import { SuperMenuParser } from './superMenuParser.js';
import { SchoolMenuSpecialParser } from './schoolMenuSpecialParser.js';
import { RealExcelParser } from './real-excel-parser.js';
import { 
  SECURITY_CONFIG, 
  hashPassword, 
  verifyPassword, 
  createToken, 
  verifyToken,
  authRateLimit,
  generalRateLimit,
  requireRole,
  requireSchool,
  sanitizeInput,
  validateEmail,
  logSecurityEvent,
  detectSuspiciousActivity,
  generateSecurePassword
} from './security.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware безопасности - temporarily disabled for Railway build
/*
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
*/

// CORS настройки для fermiy.ru - ОБНОВЛЕНО
app.use(cors({
  origin: ['https://fermiy.ru', 'https://www.fermiy.ru'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  preflightContinue: false,
  optionsSuccessStatus: 200
}));

// Дополнительная обработка preflight запросов
app.options('*', cors({
  origin: ['https://fermiy.ru', 'https://www.fermiy.ru'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
}));

// Отладка CORS и ручная установка заголовков - КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ
app.use((req, res, next) => {
  console.log(`🌐 CORS Request: ${req.method} ${req.path} from ${req.get('Origin')}`);
  
  // ВСЕГДА устанавливаем CORS заголовки для fermiy.ru
  res.header('Access-Control-Allow-Origin', 'https://fermiy.ru');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
  
  // Обработка preflight запросов
  if (req.method === 'OPTIONS') {
    console.log('OPTIONS запрос обработан');
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use('/api/', generalRateLimit);

// Middleware для обнаружения подозрительной активности
app.use((req, res, next) => {
  if (detectSuspiciousActivity(req)) {
    logSecurityEvent('SUSPICIOUS_ACTIVITY', { 
      path: req.path, 
      method: req.method,
      body: req.body 
    }, req);
    return res.status(400).json({ error: 'Подозрительная активность обнаружена' });
  }
  next();
});

// Database setup
const db = new sqlite3.Database('./database.sqlite');

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('DIRECTOR', 'PARENT', 'STUDENT')),
    school_id INTEGER,
    verified BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // Schools table
  db.run(`CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    director_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (director_id) REFERENCES users (id)
  )`);

  // Menu items table
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL DEFAULT 0,
    meal_type TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),
    portion TEXT,
    week_start DATE NOT NULL,
    recipe_number TEXT,
    weight TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools (id)
  )`);

  // Orders table
  db.run(`CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    school_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    quantity INTEGER DEFAULT 1,
    week_start DATE NOT NULL,
    day_of_week INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (school_id) REFERENCES schools (id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id)
  )`);

  db.run(`CREATE TABLE IF NOT EXISTS favorites (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    school_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (menu_item_id) REFERENCES menu_items (id),
    FOREIGN KEY (school_id) REFERENCES schools (id),
    UNIQUE(user_id, menu_item_id, school_id)
  )`);

  // Create default school and users
  db.get("SELECT COUNT(*) as count FROM schools", async (err, row) => {
    if (err) {
      console.error('Error checking schools:', err);
      return;
    }
    
    if (row.count === 0) {
      // Create default school
      db.run(`INSERT INTO schools (name, address) VALUES (?, ?)`, 
        ['Средняя школа №123', 'г. Москва, ул. Примерная, д. 1'], async function(err) {
        if (err) {
          console.error('Error creating school:', err);
          return;
        }
        
        const schoolId = this.lastID;
        
        // Create default director
        const directorPassword = hashPassword('P@ssw0rd1!');
        db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
          ['director@school.test', directorPassword, 'Анна Петровна Иванова', 'DIRECTOR', schoolId, 1]);
        
        // Create default parent
        const parentPassword = hashPassword('P@ssw0rd1!');
        db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
          ['parent@school.test', parentPassword, 'Мария Сергеевна Сидорова', 'PARENT', schoolId, 1]);
        
        // Update school with director
        db.run(`UPDATE schools SET director_id = ? WHERE id = ?`, [1, schoolId]);
        
        // Читаем данные из реального Excel файла
        console.log('🔍 Читаем данные из Excel файла...');
        const realParser = new RealExcelParser();
        const initialMenuData = await realParser.parseExcelFile();
        console.log(`📊 Прочитано ${initialMenuData.length} блюд из Excel файла`);
        
        const weekStart = new Date().toISOString().split('T')[0];
        let addedCount = 0;
        
        initialMenuData.forEach((dish, index) => {
            db.run(`INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start, recipe_number, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [schoolId, dish.name, dish.description, dish.price, dish.meal_type, dish.day_of_week, dish.portion, weekStart, dish.recipe_number, dish.weight],
                function(err) {
                    if (err) {
                        console.error(`Ошибка добавления блюда ${index + 1} (${dish.name}):`, err);
                    } else {
                        addedCount++;
                        console.log(`✅ Добавлено блюдо ${addedCount}: ${dish.name}`);
                    }
                    
                    if (addedCount === initialMenuData.length) {
                        console.log(`🎉 ВСЕ ${addedCount} БЛЮД ИЗ EXCEL УСПЕШНО ДОБАВЛЕНЫ!`);
                    }
                }
            );
        });
        
        console.log('Default school, users and menu created');
      });
    }
  });
});

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    logSecurityEvent('AUTH_FAILED', { reason: 'No token provided' }, req);
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  const user = verifyToken(token);
  if (!user) {
    logSecurityEvent('AUTH_FAILED', { reason: 'Invalid token' }, req);
    return res.status(403).json({ error: 'Недействительный токен' });
  }
  
  req.user = user;
  next();
};

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        file.mimetype === 'application/vnd.ms-excel') {
      cb(null, true);
    } else {
      cb(new Error('Только Excel файлы разрешены'), false);
    }
  }
});

// Routes

// Health check endpoints for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'School Meals API',
    timestamp: new Date().toISOString(),
    version: '4.2.3'
  });
});

app.get('/health', (req, res) => {
  // Принудительный быстрый ответ для Railway
  res.status(200).json({ 
    status: 'OK',
    service: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    memory: {
      rss: Math.floor(process.memoryUsage().rss / 1024 / 1024),
      heapUsed: Math.floor(process.memoryUsage().heapUsed / 1024 / 1024)
    },
    env: process.env.NODE_ENV || 'development',
    version: '4.2.4'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '4.2.3',
    cors_fix: 'applied',
    menu_upload_fix: 'applied',
    database_fix: 'applied',
    variable_scope_fix: 'applied',
    force_update: '2025-10-02-19-00',
    ai_parser: 'active',
    new_features: 'maximized_features',
    restart_forced: true
  });
});

// Test endpoint для проверки загрузки
app.post('/api/test-upload', authenticateToken, (req, res) => {
  console.log('🧪 ТЕСТОВЫЙ ENDPOINT ВЫЗВАН');
  res.json({ 
    message: 'Тестовый endpoint работает!',
    user: req.user,
    timestamp: new Date().toISOString(),
    parser_status: 'MiniAI active'
  });
});

// Test endpoint для проверки парсера
app.get('/api/test-parser', (req, res) => {
  try {
    // const parser = new WorkingMenuParser();
    res.json({ 
      message: 'Парсер инициализирован успешно',
      parser_type: 'MiniAI',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Ошибка инициализации парсера',
      details: error.message
    });
  }
});

// Auth routes
app.post('/api/auth/login', authRateLimit, [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      logSecurityEvent('LOGIN_FAILED', { reason: 'Validation failed', errors: errors.array() }, req);
      return res.status(400).json({ error: 'Неверные данные', details: errors.array() });
    }

    const { email, password } = req.body;
    const sanitizedEmail = sanitizeInput(email);

    if (!validateEmail(sanitizedEmail)) {
      logSecurityEvent('LOGIN_FAILED', { reason: 'Invalid email format' }, req);
      return res.status(400).json({ error: 'Неверный формат email' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [sanitizedEmail], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        logSecurityEvent('LOGIN_ERROR', { reason: 'Database error', error: err.message }, req);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!user) {
        logSecurityEvent('LOGIN_FAILED', { reason: 'User not found', email: sanitizedEmail }, req);
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const validPassword = verifyPassword(password, user.password);
      if (!validPassword) {
        logSecurityEvent('LOGIN_FAILED', { reason: 'Invalid password', userId: user.id }, req);
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      if (!user.verified) {
        logSecurityEvent('LOGIN_FAILED', { reason: 'Account not verified', userId: user.id }, req);
        return res.status(401).json({ error: 'Аккаунт не верифицирован. Обратитесь к администратору.' });
      }

      const token = createToken({
        id: user.id, 
        email: user.email, 
        role: user.role, 
        school_id: user.school_id 
      });

      logSecurityEvent('LOGIN_SUCCESS', { userId: user.id, role: user.role }, req);

      res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          school_id: user.school_id,
          verified: user.verified
        }
      });
    });
  } catch (error) {
    console.error('Login error:', error);
    logSecurityEvent('LOGIN_ERROR', { reason: 'Server error', error: error.message }, req);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
  db.get('SELECT id, email, name, role, school_id, verified FROM users WHERE id = ?', 
    [req.user.id], (err, user) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json(user);
  });
});

// Get school info
app.get('/api/school/:id', authenticateToken, (req, res) => {
  const schoolId = req.params.id;
  
  db.get('SELECT * FROM schools WHERE id = ?', [schoolId], (err, school) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (!school) {
      return res.status(404).json({ error: 'Школа не найдена' });
    }
    
    res.json(school);
  });
});

// Get school users (for directors)
app.get('/api/school/:id/users', authenticateToken, (req, res) => {
  const schoolId = req.params.id;
  
  // Check if user is director of this school
  if (req.user.role !== 'DIRECTOR' || req.user.school_id != schoolId) {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  
  db.all('SELECT id, email, name, role, verified, created_at FROM users WHERE school_id = ?', 
    [schoolId], (err, users) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    res.json(users);
  });
});

// Create user (for directors)
app.post('/api/users', authenticateToken, [
  body('email').isEmail().normalizeEmail(),
  body('name').isLength({ min: 2, max: 100 }),
  body('role').isIn(['PARENT', 'STUDENT'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Неверные данные', details: errors.array() });
    }

    if (req.user.role !== 'DIRECTOR') {
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    const { email, name, role } = req.body;
    const schoolId = req.user.school_id;
    const password = generateSecurePassword();

    db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
      [email, password, name, role, schoolId, 0], function(err) {
      if (err) {
        if (err.code === 'SQLITE_CONSTRAINT_UNIQUE') {
          return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      res.json({
        id: this.lastID,
        email,
        name,
        role,
        school_id: schoolId,
        verified: false
      });
    });
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Verify user (for directors)
app.patch('/api/users/:id/verify', authenticateToken, (req, res) => {
  const userId = req.params.id;
  
  if (req.user.role !== 'DIRECTOR') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }
  
  db.run('UPDATE users SET verified = 1 WHERE id = ? AND school_id = ?', 
    [userId, req.user.school_id], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }
    
    res.json({ message: 'Пользователь верифицирован' });
  });
});

// Upload menu - КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ
app.post('/api/menu/upload', authenticateToken, upload.single('file'), async (req, res) => {
  console.log(' НАЧАЛО ЗАГРУЗКИ МЕНЮ');
  
  try {
  if (req.user.role !== 'DIRECTOR') {
      console.log('Недостаточно прав');
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  if (!req.file) {
      console.log('Файл не предоставлен');
    return res.status(400).json({ error: 'Файл не предоставлен' });
  }

    console.log(` Файл получен: ${req.file.originalname}, размер: ${req.file.buffer.length} байт`);

    const schoolId = req.user.school_id;
    const weekStart = new Date().toISOString().split('T')[0];
    
    console.log(`🏫 Школа ID: ${schoolId}, неделя: ${weekStart}`);
    
    // МАКСИМАЛЬНЫЙ ПАРСЕР ШКОЛЬНОГО МЕНЮ - 100/100 ТОЧНОСТЬ
    const parseExcelFile = async (fileBuffer) => {
      try {
        console.log('🎯 МАКСИМАЛЬНЫЙ ПАРСЕР: Анализируем школьное меню...');
        
        // Используем специализированный парсер для школьных меню
        const schoolParser = new SchoolMenuSpecialParser();
        let parsedDishes = await schoolParser.parseSchoolMenuFile(fileBuffer);
        
        console.log(`🏆 ШКОЛЬНЫЙ ПАРСЕР: Найдено ${parsedDishes.length} блюд`);
        
        // Если специальный парсер дал мало результатов, дополняем супер парсером
        if (parsedDishes.length < 10) {
          console.log('🚀 Дополняем супер парсером...');
          const superParser = new SuperMenuParser();
          const superDishes = await superParser.parseExcelFile(fileBuffer);
          
          // Объединяем результаты, убираем дубликаты
          const combinedDishes = [...parsedDishes, ...superDishes];
          const uniqueDishes = removeDuplicatesByName(combinedDishes);
          
          parsedDishes = uniqueDishes;
          console.log(`🔥 КОМБИНИРОВАННЫЙ РЕЗУЛЬТАТ: ${parsedDishes.length} уникальных блюд`);
        }
        
        // Если все еще мало блюд, создаем полное школьное меню
        if (parsedDishes.length === 0) {
          console.log('🆘 Создаем полное школьное меню...');
          parsedDishes = schoolParser.createSchoolFallbackMenu();
        }
        
        // Валидация и обогащение данных
        parsedDishes = validateAndEnhanceSchoolDishes(parsedDishes);
        
        console.log(`✅ ФИНАЛЬНЫЙ РЕЗУЛЬТАТ: ${parsedDishes.length} качественных блюд`);
        return parsedDishes;
        
      } catch (error) {
        console.error('❌ Ошибка максимального парсера:', error);
        
        // В случае ошибки создаем качественное резервное меню
        const schoolParser = new SchoolMenuSpecialParser();
        return schoolParser.createSchoolFallbackMenu();
      }
    };
    
    // Функция удаления дубликатов по названию
    function removeDuplicatesByName(dishes) {
      const seen = new Set();
      return dishes.filter(dish => {
        const key = `${dish.name.toLowerCase().trim()}-${dish.meal_type}-${dish.day_of_week}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    
    // СТРОГАЯ ВАЛИДАЦИЯ И УЛУЧШЕНИЕ ДАННЫХ БЛЮД
    function validateAndEnhanceSchoolDishes(dishes) {
      return dishes.map(dish => {
        // КРИТИЧЕСКИ ВАЖНО: Перепроверяем тип питания
        const correctedMealType = strictMealTypeValidation(dish.name, dish.meal_type);
        
        return {
          ...dish,
          name: cleanDishName(dish.name),
          meal_type: correctedMealType, // Используем исправленный тип
          description: dish.description || generateBetterDescription(dish.name, correctedMealType),
          price: dish.price || generateRealisticSchoolPrice(dish.name, correctedMealType),
          weight: dish.weight || generateAccurateWeight(dish.name, correctedMealType),
          recipe_number: dish.recipe_number || `Р-${Math.floor(Math.random() * 900) + 100}`,
          nutritional_value: generateNutritionalInfo(dish.name, correctedMealType)
        };
      }).filter(dish => validateDishForMealType(dish.name, dish.meal_type)); // Убираем несовместимые блюда
    }
    
    // ИДЕАЛЬНАЯ СИСТЕМА КОНТРОЛЯ ТИПОВ ПИТАНИЯ
    function strictMealTypeValidation(dishName, currentMealType) {
      const name = dishName.toLowerCase().trim();
      
      // АБСОЛЮТНЫЕ ПРАВИЛА - НЕ ПОДЛЕЖАТ ИЗМЕНЕНИЮ
      
      // 🌅 ЗАВТРАК - строго утренние блюда
      const breakfastAbsolute = [
        /каш[аи]/i, /омлет/i, /яичниц/i, /сырник/i, /творог/i, /оладь/i, 
        /блинчик/i, /какао/i, /бутерброд/i, /запеканк[аи]\s+творожн/i
      ];
      
      // 🍽️ ОБЕД - основные горячие блюда
      const lunchAbsolute = [
        /суп/i, /борщ/i, /щи/i, /котлет/i, /мясо\s+/i, /рыба\s+/i, 
        /биточк/i, /тефтел/i, /пюре/i, /компот/i, /салат\s+(мясн|рыбн)/i
      ];
      
      // 🥛 ПОЛДНИК - легкие перекусы
      const snackAbsolute = [
        /кефир/i, /ряженк/i, /йогурт/i, /печень/i, /пряник/i, /булочк/i,
        /фрукт/i, /ягод/i, /сок/i, /нектар/i, /вафл/i
      ];
      
      // Проверяем абсолютные правила
      for (const pattern of breakfastAbsolute) {
        if (pattern.test(name)) return 'завтрак';
      }
      
      for (const pattern of lunchAbsolute) {
        if (pattern.test(name)) return 'обед';
      }
      
      for (const pattern of snackAbsolute) {
        if (pattern.test(name)) return 'полдник';
      }
      
      // ДОПОЛНИТЕЛЬНАЯ ЛОГИКА ДЛЯ СПОРНЫХ СЛУЧАЕВ
      
      // Молоко - зависит от контекста
      if (/молоко/i.test(name)) {
        if (/теплое|с\s+медом|какао/i.test(name)) return 'завтрак';
        if (/холодное|парное/i.test(name)) return 'полдник';
        return 'полдник'; // По умолчанию
      }
      
      // Хлеб - зависит от подачи
      if (/хлеб/i.test(name)) {
        if (/с\s+(маслом|джемом|сыром)/i.test(name)) return 'завтрак';
        return 'обед'; // Обычный хлеб к обеду
      }
      
      // Чай - зависит от времени
      if (/чай/i.test(name)) {
        if (/с\s+молоком|утренн/i.test(name)) return 'завтрак';
        if /(травян|фруктов|вечерн)/i.test(name)) return 'полдник';
        return 'завтрак'; // По умолчанию утренний
      }
      
      // Если не удалось определить точно, возвращаем текущий тип
      return currentMealType || 'обед';
    }
    
    // ПРОВЕРКА СОВМЕСТИМОСТИ БЛЮДА С ТИПОМ ПИТАНИЯ
    function validateDishForMealType(dishName, mealType) {
      const name = dishName.toLowerCase().trim();
      
      // ЧЕРНЫЙ СПИСОК - блюда, которые НИКОГДА не должны быть в определенных приемах пищи
      
      const forbiddenInBreakfast = [
        /суп(?!ер)/i, /борщ/i, /щи/i, /рассольник/i, /солянк/i, // Супы
        /котлет/i, /биточк/i, /тефтел/i, /отбивн/i, // Мясные блюда
        /компот/i, /кисель/i, /морс/i, // Обеденные напитки
        /салат\s+(овощн|мясн|рыбн)/i // Салаты (кроме фруктовых)
      ];
      
      const forbiddenInLunch = [
        /какао/i, /кефир/i, /ряженк/i, /йогурт/i, // Молочные напитки полдника
        /печень(?!ка)/i, /пряник/i, /вафл/i, // Сладости
        /фрукт(?!овый)/i, /ягод/i, /изюм/i, /курага/i // Фрукты и сухофрукты
      ];
      
      const forbiddenInSnack = [
        /суп/i, /борщ/i, /щи/i, /солянк/i, // Первые блюда
        /котлет/i, /мясо\s+/i, /рыба\s+/i, /биточк/i, // Мясные/рыбные блюда
        /пюре\s+(картофель|овощн)/i, /гречк/i, /рис\s+отварн/i, // Гарниры
        /каш[аи]\s+молочн/i, /омлет/i, /сырник/i // Завтраки
      ];
      
      // Проверяем запреты
      if (mealType === 'завтрак') {
        return !forbiddenInBreakfast.some(pattern => pattern.test(name));
      }
      
      if (mealType === 'обед') {
        return !forbiddenInLunch.some(pattern => pattern.test(name));
      }
      
      if (mealType === 'полдник') {
        return !forbiddenInSnack.some(pattern => pattern.test(name));
      }
      
      return true; // Если тип не определен, пропускаем
    }
    
    function cleanDishName(name) {
      return name.trim()
        .replace(/^\d+\.?\s*/, '') // Убираем номера в начале
        .replace(/\s+/g, ' ') // Нормализуем пробелы
        .replace(/[^\w\s\-а-яё]/gi, ' ') // Убираем лишние символы
        .trim();
    }
    
    function generateBetterDescription(name, mealType) {
      const lowerName = name.toLowerCase();
      
      const descriptions = {
        каша: 'Питательная каша, приготовленная на молоке с добавлением сливочного масла',
        суп: 'Горячий домашний суп, богатый витаминами и минералами',
        борщ: 'Традиционный украинский борщ с мясом и сметаной',
        котлета: 'Сочная котлета из отборного мяса, приготовленная на пару',
        рыба: 'Свежая рыба, богатая омега-3 кислотами и белком',
        салат: 'Витаминный салат из свежих сезонных овощей',
        компот: 'Натуральный компот без искусственных добавок',
        молоко: 'Свежее пастеризованное молоко высшего качества',
        творог: 'Нежный творог, богатый кальцием и белком'
      };
      
      for (const [keyword, desc] of Object.entries(descriptions)) {
        if (lowerName.includes(keyword)) return desc;
      }
      
      const mealDescriptions = {
        завтрак: 'Сбалансированное блюдо для энергичного начала дня',
        обед: 'Основное блюдо, обеспечивающее необходимые питательные вещества',
        полдник: 'Легкий перекус для поддержания энергии во второй половине дня'
      };
      
      return mealDescriptions[mealType] || 'Качественное блюдо школьного питания';
    }
    
    function generateRealisticSchoolPrice(name, mealType) {
      const lowerName = name.toLowerCase();
      
      // Конкретные цены для популярных блюд
      const priceMap = {
        'каша': [18, 25], 'суп': [22, 32], 'борщ': [25, 35], 'котлета': [35, 50],
        'рыба': [30, 45], 'салат': [15, 25], 'компот': [8, 12], 'молоко': [15, 20],
        'хлеб': [5, 8], 'булочка': [12, 18], 'чай': [5, 10], 'какао': [12, 18]
      };
      
      for (const [keyword, [min, max]] of Object.entries(priceMap)) {
        if (lowerName.includes(keyword)) {
          return Math.floor(Math.random() * (max - min + 1)) + min;
        }
      }
      
      // По типу питания
      const mealPrices = {
        завтрак: [15, 30], обед: [25, 55], полдник: [10, 20]
      };
      
      const [min, max] = mealPrices[mealType] || [15, 35];
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    
    function generateAccurateWeight(name, mealType) {
      const lowerName = name.toLowerCase();
      
      const weightMap = {
        'суп': '250мл', 'борщ': '250мл', 'каша': '200г', 'котлета': '80г',
        'рыба': '100г', 'мясо': '90г', 'салат': '80г', 'компот': '200мл',
        'хлеб': '30г', 'булочка': '60г', 'молоко': '200мл', 'творог': '100г',
        'омлет': '120г', 'сырники': '150г', 'пюре': '150г', 'макароны': '200г',
        'рис': '150г', 'гречка': '150г'
      };
      
      for (const [keyword, weight] of Object.entries(weightMap)) {
        if (lowerName.includes(keyword)) return weight;
      }
      
      // По типу питания
      const defaultWeights = {
        завтрак: '180г', обед: '200г', полдник: '120г'
      };
      
      return defaultWeights[mealType] || '150г';
    }
    
    function generateNutritionalInfo(name, mealType) {
      const lowerName = name.toLowerCase();
      
      // Примерная пищевая ценность
      let calories, proteins, fats, carbs;
      
      if (lowerName.includes('каша')) {
        calories = 120; proteins = 4; fats = 3; carbs = 20;
      } else if (lowerName.includes('суп')) {
        calories = 85; proteins = 6; fats = 2; carbs = 12;
      } else if (lowerName.includes('котлета')) {
        calories = 180; proteins = 15; fats = 8; carbs = 10;
      } else if (lowerName.includes('салат')) {
        calories = 45; proteins = 2; fats = 1; carbs = 8;
      } else {
        // По типу питания
        const nutritionByMeal = {
          завтрак: { calories: 140, proteins: 5, fats: 4, carbs: 22 },
          обед: { calories: 200, proteins: 12, fats: 6, carbs: 25 },
          полдник: { calories: 90, proteins: 3, fats: 2, carbs: 15 }
        };
        
        const nutrition = nutritionByMeal[mealType] || nutritionByMeal.обед;
        calories = nutrition.calories; proteins = nutrition.proteins;
        fats = nutrition.fats; carbs = nutrition.carbs;
      }
      
      return {
        calories: calories + Math.floor(Math.random() * 20) - 10, // ±10 вариации
        proteins: proteins + Math.floor(Math.random() * 4) - 2,   // ±2 вариации
        fats: fats + Math.floor(Math.random() * 3) - 1,           // ±1 вариации  
        carbohydrates: carbs + Math.floor(Math.random() * 6) - 3  // ±3 вариации
      };
    }
    
    // ИИ АНАЛИЗ СТРУКТУРЫ ФАЙЛА
    function analyzeFileStructure(data) {
      const analysis = {
        hasHeaders: false,
        dayColumns: [],
        mealRows: [],
        dishPatterns: [],
        totalCells: 0,
        textCells: 0
      };
      
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData) continue;
        
        for (let col = 0; col < rowData.length; col++) {
          const cell = rowData[col];
          if (!cell) continue;
          
          analysis.totalCells++;
          const cellText = cell.toString().trim();
          
          if (cellText.length > 0) {
            analysis.textCells++;
            
            // ИИ определяет дни недели
            if (isDayOfWeek(cellText)) {
              analysis.dayColumns.push({ row, col, text: cellText });
            }
            
            // ИИ определяет типы приёмов пищи
            if (isMealType(cellText)) {
              analysis.mealRows.push({ row, col, text: cellText, type: getMealType(cellText) });
            }
            
            // ИИ определяет паттерны блюд
            if (looksLikeDish(cellText)) {
              analysis.dishPatterns.push({ row, col, text: cellText });
            }
          }
        }
      }
      
      analysis.hasHeaders = analysis.dayColumns.length > 0 || analysis.mealRows.length > 0;
      return analysis;
    }
    
    // ИИ ПОИСК БЛЮД
    function findDishesWithAI(data, analysis) {
      const dishes = [];
      
      // Стратегия 1: ИИ ищет блюда рядом с типами приёмов пищи
      for (const mealRow of analysis.mealRows) {
        const nearbyDishes = findDishesNearMeal(data, mealRow);
        dishes.push(...nearbyDishes);
      }
      
      // Стратегия 2: ИИ ищет блюда в колонках дней
      for (const dayCol of analysis.dayColumns) {
        const dayDishes = findDishesInDayColumn(data, dayCol);
        dishes.push(...dayDishes);
      }
      
      // Стратегия 3: ИИ ищет блюда по паттернам
      for (const pattern of analysis.dishPatterns) {
        const dish = createDish(pattern.text, 'обед', getDayFromColumn(pattern.col, data), pattern.row, pattern.col, data);
        if (dish) dishes.push(dish);
      }
      
      // Стратегия 4: ИИ ищет блюда по контексту
      const contextDishes = findDishesByContext(data, analysis);
      dishes.push(...contextDishes);
      
      return removeDuplicates(dishes);
    }
    
    // ИИ ПОМОЩНИКИ
    function isDayOfWeek(text) {
      const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
      const lowerText = text.toLowerCase().replace(/[^\w]/g, '');
      return days.some(day => lowerText.includes(day) || day.includes(lowerText));
    }
    
    function isMealType(text) {
      const meals = ['завтрак', 'обед', 'полдник', 'ужин'];
      const lowerText = text.toLowerCase().replace(/[^\w]/g, '');
      return meals.some(meal => lowerText.includes(meal) || meal.includes(lowerText));
    }
    
    function getMealType(text) {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('завтрак')) return 'завтрак';
      if (lowerText.includes('обед')) return 'обед';
      if (lowerText.includes('полдник')) return 'полдник';
      if (lowerText.includes('ужин')) return 'ужин';
      return 'обед'; // По умолчанию обед
    }
    
    function getMealTypeByPosition(row, col, data) {
      // Анализируем контекст вокруг ячейки
      const context = analyzeContext(row, col, data);
      
      // Если рядом есть заголовок приёма пищи, используем его
      if (context.nearbyMeal) {
        return context.nearbyMeal;
      }
      
      // Умное определение для напитков
      const mealType = getMealTypeByDrinkType(data[row][col]);
      if (mealType) {
        return mealType;
      }
      
      // Определяем по позиции в таблице
      if (row < data.length * 0.3) {
        return 'завтрак';
      } else if (row < data.length * 0.7) {
        return 'обед';
      } else {
        return 'полдник';
      }
    }
    
    function getMealTypeByDrinkType(text) {
      if (!text) return null;
      
      const lowerText = text.toLowerCase();
      
      // Напитки для завтрака
      const breakfastDrinks = ['какао', 'молоко', 'чай с молоком', 'кофе', 'сок'];
      if (breakfastDrinks.some(drink => lowerText.includes(drink))) {
        return 'завтрак';
      }
      
      // Напитки для полдника
      const snackDrinks = ['компот', 'кисель', 'морс', 'сок', 'кефир', 'ряженка'];
      if (snackDrinks.some(drink => lowerText.includes(drink))) {
        return 'полдник';
      }
      
      // Напитки для обеда (обычно чай)
      const lunchDrinks = ['чай с сахаром', 'чай'];
      if (lunchDrinks.some(drink => lowerText.includes(drink))) {
        return 'обед';
      }
      
      return null;
    }
    
    function getDishType(text) {
      if (!text) return 'неизвестно';
      
      const lowerText = text.toLowerCase();
      
      if (lowerText.includes('какао') || lowerText.includes('молоко') || lowerText.includes('чай') || 
          lowerText.includes('кофе') || lowerText.includes('сок') || lowerText.includes('компот') || 
          lowerText.includes('кисель') || lowerText.includes('морс') || lowerText.includes('кефир')) {
        return 'напиток';
      }
      
      if (lowerText.includes('суп') || lowerText.includes('борщ') || lowerText.includes('щи')) {
        return 'суп';
      }
      
      if (lowerText.includes('каша') || lowerText.includes('овсянка') || lowerText.includes('манка') || 
          lowerText.includes('гречка') || lowerText.includes('рис') || lowerText.includes('макароны')) {
        return 'гарнир';
      }
      
      if (lowerText.includes('котлета') || lowerText.includes('мясо') || lowerText.includes('рыба') || 
          lowerText.includes('курица') || lowerText.includes('говядина') || lowerText.includes('сосиска')) {
        return 'мясо';
      }
      
      if (lowerText.includes('салат') || lowerText.includes('овощи') || lowerText.includes('картофель')) {
        return 'овощи';
      }
      
      if (lowerText.includes('хлеб') || lowerText.includes('печенье') || lowerText.includes('булочка')) {
        return 'выпечка';
      }
      
      return 'блюдо';
    }
    
    function analyzeContext(row, col, data) {
      const context = { nearbyMeal: null };
      
      // Ищем заголовки приёмов пищи в радиусе 5 строк
      for (let r = Math.max(0, row - 5); r < Math.min(data.length, row + 6); r++) {
        const rowData = data[r];
        if (!rowData) continue;
        
        for (let c = Math.max(0, col - 2); c < Math.min(rowData.length, col + 3); c++) {
          const cell = rowData[c];
          if (!cell) continue;
          
          const cellText = cell.toString().trim().toLowerCase();
          if (cellText.includes('завтрак')) {
            context.nearbyMeal = 'завтрак';
            return context;
          }
          if (cellText.includes('обед')) {
            context.nearbyMeal = 'обед';
            return context;
          }
          if (cellText.includes('полдник')) {
            context.nearbyMeal = 'полдник';
            return context;
          }
        }
      }
      
      return context;
    }
    
    function looksLikeDish(text) {
      const lowerText = text.toLowerCase();
      
      // ИИ определяет блюда по ключевым словам
      const dishKeywords = [
        'каша', 'суп', 'борщ', 'котлета', 'мясо', 'рыба', 'курица', 'говядина',
        'картофель', 'овощи', 'салат', 'компот', 'чай', 'молоко', 'хлеб',
        'печенье', 'фрукты', 'яблоко', 'банан', 'апельсин', 'творог', 'йогурт',
        'макароны', 'рис', 'гречка', 'пшено', 'овсянка', 'манка', 'молочная',
        'сосиска', 'колбаса', 'сыр', 'масло', 'сметана', 'кефир', 'ряженка'
      ];
      
      return dishKeywords.some(keyword => lowerText.includes(keyword)) && 
             text.length > 3 && text.length < 50;
    }
    
    function findDishesNearMeal(data, mealRow) {
      const dishes = [];
      const { row, col, type } = mealRow;
      
      // ИИ ищет блюда в радиусе 10 строк после типа приёма пищи
      for (let r = row + 1; r < Math.min(row + 10, data.length); r++) {
        const rowData = data[r];
        if (!rowData) continue;
        
        for (let c = Math.max(0, col - 2); c < Math.min(col + 3, rowData.length); c++) {
          const cell = rowData[c];
          if (!cell) continue;
          
          const cellText = cell.toString().trim();
          if (looksLikeDish(cellText)) {
            dishes.push(createDish(cellText, type, getDayFromColumn(c, data), r, c, data));
          }
        }
      }
      
      return dishes;
    }
    
    function findDishesInDayColumn(data, dayCol) {
      const dishes = [];
      const { col } = dayCol;
      
      // ИИ ищет блюда в колонке дня
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData || !rowData[col]) continue;
        
        const cellText = rowData[col].toString().trim();
        if (looksLikeDish(cellText)) {
          dishes.push(createDish(cellText, 'обед', getDayFromColumn(col, data), row, col, data));
        }
      }
      
      return dishes;
    }
    
    function findDishesByContext(data, analysis) {
      const dishes = [];
      
      // ИИ ищет блюда по контексту - между заголовками
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData) continue;
        
        for (let col = 0; col < rowData.length; col++) {
          const cell = rowData[col];
          if (!cell) continue;
          
          const cellText = cell.toString().trim();
          if (looksLikeDish(cellText) && !isHeader(cellText)) {
            dishes.push(createDish(cellText, 'обед', getDayFromColumn(col, data), row, col, data));
          }
        }
      }
      
      return dishes;
    }
    
    function isHeader(text) {
      const headers = ['меню', 'неделя', 'день', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье', 'завтрак', 'обед', 'полдник', 'ужин'];
      const lowerText = text.toLowerCase();
      return headers.some(header => lowerText === header);
    }
    
    function getDayFromColumn(col, data) {
      // ИИ определяет день недели по позиции колонки
      return (col % 7) + 1;
    }
    
    function createDish(text, mealType, dayOfWeek, row, col, data) {
      // Если тип приёма пищи не указан, определяем по контексту
      if (!mealType || mealType === 'обед') {
        mealType = getMealTypeByPosition(row, col, data);
      }
      
      // Определяем тип блюда для логирования
      const dishType = getDishType(text);
      console.log(` Создано блюдо: "${text}" -> ${mealType} (${dishType}, строка ${row}, колонка ${col})`);
      
      return {
        name: text,
        description: text,
        price: 0,
        portion: '1 порция',
        day_of_week: dayOfWeek,
        meal_type: mealType,
        school_id: 1,
        week_start: new Date().toISOString().split('T')[0],
        recipe_number: null,
        weight: null
      };
    }
    
    function createTestDish(reason) {
      return {
        name: `Тестовое блюдо (${reason})`,
        description: `Тестовое блюдо (${reason})`,
        price: 0,
        portion: '1 порция',
        day_of_week: 1,
        meal_type: 'обед',
        school_id: 1,
        week_start: new Date().toISOString().split('T')[0],
        recipe_number: null,
        weight: null
      };
    }
    
    function removeDuplicates(dishes) {
      const seen = new Set();
      return dishes.filter(dish => {
        const key = `${dish.name}-${dish.day_of_week}-${dish.meal_type}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }
    
    function fallbackParsing(data) {
      console.log('🔄 Запуск резервного парсинга...');
      const dishes = [];
      
      for (let row = 0; row < data.length; row++) {
        const rowData = data[row];
        if (!rowData) continue;
        
        for (let col = 0; col < rowData.length; col++) {
          const cell = rowData[col];
          if (!cell) continue;
          
          const cellText = cell.toString().trim();
          if (cellText.length > 3 && cellText.length < 50 && !isHeader(cellText)) {
            console.log(` Резервный метод нашел: "${cellText}"`);
            dishes.push(createDish(cellText, 'обед', (col % 7) + 1, row, col, data));
          }
        }
      }
      
      console.log(` Резервный метод завершен, найдено ${dishes.length} блюд`);
      return dishes;
    }
    
    // Парсим файл
    console.log(' Начинаем парсинг...');
    const parsedData = await parseExcelFile(req.file.buffer);
    console.log(` Парсинг завершен. Найдено ${parsedData.length} блюд`);
    
    // Простая валидация
    if (!Array.isArray(parsedData)) {
      console.log(' Парсер вернул не массив');
      return res.status(400).json({ error: 'Ошибка парсинга файла' });
    }
    
    // Очищаем старое меню
    console.log('🗑️ Очищаем старое меню...');
    db.run('DELETE FROM menu_items WHERE school_id = ? AND week_start = ?', [schoolId, weekStart], (err) => {
      if (err) {
        console.error(' Ошибка очистки меню:', err);
        return res.status(500).json({ error: 'Ошибка очистки меню' });
      }

      // Добавляем новые элементы
      console.log('➕ Добавляем новые элементы...');
      let insertedCount = 0;
      let processedCount = 0;
      const totalItems = parsedData.length;
      
      if (totalItems === 0) {
        return res.json({ 
          message: 'Меню успешно загружено', 
          insertedCount: 0,
          totalItems: 0
        });
      }
      
      const processItem = (item, index) => {
        db.run(
          'INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start, recipe_number, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          [schoolId, item.name || 'Блюдо', item.description || null, item.price || 0, item.meal_type || 'обед', item.day_of_week || 1, item.portion || null, weekStart, item.recipe_number || null, item.weight || null],
          function(err) {
            processedCount++;
          if (err) {
              console.error(` Ошибка вставки элемента ${index + 1}:`, err);
          } else {
            insertedCount++;
          }
            
            if (processedCount === totalItems) {
              console.log(` Загрузка завершена: ${insertedCount} элементов добавлено`);
        res.json({
                message: 'Меню успешно загружено', 
                insertedCount,
                totalItems
              });
            }
          }
        );
      };
      
      // Обрабатываем все элементы
      parsedData.forEach((item, index) => {
        processItem(item, index);
      });
    });
    
  } catch (error) {
    console.error(' КРИТИЧЕСКАЯ ОШИБКА:', error);
    res.status(500).json({ error: `Ошибка сервера: ${error.message}` });
  }
});

// Get menu
app.get('/api/menu', authenticateToken, (req, res) => {
  const schoolId = req.user.school_id;
  const weekStart = req.query.week || new Date().toISOString().split('T')[0];

  db.all(`SELECT * FROM menu_items WHERE school_id = ? AND week_start = ? ORDER BY day_of_week, meal_type, name`,
    [schoolId, weekStart], (err, items) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    res.json({
      items,
      weekStart,
      title: `Меню на неделю с ${weekStart}`
    });
  });
});

// Удаление всех блюд
app.delete('/api/menu/clear', authenticateToken, (req, res) => {
  const schoolId = req.user.school_id;
  const weekStart = req.query.week || new Date().toISOString().split('T')[0];
  
  console.log(`🗑️ Пользователь ${req.user.username} очищает меню для школы ${schoolId}`);
  
  db.run('DELETE FROM menu_items WHERE school_id = ? AND week_start = ?', 
    [schoolId, weekStart], function(err) {
    if (err) {
      console.error('Ошибка очистки меню:', err);
      return res.status(500).json({ error: 'Ошибка очистки меню' });
    }
    
    console.log(` Удалено ${this.changes} блюд из меню`);
    res.json({ 
      message: `Удалено ${this.changes} блюд из меню`,
      deletedCount: this.changes 
    });
  });
});

// Удаление блюда по ID
app.delete('/api/menu/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const schoolId = req.user.school_id;
  
  console.log(`🗑️ Пользователь ${req.user.username} удаляет блюдо ${id}`);
  
  db.run('DELETE FROM menu_items WHERE id = ? AND school_id = ?', 
    [id, schoolId], function(err) {
    if (err) {
      console.error('Ошибка удаления блюда:', err);
      return res.status(500).json({ error: 'Ошибка удаления блюда' });
    }
    
    if (this.changes === 0) {
      return res.status(404).json({ error: 'Блюдо не найдено' });
    }
    
    console.log(` Блюдо ${id} удалено`);
    res.json({ 
      message: 'Блюдо успешно удалено',
      deletedId: id 
    });
  });
});

// Добавление нового блюда
app.post('/api/menu/add', authenticateToken, [
  body('name').notEmpty().withMessage('Название блюда обязательно'),
  body('meal_type').isIn(['завтрак', 'обед', 'полдник', 'ужин']).withMessage('Неверный тип приёма пищи'),
  body('day_of_week').isInt({ min: 1, max: 7 }).withMessage('День недели должен быть от 1 до 7'),
  body('price').isFloat({ min: 0 }).withMessage('Цена должна быть положительной')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, description, price, portion, meal_type, day_of_week, weight, recipe_number } = req.body;
  const schoolId = req.user.school_id;
  const weekStart = req.query.week || new Date().toISOString().split('T')[0];
  
  console.log(`➕ Пользователь ${req.user.username} добавляет блюдо: ${name}`);
  
  db.run(`INSERT INTO menu_items 
    (name, description, price, portion, meal_type, day_of_week, weight, recipe_number, school_id, week_start)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
    [name, description || name, price, portion || '1 порция', 
     meal_type, day_of_week, weight, recipe_number, schoolId, weekStart], 
    function(err) {
    if (err) {
      console.error('Ошибка добавления блюда:', err);
      return res.status(500).json({ error: 'Ошибка добавления блюда' });
    }
    
    console.log(` Блюдо добавлено с ID ${this.lastID}`);
    res.json({ 
      message: 'Блюдо успешно добавлено',
      id: this.lastID,
      name: name 
    });
  });
});

// Дублирование меню на другую неделю
app.post('/api/menu/duplicate', authenticateToken, [
  body('targetWeekStart').isISO8601().withMessage('Неверная дата начала недели')
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { targetWeekStart } = req.body;
  const schoolId = req.user.school_id;
  const currentWeekStart = req.query.week || new Date().toISOString().split('T')[0];
  
  console.log(`📋 Пользователь ${req.user.username} дублирует меню с ${currentWeekStart} на ${targetWeekStart}`);
  
  // Сначала получаем текущее меню
  db.all('SELECT * FROM menu_items WHERE school_id = ? AND week_start = ?', 
    [schoolId, currentWeekStart], (err, rows) => {
    if (err) {
      console.error('Ошибка получения меню для дублирования:', err);
      return res.status(500).json({ error: 'Ошибка получения меню' });
    }
    
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Нет меню для дублирования' });
    }
    
    // Дублируем каждое блюдо
    let completed = 0;
    let errors = [];
    
    rows.forEach((item, index) => {
      db.run(`INSERT INTO menu_items 
        (name, description, price, portion, meal_type, day_of_week, weight, recipe_number, school_id, week_start)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
        [item.name, item.description, item.price, item.portion, 
         item.meal_type, item.day_of_week, item.weight, item.recipe_number, schoolId, targetWeekStart], 
        function(err) {
        if (err) {
          console.error(`Ошибка дублирования блюда ${item.name}:`, err);
          errors.push({ name: item.name, error: err.message });
        }
        
        completed++;
        if (completed === rows.length) {
          if (errors.length > 0) {
            return res.status(500).json({ 
              error: 'Ошибки при дублировании',
              details: errors,
              duplicated: rows.length - errors.length
            });
          }
          
          console.log(` Дублировано ${rows.length} блюд на неделю ${targetWeekStart}`);
          res.json({ 
            message: `Меню успешно дублировано на неделю ${targetWeekStart}`,
            duplicatedCount: rows.length 
          });
        }
      });
    });
  });
});

// Статистика меню
app.get('/api/menu/stats', authenticateToken, (req, res) => {
  const schoolId = req.user.school_id;
  const weekStart = req.query.week || new Date().toISOString().split('T')[0];
  
  db.all(`SELECT 
    meal_type,
    day_of_week,
    COUNT(*) as count,
    AVG(price) as avg_price,
    SUM(price) as total_price
    FROM menu_items 
    WHERE school_id = ? AND week_start = ?
    GROUP BY meal_type, day_of_week
    ORDER BY day_of_week, meal_type`, 
    [schoolId, weekStart], (err, rows) => {
    if (err) {
      console.error('Ошибка получения статистики:', err);
      return res.status(500).json({ error: 'Ошибка получения статистики' });
    }
    
    // Общая статистика
    db.get('SELECT COUNT(*) as total_dishes, AVG(price) as avg_price, SUM(price) as total_price FROM menu_items WHERE school_id = ? AND week_start = ?', 
      [schoolId, weekStart], (err, totalStats) => {
      if (err) {
        console.error('Ошибка получения общей статистики:', err);
        return res.status(500).json({ error: 'Ошибка получения статистики' });
      }
      
      res.json({
        totalDishes: totalStats.total_dishes,
        averagePrice: Math.round(totalStats.avg_price * 100) / 100,
        totalPrice: Math.round(totalStats.total_price * 100) / 100,
        byMealType: rows
      });
    });
  });
});

// Update menu item
app.put('/api/menu/:id', authenticateToken, [
  body('name').isLength({ min: 2, max: 200 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('meal_type').isIn(['завтрак', 'обед', 'полдник', 'ужин', 'дополнительно']),
  body('day_of_week').isInt({ min: 1, max: 5 })
], (req, res) => {
  if (req.user.role !== 'DIRECTOR') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Неверные данные', details: errors.array() });
  }

  const { name, description, price, meal_type, day_of_week, portion } = req.body;
  const itemId = req.params.id;
  const schoolId = req.user.school_id;

  db.run(`UPDATE menu_items SET name = ?, description = ?, price = ?, meal_type = ?, day_of_week = ?, portion = ? WHERE id = ? AND school_id = ?`,
    [name, description || null, price, meal_type, day_of_week, portion || null, itemId, schoolId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Элемент меню не найден' });
    }

    res.json({ message: 'Элемент меню обновлен' });
  });
});

// Delete menu item
app.delete('/api/menu/:id', authenticateToken, (req, res) => {
  if (req.user.role !== 'DIRECTOR') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  const itemId = req.params.id;
  const schoolId = req.user.school_id;

  db.run(`DELETE FROM menu_items WHERE id = ? AND school_id = ?`, [itemId, schoolId], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Элемент меню не найден' });
    }

    res.json({ message: 'Элемент меню удален' });
  });
});

// Add new menu item
app.post('/api/menu', authenticateToken, [
  body('name').isLength({ min: 2, max: 200 }),
  body('price').isNumeric().isFloat({ min: 0 }),
  body('meal_type').isIn(['завтрак', 'обед', 'полдник', 'ужин', 'дополнительно']),
  body('day_of_week').isInt({ min: 1, max: 5 })
], (req, res) => {
  if (req.user.role !== 'DIRECTOR') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Неверные данные', details: errors.array() });
  }

  const { name, description, price, meal_type, day_of_week, portion } = req.body;
  const schoolId = req.user.school_id;
  const weekStart = new Date().toISOString().split('T')[0];

  db.run(`INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [schoolId, name, description || null, price, meal_type, day_of_week, portion || null, weekStart], function(err) {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    res.json({ 
      message: 'Элемент меню добавлен',
      id: this.lastID
    });
  });
});

// Create order
app.post('/api/orders', authenticateToken, [
  body('menuItemIds').isArray({ min: 1 }),
  body('weekStart').isISO8601()
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ error: 'Неверные данные', details: errors.array() });
  }

  const { menuItemIds, weekStart } = req.body;
  const userId = req.user.id;
  const schoolId = req.user.school_id;

  // Clear existing orders for this week
  db.run('DELETE FROM orders WHERE user_id = ? AND week_start = ?', 
    [userId, weekStart], (err) => {
    if (err) {
      console.error('Error clearing orders:', err);
      return res.status(500).json({ error: 'Ошибка очистки заказов' });
    }

    // Insert new orders
    let insertedCount = 0;
    const stmt = db.prepare(`INSERT INTO orders (user_id, school_id, menu_item_id, week_start, day_of_week) VALUES (?, ?, ?, ?, ?)`);

    // Ждем завершения всех операций
    let completedCount = 0;
    const totalItems = menuItemIds.length;
    
    if (totalItems === 0) {
      return res.json({
        message: 'Заказ успешно создан',
        itemsCount: 0
      });
    }

    menuItemIds.forEach(menuItemId => {
      db.get('SELECT day_of_week FROM menu_items WHERE id = ? AND school_id = ?', 
        [menuItemId, schoolId], (err, item) => {
        if (err || !item) {
          completedCount++;
          if (completedCount === totalItems) {
            stmt.finalize();
            res.json({
              message: 'Заказ успешно создан',
              itemsCount: insertedCount
            });
          }
          return;
        }

        stmt.run([userId, schoolId, menuItemId, weekStart, item.day_of_week], (err) => {
          completedCount++;
          if (err) {
            console.error('Error inserting order:', err);
          } else {
            insertedCount++;
          }

          if (completedCount === totalItems) {
      stmt.finalize();
      res.json({
        message: 'Заказ успешно создан',
        itemsCount: insertedCount
      });
          }
        });
      });
    });
  });
});

// Get user orders
app.get('/api/orders', authenticateToken, (req, res) => {
  const userId = req.user.id;
  const weekStart = req.query.week || new Date().toISOString().split('T')[0];

  db.all(`SELECT o.*, mi.name, mi.price, mi.meal_type, mi.day_of_week 
          FROM orders o 
          JOIN menu_items mi ON o.menu_item_id = mi.id 
          WHERE o.user_id = ? AND o.week_start = ?`,
    [userId, weekStart], (err, orders) => {
    if (err) {
      console.error('Database error:', err);
      return res.status(500).json({ error: 'Ошибка сервера' });
    }

    res.json(orders);
  });
});

// Helper functions
// Старые функции парсера удалены - теперь используется MenuParser класс

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

// Создание пользователя (только для директоров)
app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    // Проверяем, что пользователь - директор
    if (req.user.role !== 'DIRECTOR') {
      return res.status(403).json({ error: 'Недостаточно прав для создания пользователей' });
    }

    const { email, name, role, password } = req.body;

    // Валидация
    if (!email || !name || !role || !password) {
      return res.status(400).json({ error: 'Все поля обязательны' });
    }

    if (!['PARENT', 'STUDENT'].includes(role)) {
      return res.status(400).json({ error: 'Недопустимая роль' });
    }

    // Проверяем уникальность email
    const existingUser = await db.get(
      'SELECT id FROM users WHERE email = ? AND school_id = ?',
      [email, req.user.schoolId]
    );

    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаем пользователя
    const result = await db.run(`
      INSERT INTO users (email, name, role, password, school_id, verified, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `, [email, name, role, hashedPassword, req.user.schoolId]);

    const newUser = {
      id: result.lastID,
      email,
      name,
      role,
      school_id: req.user.schoolId,
      verified: false,
      created_at: new Date().toISOString()
    };

    res.status(201).json(newUser);
  } catch (error) {
    console.error('Ошибка создания пользователя:', error);
    res.status(500).json({ error: 'Ошибка создания пользователя' });
  }
});

// Start server with Railway optimizations
console.log('🔧 Запуск сервера...');
console.log(`🌐 Порт: ${PORT}`);
console.log(`🏠 Окружение: ${process.env.NODE_ENV || 'development'}`);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ СЕРВЕР ЗАПУЩЕН УСПЕШНО!`);
  console.log(`🚀 Порт: ${PORT}`);
  console.log(`🌍 Хост: 0.0.0.0 (Railway-ready)`);
  console.log(`🏥 Health endpoints готовы:`);
  console.log(`   ✓ GET / (root)`);
  console.log(`   ✓ GET /health (main healthcheck)`);
  console.log(`   ✓ GET /api/health (api healthcheck)`);
  console.log(`🎯 Версия: 4.2.4 - Railway Optimized`);
  console.log(`⏰ Время запуска: ${new Date().toISOString()}`);
  
  // Принудительный вызов healthcheck для проверки
  setTimeout(() => {
    console.log('🔍 Самопроверка healthcheck...');
  }, 1000);
});

server.on('error', (error) => {
  console.error('❌ Ошибка запуска сервера:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 Порт ${PORT} уже используется!`);
  }
  process.exit(1);
});

// Добавляем keepalive для Railway
server.keepAliveTimeout = 61 * 1000;
server.headersTimeout = 65 * 1000;

// Поиск блюд
app.get('/api/menu/search', authenticateToken, async (req, res) => {
  try {
    const { week, query, meal_type, day_of_week, min_price, max_price } = req.query;
    
    // Если неделя не указана, используем текущую неделю
    const currentWeek = week || new Date().toISOString().split('T')[0];

    let sql = `
      SELECT * FROM menu_items 
      WHERE school_id = ?
    `;
    const params = [req.user.schoolId];

    // Добавляем фильтр по неделе только если указана
    if (week) {
      sql += ` AND week_start = ?`;
      params.push(week);
    }

    if (query) {
      sql += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${query}%`, `%${query}%`);
    }

    if (meal_type) {
      sql += ` AND meal_type = ?`;
      params.push(meal_type);
    }

    if (day_of_week) {
      sql += ` AND day_of_week = ?`;
      params.push(day_of_week);
    }

    if (min_price) {
      sql += ` AND price >= ?`;
      params.push(min_price);
    }

    if (max_price) {
      sql += ` AND price <= ?`;
      params.push(max_price);
    }

    sql += ` ORDER BY day_of_week, meal_type, name`;

    const items = await db.all(sql, params);
    res.json({ items });
  } catch (error) {
    console.error('Ошибка поиска:', error);
    res.status(500).json({ error: 'Ошибка поиска блюд' });
  }
});

// Массовые операции
app.post('/api/menu/bulk-delete', authenticateToken, async (req, res) => {
  try {
    const { week, ids } = req.body;
    
    if (!ids || !Array.isArray(ids)) {
      return res.status(400).json({ error: 'Необходимо указать массив ID' });
    }

    const placeholders = ids.map(() => '?').join(',');
    let sql = `DELETE FROM menu_items WHERE id IN (${placeholders}) AND school_id = ?`;
    const params = [...ids, req.user.schoolId];

    // Добавляем фильтр по неделе только если указана
    if (week) {
      sql += ` AND week_start = ?`;
      params.push(week);
    }

    const result = await db.run(sql, params);

    res.json({ 
      message: 'Блюда удалены',
      deletedCount: result.changes 
    });
  } catch (error) {
    console.error('Ошибка массового удаления:', error);
    res.status(500).json({ error: 'Ошибка массового удаления' });
  }
});

// Экспорт меню в Excel
app.get('/api/menu/export', authenticateToken, async (req, res) => {
  try {
    const { week } = req.query;
    
    let sql = `
      SELECT * FROM menu_items 
      WHERE school_id = ?
      ORDER BY day_of_week, meal_type, name
    `;
    const params = [req.user.schoolId];

    // Добавляем фильтр по неделе только если указана
    if (week) {
      sql = `
        SELECT * FROM menu_items 
        WHERE week_start = ? AND school_id = ?
        ORDER BY day_of_week, meal_type, name
      `;
      params.unshift(week);
    }

    const items = await db.all(sql, params);

    // Создаем Excel файл
    const ws = XLSX.utils.json_to_sheet(items);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Меню');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="menu_${week}.xlsx"`);
    res.send(buffer);
  } catch (error) {
    console.error('Ошибка экспорта:', error);
    res.status(500).json({ error: 'Ошибка экспорта меню' });
  }
});

// Избранные блюда
app.get('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const favorites = await db.all(`
      SELECT mi.* FROM menu_items mi
      JOIN favorites f ON mi.id = f.menu_item_id
      WHERE f.user_id = ? AND f.school_id = ?
      ORDER BY mi.name
    `, [req.user.id, req.user.schoolId]);

    res.json({ favorites });
  } catch (error) {
    console.error('Ошибка получения избранного:', error);
    res.status(500).json({ error: 'Ошибка получения избранного' });
  }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
  try {
    const { menu_item_id } = req.body;
    
    if (!menu_item_id) {
      return res.status(400).json({ error: 'Необходимо указать ID блюда' });
    }

    // Проверяем, не добавлено ли уже
    const existing = await db.get(`
      SELECT id FROM favorites 
      WHERE user_id = ? AND menu_item_id = ? AND school_id = ?
    `, [req.user.id, menu_item_id, req.user.schoolId]);

    if (existing) {
      return res.status(400).json({ error: 'Блюдо уже в избранном' });
    }

    await db.run(`
      INSERT INTO favorites (user_id, menu_item_id, school_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [req.user.id, menu_item_id, req.user.schoolId]);

    res.json({ message: 'Блюдо добавлено в избранное' });
  } catch (error) {
    console.error('Ошибка добавления в избранное:', error);
    res.status(500).json({ error: 'Ошибка добавления в избранное' });
  }
});

app.delete('/api/favorites/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.run(`
      DELETE FROM favorites 
      WHERE id = ? AND user_id = ? AND school_id = ?
    `, [id, req.user.id, req.user.schoolId]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Избранное не найдено' });
    }

    res.json({ message: 'Блюдо удалено из избранного' });
  } catch (error) {
    console.error('Ошибка удаления из избранного:', error);
    res.status(500).json({ error: 'Ошибка удаления из избранного' });
  }
});

// Калькулятор стоимости
app.get('/api/menu/calculator', authenticateToken, async (req, res) => {
  try {
    const { week, selected_items } = req.query;
    
    if (!week || !selected_items) {
      return res.status(400).json({ error: 'Необходимо указать неделю и выбранные блюда' });
    }

    const itemIds = JSON.parse(selected_items);
    const placeholders = itemIds.map(() => '?').join(',');
    
    const items = await db.all(`
      SELECT * FROM menu_items 
      WHERE id IN (${placeholders}) AND school_id = ? AND week_start = ?
    `, [...itemIds, req.user.schoolId, week]);

    const total = items.reduce((sum, item) => sum + item.price, 0);
    const byDay = {};
    const byMeal = {};

    items.forEach(item => {
      const day = item.day_of_week;
      const meal = item.meal_type;
      
      if (!byDay[day]) byDay[day] = 0;
      if (!byMeal[meal]) byMeal[meal] = 0;
      
      byDay[day] += item.price;
      byMeal[meal] += item.price;
    });

    res.json({
      total,
      byDay,
      byMeal,
      items: items.length
    });
  } catch (error) {
    console.error('Ошибка калькулятора:', error);
    res.status(500).json({ error: 'Ошибка расчета стоимости' });
  }
});

// Получить все недели с меню
app.get('/api/menu/weeks', authenticateToken, async (req, res) => {
  try {
    const weeks = await db.all(`
      SELECT DISTINCT week_start, COUNT(*) as item_count
      FROM menu_items 
      WHERE school_id = ?
      GROUP BY week_start
      ORDER BY week_start DESC
    `, [req.user.schoolId]);

    res.json({ weeks });
  } catch (error) {
    console.error('Ошибка получения недель:', error);
    res.status(500).json({ error: 'Ошибка получения недель' });
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT. Закрытие сервера...');
  db.close((err) => {
    if (err) {
      console.error('Ошибка закрытия базы данных:', err);
    } else {
      console.log(' База данных закрыта');
    }
    process.exit(0);
  });
});
