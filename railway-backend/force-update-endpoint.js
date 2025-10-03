// Принудительное обновление данных через новый endpoint
import express from 'express';
import sqlite3 from 'sqlite3';
import { RealExcelParser } from './real-excel-parser.js';

const app = express();
const db = new sqlite3.Database('school_meals.db');

// Новый endpoint для принудительного обновления данных
app.post('/api/force-update-menu', async (req, res) => {
  try {
    console.log('🔄 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ МЕНЮ...');
    
    // Очищаем все блюда
    db.run("DELETE FROM menu_items", (err) => {
      if (err) {
        console.error('Ошибка очистки menu_items:', err);
        return res.status(500).json({ error: 'Ошибка очистки базы данных' });
      }
      
      console.log('✅ menu_items очищена');
      
      // Читаем данные из Excel файла
      const parser = new RealExcelParser();
      parser.parseExcelFile().then(dishes => {
        console.log(`📊 Прочитано ${dishes.length} блюд из Excel файла`);
        
        if (dishes.length === 0) {
          return res.status(500).json({ error: 'Парсер не вернул блюд' });
        }
        
        // Добавляем все блюда
        let addedCount = 0;
        const schoolId = 1; // По умолчанию
        const weekStart = new Date().toISOString().split('T')[0];
        
        dishes.forEach((dish, index) => {
          db.run(`INSERT INTO menu_items (school_id, name, description, price, meal_type, day_of_week, portion, week_start, recipe_number, weight) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [schoolId, dish.name, dish.description, dish.price, dish.meal_type, dish.day_of_week, dish.portion, weekStart, dish.recipe_number, dish.weight],
            function(err) {
              if (err) {
                console.error(`Ошибка добавления блюда ${index + 1} (${dish.name}):`, err);
              } else {
                addedCount++;
                console.log(`✅ Добавлено блюдо ${addedCount}: ${dish.name}`);
              }
              
              if (addedCount === dishes.length) {
                console.log(`🎉 ВСЕ ${addedCount} БЛЮД УСПЕШНО ДОБАВЛЕНЫ!`);
                res.json({ 
                  success: true, 
                  message: `Успешно добавлено ${addedCount} блюд из Excel файла`,
                  count: addedCount
                });
              }
            }
          );
        });
      }).catch(error => {
        console.error('Ошибка парсера:', error);
        res.status(500).json({ error: 'Ошибка парсера Excel файла' });
      });
    });
    
  } catch (error) {
    console.error('Ошибка принудительного обновления:', error);
    res.status(500).json({ error: 'Внутренняя ошибка сервера' });
  }
});

export default app;
