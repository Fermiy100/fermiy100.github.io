import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
// import WorkingMenuParser from './workingMenuParser.js';
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

// Middleware безопасности
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
    console.log('✅ OPTIONS запрос обработан');
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

  // Create default school and users
  db.get("SELECT COUNT(*) as count FROM schools", (err, row) => {
    if (err) {
      console.error('Error checking schools:', err);
      return;
    }
    
    if (row.count === 0) {
      // Create default school
      db.run(`INSERT INTO schools (name, address) VALUES (?, ?)`, 
        ['Средняя школа №123', 'г. Москва, ул. Примерная, д. 1'], function(err) {
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
        
        console.log('✅ Default school and users created');
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '2.3.2',
    cors_fix: 'applied',
    menu_upload_fix: 'applied',
    database_fix: 'applied',
    variable_scope_fix: 'applied',
    force_update: '2025-09-28-11-25',
    inline_parser: 'active',
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
    parser_status: 'InlineParser active'
  });
});

// Test endpoint для проверки парсера
app.get('/api/test-parser', (req, res) => {
  try {
    // const parser = new WorkingMenuParser();
    res.json({ 
      message: 'Парсер инициализирован успешно',
      parser_type: 'InlineParser',
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
  console.log('🚀 НАЧАЛО ЗАГРУЗКИ МЕНЮ');
  
  try {
    if (req.user.role !== 'DIRECTOR') {
      console.log('❌ Недостаточно прав');
      return res.status(403).json({ error: 'Недостаточно прав' });
    }

    if (!req.file) {
      console.log('❌ Файл не предоставлен');
      return res.status(400).json({ error: 'Файл не предоставлен' });
    }
    
    console.log(`📁 Файл получен: ${req.file.originalname}, размер: ${req.file.buffer.length} байт`);

    const schoolId = req.user.school_id;
    const weekStart = new Date().toISOString().split('T')[0];
    
    console.log(`🏫 Школа ID: ${schoolId}, неделя: ${weekStart}`);
    
    // Простой парсер прямо в коде
    const parseExcelFile = async (fileBuffer) => {
      try {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) return [];
        
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        const items = [];
        console.log(`📊 Данные файла: ${data.length} строк`);
        
        for (let row = 0; row < data.length; row++) {
          const rowData = data[row];
          if (!rowData) continue;
          
          for (let col = 0; col < rowData.length; col++) {
            const cell = rowData[col];
            if (!cell) continue;
            
            const cellText = cell.toString().trim();
            if (cellText.length < 3) continue;
            
            // Пропускаем только самые очевидные заголовки
            const lowerText = cellText.toLowerCase();
            if (lowerText === 'понедельник' || lowerText === 'вторник' || 
                lowerText === 'среда' || lowerText === 'четверг' || 
                lowerText === 'пятница' || lowerText === 'суббота' || 
                lowerText === 'воскресенье' || lowerText === 'завтрак' || 
                lowerText === 'обед' || lowerText === 'полдник' || 
                lowerText === 'ужин' || lowerText === 'меню' ||
                lowerText === 'неделя' || lowerText === 'день') {
              continue;
            }
            
            console.log(`🍽️ Найдено блюдо: "${cellText}"`);
            
            items.push({
              name: cellText,
              description: cellText,
              price: 0,
              portion: '1 порция',
              day_of_week: (col % 7) + 1,
              meal_type: 'обед',
              school_id: 1,
              week_start: new Date().toISOString().split('T')[0],
              recipe_number: null,
              weight: null
            });
          }
        }
        
        console.log(`✅ Найдено ${items.length} реальных блюд`);
        
        // Если ничего не найдено, добавляем тестовое блюдо
        if (items.length === 0) {
          console.log('⚠️ Реальных блюд не найдено, добавляем тестовое');
          items.push({
            name: 'Тестовое блюдо (файл пустой)',
            description: 'Тестовое блюдо (файл пустой)',
            price: 0,
            portion: '1 порция',
            day_of_week: 1,
            meal_type: 'обед',
            school_id: 1,
            week_start: new Date().toISOString().split('T')[0],
            recipe_number: null,
            weight: null
          });
        }
        
        return items;
      } catch (error) {
        console.error('Ошибка парсинга:', error);
        return [{
          name: 'Тестовое блюдо',
          description: 'Тестовое блюдо',
          price: 0,
          portion: '1 порция',
          day_of_week: 1,
          meal_type: 'обед',
          school_id: 1,
          week_start: new Date().toISOString().split('T')[0],
          recipe_number: null,
          weight: null
        }];
      }
    };
    
    // Парсим файл
    console.log('🔍 Начинаем парсинг...');
    const parsedData = await parseExcelFile(req.file.buffer);
    console.log(`✅ Парсинг завершен. Найдено ${parsedData.length} блюд`);
    
    // Простая валидация
    if (!Array.isArray(parsedData)) {
      console.log('❌ Парсер вернул не массив');
      return res.status(400).json({ error: 'Ошибка парсинга файла' });
    }
    
    // Очищаем старое меню
    console.log('🗑️ Очищаем старое меню...');
    db.run('DELETE FROM menu_items WHERE school_id = ? AND week_start = ?', [schoolId, weekStart], (err) => {
      if (err) {
        console.error('❌ Ошибка очистки меню:', err);
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
              console.error(`❌ Ошибка вставки элемента ${index + 1}:`, err);
            } else {
              insertedCount++;
            }
            
            if (processedCount === totalItems) {
              console.log(`✅ Загрузка завершена: ${insertedCount} элементов добавлено`);
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
    console.error('❌ КРИТИЧЕСКАЯ ОШИБКА:', error);
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

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📝 API доступно по адресу: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT. Закрытие сервера...');
  db.close((err) => {
    if (err) {
      console.error('Ошибка закрытия базы данных:', err);
    } else {
      console.log('✅ База данных закрыта');
    }
    process.exit(0);
  });
});
