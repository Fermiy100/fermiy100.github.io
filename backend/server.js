import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import sqlite3 from 'sqlite3';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { body, validationResult } from 'express-validator';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://fermiy100.github.io',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Слишком много запросов с этого IP, попробуйте позже.'
});
app.use('/api/', limiter);

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
    price REAL NOT NULL,
    meal_type TEXT NOT NULL,
    day_of_week INTEGER NOT NULL CHECK(day_of_week BETWEEN 1 AND 7),
    portion TEXT,
    week_start DATE NOT NULL,
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
        const directorPassword = bcrypt.hashSync('P@ssw0rd1!', 10);
        db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
          ['director@school.test', directorPassword, 'Анна Петровна Иванова', 'DIRECTOR', schoolId, 1]);
        
        // Create default parent
        const parentPassword = bcrypt.hashSync('P@ssw0rd1!', 10);
        db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
          ['parent@school.test', parentPassword, 'Мария Сергеевна Сидорова', 'PARENT', schoolId, 1]);
        
        // Update school with director
        db.run(`UPDATE schools SET director_id = ? WHERE id = ?`, [1, schoolId]);
        
        console.log('✅ Default school and users created');
      });
    }
  });
});

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Токен доступа не предоставлен' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
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
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Auth routes
app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: 'Неверные данные', details: errors.array() });
    }

    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
      if (err) {
        console.error('Database error:', err);
        return res.status(500).json({ error: 'Ошибка сервера' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(401).json({ error: 'Неверный email или пароль' });
      }

      if (!user.verified) {
        return res.status(401).json({ error: 'Аккаунт не верифицирован. Обратитесь к администратору.' });
      }

      const token = jwt.sign(
        { 
          id: user.id, 
          email: user.email, 
          role: user.role, 
          school_id: user.school_id 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

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
    const password = bcrypt.hashSync('TempPassword123!', 10);

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

// Upload menu
app.post('/api/menu/upload', authenticateToken, upload.single('file'), (req, res) => {
  if (req.user.role !== 'DIRECTOR') {
    return res.status(403).json({ error: 'Недостаточно прав' });
  }

  if (!req.file) {
    return res.status(400).json({ error: 'Файл не предоставлен' });
  }

  try {
    const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, raw: false, defval: '' });

    const schoolId = req.user.school_id;
    const weekStart = new Date().toISOString().split('T')[0]; // Current week start

    // Clear existing menu for this week
    db.run('DELETE FROM menu_items WHERE school_id = ? AND week_start = ?', 
      [schoolId, weekStart], (err) => {
      if (err) {
        console.error('Error clearing menu:', err);
        return res.status(500).json({ error: 'Ошибка очистки меню' });
      }

      // Parse and insert new menu items
      let currentMealType = 'обед';
      let itemId = 1;
      let insertedCount = 0;

      for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
        const row = jsonData[rowIndex];
        if (!row) continue;

        // Check for meal type header
        const firstCell = (row[0] || '').toString().trim();
        if (firstCell) {
          const mealType = getMealType(firstCell);
          if (mealType !== 'обед' || firstCell.toLowerCase().includes('завтрак') || 
              firstCell.toLowerCase().includes('обед') || firstCell.toLowerCase().includes('полдник') ||
              firstCell.toLowerCase().includes('ужин') || firstCell.toLowerCase().includes('дополнительный')) {
            currentMealType = mealType;
            continue;
          }
        }

        // Process menu items
        for (let colIndex = 1; colIndex < row.length; colIndex++) {
          const cellValue = (row[colIndex] || '').toString().trim();
          
          if (cellValue && cellValue.length > 2 && !cellValue.match(/^\d+$/)) {
            if (cellValue.includes('№') || cellValue.includes('кол') || 
                cellValue.includes('иче') || cellValue.includes('ств') ||
                cellValue.includes('порц') || cellValue.includes('количество') ||
                cellValue.includes('недел') || cellValue.includes('день')) {
              continue;
            }

            const { portion, price, cleanName } = extractPortionAndPrice(cellValue);
            
            if (cleanName && cleanName.length > 1) {
              const dayOfWeek = getDayOfWeek(colIndex, row.length);
              
              if (!cleanName.match(/^\d+$/) && 
                  !cleanName.includes('недел') && 
                  !cleanName.includes('день') &&
                  cleanName.length > 2) {
                
                db.run(`INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                  [schoolId, cleanName, portion || null, price || 0, currentMealType, dayOfWeek, portion || null, weekStart], (err) => {
                  if (err) {
                    console.error('Error inserting menu item:', err);
                  } else {
                    insertedCount++;
                  }
                });
              }
            }
          }
        }
      }

      // Wait a bit for all inserts to complete
      setTimeout(() => {
        res.json({
          message: `Меню успешно загружено`,
          itemsCount: insertedCount,
          weekStart: weekStart
        });
      }, 1000);
    });
  } catch (error) {
    console.error('Menu upload error:', error);
    res.status(500).json({ error: 'Ошибка обработки файла' });
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

    menuItemIds.forEach(menuItemId => {
      // Get menu item details
      db.get('SELECT day_of_week FROM menu_items WHERE id = ? AND school_id = ?', 
        [menuItemId, schoolId], (err, item) => {
        if (err || !item) return;

        stmt.run([userId, schoolId, menuItemId, weekStart, item.day_of_week], (err) => {
          if (err) {
            console.error('Error inserting order:', err);
          } else {
            insertedCount++;
          }
        });
      });
    });

    setTimeout(() => {
      stmt.finalize();
      res.json({
        message: 'Заказ успешно создан',
        itemsCount: insertedCount
      });
    }, 1000);
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
function getMealType(text) {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('завтрак') || lowerText.includes('завтр')) return 'завтрак';
  if (lowerText.includes('обед')) return 'обед';
  if (lowerText.includes('полдник') || lowerText.includes('полд')) return 'полдник';
  if (lowerText.includes('ужин')) return 'ужин';
  if (lowerText.includes('дополнительный') || lowerText.includes('гарнир')) return 'дополнительно';
  
  return 'обед';
}

function extractPortionAndPrice(text) {
  let portion = '';
  let price = 0;
  let cleanName = text;

  // Find portion
  const portionMatch = text.match(/(\d+\s*(г|шт|мл|л|кг|порц|порции?))/i);
  if (portionMatch) {
    portion = portionMatch[0];
    cleanName = cleanName.replace(portion, '').trim();
  }

  // Find price
  const priceMatch = text.match(/(\d+)\s*(руб|₽|р\.?)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1]);
    cleanName = cleanName.replace(priceMatch[0], '').trim();
  }

  // Clean name
  cleanName = cleanName.replace(/[,\-–—]/g, '').trim();

  return { portion, price, cleanName };
}

function getDayOfWeek(columnIndex, totalColumns) {
  const dayIndex = Math.max(0, columnIndex - 1);
  return Math.min(dayIndex + 1, 5);
}

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
