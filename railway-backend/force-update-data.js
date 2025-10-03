// Принудительное обновление данных на Railway
import sqlite3 from 'sqlite3';
import { RealExcelParser } from './real-excel-parser.js';

const db = new sqlite3.Database('school_meals.db');

console.log('🔄 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ДАННЫХ...');

// Очищаем все таблицы
db.run("DELETE FROM menu_items", (err) => {
  if (err) console.error('Ошибка очистки menu_items:', err);
  else console.log('✅ menu_items очищена');
});

db.run("DELETE FROM favorites", (err) => {
  if (err) console.error('Ошибка очистки favorites:', err);
  else console.log('✅ favorites очищена');
});

db.run("DELETE FROM users", (err) => {
  if (err) console.error('Ошибка очистки users:', err);
  else console.log('✅ users очищена');
});

db.run("DELETE FROM schools", (err) => {
  if (err) console.error('Ошибка очистки schools:', err);
  else console.log('✅ schools очищена');
});

// Создаем школу
db.run(`INSERT INTO schools (name, address) VALUES (?, ?)`, 
  ['Средняя школа №123', 'г. Москва, ул. Примерная, д. 1'], function(err) {
  if (err) {
    console.error('Ошибка создания школы:', err);
    return;
  }
  
  const schoolId = this.lastID;
  console.log('✅ Школа создана с ID:', schoolId);
  
  // Создаем пользователей
  const directorPassword = 'P@ssw0rd1!'; // Простой пароль для теста
  const parentPassword = 'P@ssw0rd1!';
  
  db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
    ['director@school.test', directorPassword, 'Анна Петровна Иванова', 'DIRECTOR', schoolId, 1]);
  
  db.run(`INSERT INTO users (email, password, name, role, school_id, verified) VALUES (?, ?, ?, ?, ?, ?)`,
    ['parent@school.test', parentPassword, 'Мария Сергеевна Сидорова', 'PARENT', schoolId, 1]);
  
  console.log('✅ Пользователи созданы');
  
  // Обновляем школу с директором
  db.run(`UPDATE schools SET director_id = ? WHERE id = ?`, [1, schoolId]);
  
  // Читаем данные из Excel файла
  console.log('🔍 Читаем данные из Excel файла...');
  const realParser = new RealExcelParser();
  
  realParser.parseExcelFile().then(initialMenuData => {
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
            console.log(`✅ Добавлено блюдо ${addedCount}: ${dish.name} (день ${dish.day_of_week})`);
          }
          
          if (addedCount === initialMenuData.length) {
            console.log(`🎉 ВСЕ ${addedCount} БЛЮД ИЗ EXCEL УСПЕШНО ДОБАВЛЕНЫ!`);
            
            // Проверяем что добавилось
            db.all("SELECT COUNT(*) as count FROM menu_items", (err, rows) => {
              if (err) {
                console.error('Ошибка проверки:', err);
              } else {
                console.log(`📊 В базе данных: ${rows[0].count} блюд`);
              }
              
              db.close();
              console.log('🎯 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ЗАВЕРШЕНО!');
            });
          }
        }
      );
    });
  }).catch(error => {
    console.error('Ошибка чтения Excel файла:', error);
    db.close();
  });
});

console.log('🚀 Скрипт принудительного обновления запущен...');
