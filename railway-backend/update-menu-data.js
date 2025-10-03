// Скрипт для обновления данных меню в Railway с ВСЕМИ блюдами из Excel
import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ВСЕ 15 БЛЮД ИЗ ВАШЕГО EXCEL ФАЙЛА - ЗАВТРАК ПОНЕДЕЛЬНИК
const allDishes = [
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

// Подключение к базе данных
const dbPath = path.join(__dirname, 'school_meals.db');
const db = new sqlite3.Database(dbPath);

const schoolId = 1;
const weekStart = new Date().toISOString().split('T')[0];

console.log('🔄 Обновление меню в Railway...');
console.log(`📅 Неделя: ${weekStart}`);
console.log(`🏫 Школа ID: ${schoolId}`);
console.log(`🍽️ Блюд для добавления: ${allDishes.length}`);

// Сначала очищаем старые данные
db.run(`DELETE FROM menu_items WHERE school_id = ? AND week_start = ?`, [schoolId, weekStart], function(err) {
    if (err) {
        console.error('❌ Ошибка очистки старых данных:', err);
        return;
    }
    
    console.log(`🗑️ Удалено старых записей: ${this.changes}`);
    
    // Добавляем новые данные
    let addedCount = 0;
    let errorCount = 0;
    
    allDishes.forEach((dish, index) => {
        db.run(
            `INSERT INTO menu_items 
            (school_id, name, description, price, meal_type, day_of_week, portion, week_start, recipe_number, weight) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                schoolId, 
                dish.name, 
                dish.description, 
                dish.price, 
                dish.meal_type, 
                dish.day_of_week, 
                dish.portion, 
                weekStart, 
                dish.recipe_number, 
                dish.weight
            ],
            function(err) {
                if (err) {
                    console.error(`❌ Ошибка добавления блюда ${index + 1} (${dish.name}):`, err);
                    errorCount++;
                } else {
                    addedCount++;
                    console.log(`✅ Добавлено блюдо ${addedCount}: ${dish.name}`);
                }
                
                // Проверяем, все ли блюда обработаны
                if (addedCount + errorCount === allDishes.length) {
                    console.log('\n🎉 ОБНОВЛЕНИЕ ЗАВЕРШЕНО!');
                    console.log(`✅ Успешно добавлено: ${addedCount} блюд`);
                    console.log(`❌ Ошибок: ${errorCount}`);
                    console.log(`🍽️ Всего блюд из Excel: ${allDishes.length}`);
                    
                    if (addedCount === allDishes.length) {
                        console.log('🎯 ВСЕ БЛЮДА ИЗ EXCEL УСПЕШНО ДОБАВЛЕНЫ!');
                    }
                    
                    db.close();
                }
            }
        );
    });
});
