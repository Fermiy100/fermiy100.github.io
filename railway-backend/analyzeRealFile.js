/**
 * АНАЛИЗ РЕАЛЬНОГО EXCEL ФАЙЛА
 * Анализирует структуру файла "2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА 22.09-26.09 (копия) — копия.xlsx"
 */

import { ImprovedMenuParser } from './improvedMenuParser.js';
import XLSX from 'xlsx';
import fs from 'fs';

async function analyzeRealFile() {
  console.log('🔍 Анализируем реальный Excel файл...');
  
  try {
    // Читаем файл
    const filePath = '../2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА  22.09-26.09 (копия) — копия.xlsx';
    const buffer = fs.readFileSync(filePath);
    
    console.log(`📁 Файл прочитан: ${buffer.length} байт`);
    
    // Читаем Excel файл
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Конвертируем в JSON для анализа
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Лист: ${sheetName}`);
    console.log(`📏 Размер данных: ${jsonData.length} строк`);
    
    // Показываем первые 20 строк для анализа структуры
    console.log('\n📋 Первые 20 строк файла:');
    for (let i = 0; i < Math.min(20, jsonData.length); i++) {
      const row = jsonData[i];
      console.log(`Строка ${i + 1}:`, row);
    }
    
    // Анализируем структуру
    console.log('\n🏗️ Анализ структуры:');
    
    // Ищем дни недели
    const dayColumns = [];
    for (let rowIndex = 0; rowIndex < Math.min(10, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toLowerCase().trim();
        if (cellText.includes('понедельник') || cellText.includes('вторник') || 
            cellText.includes('среда') || cellText.includes('четверг') || 
            cellText.includes('пятница')) {
          dayColumns.push({
            day: cellText,
            column: colIndex,
            row: rowIndex
          });
        }
      }
    }
    
    console.log('📅 Найденные дни недели:', dayColumns);
    
    // Ищем типы приемов пищи
    const mealRows = [];
    for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toLowerCase().trim();
        if (cellText.includes('завтрак') || cellText.includes('обед') || 
            cellText.includes('полдник') || cellText.includes('ужин')) {
          mealRows.push({
            meal: cellText,
            row: rowIndex,
            column: colIndex
          });
        }
      }
    }
    
    console.log('🍽️ Найденные типы приемов пищи:', mealRows);
    
    // Теперь тестируем парсер
    console.log('\n🧪 Тестируем улучшенный парсер:');
    const parser = new ImprovedMenuParser();
    
    // Добавляем отладочную информацию
    console.log('\n🔍 Ищем "О Б Е Д" в файле:');
    for (let rowIndex = 0; rowIndex < Math.min(25, jsonData.length); rowIndex++) {
      const row = jsonData[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.trim().toLowerCase();
        if (cellText.includes('о б е д') || cellText.includes('обед')) {
          console.log(`  Найден "О Б Е Д" в строке ${rowIndex + 1}, колонке ${colIndex + 1}: "${cell}"`);
        }
      }
    }
    
    const items = parser.parseExcelFile(buffer);
    
    console.log(`✅ Парсер нашел ${items.length} блюд`);
    
    // Валидируем результат
    const validation = parser.validateParsedMenu(items);
    console.log('📋 Результаты валидации:');
    console.log(`  - Валидно: ${validation.isValid}`);
    console.log(`  - Ошибки: ${validation.errors.length}`);
    console.log(`  - Предупреждения: ${validation.warnings.length}`);
    console.log(`  - Статистика:`, validation.stats);
    
    if (validation.errors.length > 0) {
      console.log('❌ Ошибки:');
      validation.errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (validation.warnings.length > 0) {
      console.log('⚠️ Предупреждения:');
      validation.warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    // Показываем примеры найденных блюд
    console.log('\n🍽️ Примеры найденных блюд:');
    items.slice(0, 15).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (${item.meal_type}, день ${item.day_of_week})`);
    });
    
    // Группируем по дням
    const groupedByDay = items.reduce((acc, item) => {
      if (!acc[item.day_of_week]) acc[item.day_of_week] = [];
      acc[item.day_of_week].push(item);
      return acc;
    }, {});
    
    console.log('\n📅 Блюда по дням:');
    Object.keys(groupedByDay).forEach(day => {
      const dayNames = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];
      console.log(`  ${dayNames[day]}: ${groupedByDay[day].length} блюд`);
      groupedByDay[day].slice(0, 3).forEach(item => {
        console.log(`    - ${item.name} (${item.meal_type})`);
      });
    });
    
    // Группируем по типам приемов пищи
    const groupedByMeal = items.reduce((acc, item) => {
      if (!acc[item.meal_type]) acc[item.meal_type] = [];
      acc[item.meal_type].push(item);
      return acc;
    }, {});
    
    console.log('\n🍴 Блюда по типам приемов пищи:');
    Object.keys(groupedByMeal).forEach(meal => {
      console.log(`  ${meal}: ${groupedByMeal[meal].length} блюд`);
      groupedByMeal[meal].slice(0, 3).forEach(item => {
        console.log(`    - ${item.name} (день ${item.day_of_week})`);
      });
    });
    
    console.log('\n✅ Анализ завершен!');
    
  } catch (error) {
    console.error('❌ Ошибка анализа:', error);
  }
}

// Запускаем анализ
analyzeRealFile();
