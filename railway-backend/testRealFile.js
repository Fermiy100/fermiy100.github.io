/**
 * ТЕСТ РЕАЛЬНОГО ФАЙЛА
 * Тестируем парсер на файле "2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА 22.09-26.09 (копия) — копия.xlsx"
 */

import { ImprovedMenuParser } from './improvedMenuParser.js';
import XLSX from 'xlsx';
import fs from 'fs';

async function testRealFile() {
  console.log('🧪 ТЕСТИРУЕМ ПАРСЕР НА РЕАЛЬНОМ ФАЙЛЕ...');
  
  try {
    // Читаем реальный файл
    const filePath = '../2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА  22.09-26.09 (копия) — копия.xlsx';
    const buffer = fs.readFileSync(filePath);
    
    console.log(`📁 Файл прочитан: ${buffer.length} байт`);
    
    // Создаем парсер
    const parser = new ImprovedMenuParser();
    console.log('🔧 Парсер создан');
    
    // Тестируем парсинг
    console.log('\n🚀 НАЧИНАЕМ ПАРСИНГ...');
    const items = parser.parseExcelFile(buffer);
    
    console.log(`\n✅ ПАРСИНГ ЗАВЕРШЕН!`);
    console.log(`📊 Найдено блюд: ${items.length}`);
    
    // Валидируем результат
    const validation = parser.validateParsedMenu(items);
    console.log('\n📋 РЕЗУЛЬТАТЫ ВАЛИДАЦИИ:');
    console.log(`  ✅ Валидно: ${validation.isValid}`);
    console.log(`  ❌ Ошибки: ${validation.errors.length}`);
    console.log(`  ⚠️ Предупреждения: ${validation.warnings.length}`);
    console.log(`  📊 Статистика:`, validation.stats);
    
    if (validation.errors.length > 0) {
      console.log('\n❌ ОШИБКИ:');
      validation.errors.forEach((error, index) => {
        console.log(`  ${index + 1}. ${error}`);
      });
    }
    
    if (validation.warnings.length > 0) {
      console.log('\n⚠️ ПРЕДУПРЕЖДЕНИЯ:');
      validation.warnings.forEach((warning, index) => {
        console.log(`  ${index + 1}. ${warning}`);
      });
    }
    
    // Показываем примеры блюд
    console.log('\n🍽️ ПРИМЕРЫ НАЙДЕННЫХ БЛЮД:');
    items.slice(0, 20).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (${item.meal_type}, день ${item.day_of_week})`);
    });
    
    // Группируем по дням
    const groupedByDay = items.reduce((acc, item) => {
      if (!acc[item.day_of_week]) acc[item.day_of_week] = [];
      acc[item.day_of_week].push(item);
      return acc;
    }, {});
    
    console.log('\n📅 БЛЮДА ПО ДНЯМ:');
    Object.keys(groupedByDay).forEach(day => {
      const dayNames = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
      console.log(`  ${dayNames[day]}: ${groupedByDay[day].length} блюд`);
    });
    
    // Группируем по типам приемов пищи
    const groupedByMeal = items.reduce((acc, item) => {
      if (!acc[item.meal_type]) acc[item.meal_type] = [];
      acc[item.meal_type].push(item);
      return acc;
    }, {});
    
    console.log('\n🍴 БЛЮДА ПО ТИПАМ ПРИЕМОВ ПИЩИ:');
    Object.keys(groupedByMeal).forEach(meal => {
      console.log(`  ${meal}: ${groupedByMeal[meal].length} блюд`);
    });
    
    // Проверяем качество данных
    console.log('\n🔍 ПРОВЕРКА КАЧЕСТВА ДАННЫХ:');
    
    // Проверяем названия блюд
    const badNames = items.filter(item => !item.name || item.name.length < 3);
    if (badNames.length > 0) {
      console.log(`  ❌ Плохие названия: ${badNames.length}`);
      badNames.slice(0, 5).forEach(item => {
        console.log(`    - "${item.name}" (день ${item.day_of_week}, ${item.meal_type})`);
      });
    } else {
      console.log(`  ✅ Все названия блюд корректны`);
    }
    
    // Проверяем дубликаты
    const duplicates = [];
    const seen = new Set();
    items.forEach(item => {
      const key = `${item.name}-${item.day_of_week}-${item.meal_type}`;
      if (seen.has(key)) {
        duplicates.push(item);
      } else {
        seen.add(key);
      }
    });
    
    if (duplicates.length > 0) {
      console.log(`  ❌ Дубликаты: ${duplicates.length}`);
      duplicates.slice(0, 5).forEach(item => {
        console.log(`    - ${item.name} (день ${item.day_of_week}, ${item.meal_type})`);
      });
    } else {
      console.log(`  ✅ Дубликатов нет`);
    }
    
    // Проверяем порции
    const noPortions = items.filter(item => !item.portion || item.portion.length === 0);
    if (noPortions.length > 0) {
      console.log(`  ⚠️ Без порций: ${noPortions.length}`);
    } else {
      console.log(`  ✅ У всех блюд есть порции`);
    }
    
    console.log('\n🎯 ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
    
    // Возвращаем результат для проверки
    return {
      success: true,
      itemsCount: items.length,
      validation,
      groupedByDay,
      groupedByMeal,
      quality: {
        badNames: badNames.length,
        duplicates: duplicates.length,
        noPortions: noPortions.length
      }
    };
    
  } catch (error) {
    console.error('\n❌ КРИТИЧЕСКАЯ ОШИБКА ТЕСТА:');
    console.error(`  Ошибка: ${error.message}`);
    console.error(`  Stack: ${error.stack}`);
    
    return {
      success: false,
      error: error.message,
      stack: error.stack
    };
  }
}

// Запускаем тест
testRealFile().then(result => {
  if (result.success) {
    console.log('\n✅ ВСЕ ТЕСТЫ ПРОЙДЕНЫ! Парсер готов к работе.');
    process.exit(0);
  } else {
    console.log('\n❌ ТЕСТЫ НЕ ПРОЙДЕНЫ! Нужны исправления.');
    process.exit(1);
  }
});
