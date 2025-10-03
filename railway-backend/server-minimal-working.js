import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Создаем базу данных
const db = new sqlite3.Database(':memory:');

// Создаем таблицы
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    address TEXT,
    director_id INTEGER
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    school_id INTEGER,
    verified INTEGER DEFAULT 0,
    FOREIGN KEY (school_id) REFERENCES schools (id)
  )`);
  
  db.run(`CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    school_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price REAL DEFAULT 0,
    meal_type TEXT NOT NULL,
    day_of_week INTEGER NOT NULL,
    portion TEXT,
    week_start TEXT,
    recipe_number TEXT,
    weight TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools (id)
  )`);
  
  // Создаем школу
  db.run(`INSERT INTO schools (name, address) VALUES (?, ?)`, 
    ['Средняя школа №123', 'г. Москва, ул. Примерная, д. 1'], function(err) {
    if (err) {
      console.error('Error creating school:', err);
      return;
    }
    
    const schoolId = this.lastID;
    
    // Создаем пользователей
    db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
      ['director@school.test', 'hashed_password', 'Анна Петровна Иванова', 'DIRECTOR', schoolId, 1]);
    
    db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
      ['parent@school.test', 'hashed_password', 'Мария Сергеевна Сидорова', 'PARENT', schoolId, 1]);
    
    // ДОБАВЛЯЕМ РЕАЛЬНЫЕ БЛЮДА ИЗ ВАШЕГО EXCEL ФАЙЛА
    console.log('🎯 ДОБАВЛЯЕМ РЕАЛЬНЫЕ БЛЮДА ИЗ EXCEL ФАЙЛА...');
    
    const realDishes = [
      {
        name: "Сухие завтраки с молоком",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "225 г",
        recipe_number: "1/6",
        portion: "225 г"
      },
      {
        name: "Оладьи",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "2 шт",
        recipe_number: "11/2",
        portion: "2 шт"
      },
      {
        name: "Молоко сгущенное",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/1",
        portion: "20 г"
      },
      {
        name: "Сметана",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/7",
        portion: "20 г"
      },
      {
        name: "Джем фруктовый",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/5",
        portion: "20 г"
      },
      {
        name: "Мед",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "15/6",
        portion: "20 г"
      },
      {
        name: "Масло сливочное",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "10 г",
        recipe_number: "18/7",
        portion: "10 г"
      },
      {
        name: "Сыр",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "15 г",
        recipe_number: "18/8",
        portion: "15 г"
      },
      {
        name: "Колбаса вареная",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "18/5",
        portion: "20 г"
      },
      {
        name: "Колбаса в/к",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "18/6",
        portion: "20 г"
      },
      {
        name: "Ветчина",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "18/4",
        portion: "20 г"
      },
      {
        name: "Хлеб из пшеничной муки",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "20 г",
        recipe_number: "17/1",
        portion: "20 г"
      },
      {
        name: "Чай с сахаром",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "200 г",
        recipe_number: "12/2",
        portion: "200 г"
      },
      {
        name: "Чай с молоком",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "200 г",
        recipe_number: "12/3",
        portion: "200 г"
      },
      {
        name: "Какао с молоком",
        description: "Блюдо из школьного меню Excel файла",
        price: 0,
        meal_type: "завтрак",
        day_of_week: 1,
        weight: "200 г",
        recipe_number: "12/4",
        portion: "200 г"
      }
    ];
    
    // Добавляем все блюда
    realDishes.forEach((dish, index) => {
      db.run(`INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start, recipe_number, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [schoolId, dish.name, dish.description, dish.price, dish.meal_type, dish.day_of_week, dish.portion, new Date().toISOString().split('T')[0], dish.recipe_number, dish.weight],
        function(err) {
          if (err) {
            console.error(`❌ Ошибка добавления блюда ${index + 1} (${dish.name}):`, err);
          } else {
            console.log(`✅ Добавлено блюдо ${index + 1}: ${dish.name}`);
          }
        }
      );
    });
    
    console.log('🎉 ВСЕ 15 РЕАЛЬНЫХ БЛЮД ИЗ EXCEL ФАЙЛА ДОБАВЛЕНЫ!');
  });
});

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🎯 Минимальный сервер работает!', 
    time: new Date().toISOString(),
    version: '2.0.0 - РЕАЛЬНЫЕ ДАННЫЕ'
  });
});

app.get('/api/menu', (req, res) => {
  db.all("SELECT * FROM menu_items", (err, rows) => {
    if (err) {
      console.error('Error fetching menu:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json(rows);
  });
});

app.post('/api/menu', (req, res) => {
  const { name, description, price, meal_type, day_of_week, portion, recipe_number, weight } = req.body;
  
  db.run(`INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start, recipe_number, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [1, name, description, price, meal_type, day_of_week, portion, new Date().toISOString().split('T')[0], recipe_number, weight],
    function(err) {
      if (err) {
        console.error('Error adding menu item:', err);
        return res.status(500).json({ error: 'Database error' });
      }
      res.json({ id: this.lastID, message: 'Menu item added successfully' });
    }
  );
});

app.delete('/api/menu/clear', (req, res) => {
  db.run("DELETE FROM menu_items", (err) => {
    if (err) {
      console.error('Error clearing menu:', err);
      return res.status(500).json({ error: 'Database error' });
    }
    res.json({ message: 'Menu cleared successfully' });
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', time: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 Минимальный сервер запущен на порту ${PORT}`);
  console.log('🎉 РЕАЛЬНЫЕ ДАННЫЕ ИЗ EXCEL ФАЙЛА ЗАГРУЖЕНЫ!');
});

export default app;
