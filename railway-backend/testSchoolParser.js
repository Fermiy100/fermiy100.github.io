/**
 * ТЕСТ ШКОЛЬНОГО ПАРСЕРА
 */

import { SchoolMenuParser } from './schoolMenuParser.js';
import XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА  22.09-26.09 (копия) — копия.xlsx';

console.log('🧪 ТЕСТИРУЮ ШКОЛЬНЫЙ ПАРСЕР...\n');

try {
  const parser = new SchoolMenuParser();
  
  // Читаем реальный файл
  const buffer = fs.readFileSync(filePath);
  const result = parser.parseExcelFile(buffer);
  
  console.log('✅ РЕЗУЛЬТАТ ПАРСИНГА:');
  console.log(`📊 Всего блюд: ${result.totalItems}`);
  console.log(`💬 Сообщение: ${result.message}`);
  
  if (result.errors && result.errors.length > 0) {
    console.log('❌ Ошибки:');
    result.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (result.warnings && result.warnings.length > 0) {
    console.log('⚠️ Предупреждения:');
    result.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  // Группируем по дням недели
  console.log('\n📅 ГРУППИРОВКА ПО ДНЯМ:');
  const groupedByDay = {};
  result.items.forEach(item => {
    if (!groupedByDay[item.day_of_week]) {
      groupedByDay[item.day_of_week] = [];
    }
    groupedByDay[item.day_of_week].push(item);
  });
  
  const dayNames = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
  Object.keys(groupedByDay).forEach(day => {
    console.log(`\n${dayNames[day]}:`);
    
    // Группируем по типам питания
    const groupedByMeal = {};
    groupedByDay[day].forEach(item => {
      if (!groupedByMeal[item.meal_type]) {
        groupedByMeal[item.meal_type] = [];
      }
      groupedByMeal[item.meal_type].push(item);
    });
    
    Object.keys(groupedByMeal).forEach(mealType => {
      console.log(`  ${mealType.toUpperCase()}:`);
      groupedByMeal[mealType].forEach(item => {
        console.log(`    - ${item.name} (${item.portion}) - ${item.price}₽`);
        if (item.recipe_number) {
          console.log(`      Рецепт: №${item.recipe_number}`);
        }
      });
    });
  });
  
  // Статистика
  console.log('\n📊 СТАТИСТИКА:');
  const mealStats = {};
  result.items.forEach(item => {
    if (!mealStats[item.meal_type]) {
      mealStats[item.meal_type] = 0;
    }
    mealStats[item.meal_type]++;
  });
  
  Object.keys(mealStats).forEach(mealType => {
    console.log(`  ${mealType}: ${mealStats[mealType]} блюд`);
  });
  
  console.log('\n🎉 ТЕСТ ШКОЛЬНОГО ПАРСЕРА ЗАВЕРШЕН!');
  
} catch (error) {
  console.error('❌ ОШИБКА ТЕСТА:', error.message);
  console.error(error.stack);
}
