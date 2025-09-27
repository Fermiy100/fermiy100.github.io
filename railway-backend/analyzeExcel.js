/**
 * АНАЛИЗ EXCEL ФАЙЛА
 * Анализируем структуру реальной таблицы
 */

import XLSX from 'xlsx';
import fs from 'fs';

const filePath = '../2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА  22.09-26.09 (копия) — копия.xlsx';

console.log('🔍 АНАЛИЗИРУЮ EXCEL ФАЙЛ...\n');

try {
  // Читаем файл
  const buffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  console.log('📊 Информация о файле:');
  console.log(`   Листы: ${workbook.SheetNames.join(', ')}`);
  
  // Анализируем первый лист
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log(`\n📋 Анализирую лист: "${sheetName}"`);
  
  // Получаем диапазон данных
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  console.log(`   Диапазон: ${worksheet['!ref']}`);
  console.log(`   Строк: ${range.e.r + 1}, Колонок: ${range.e.c + 1}`);
  
  // Конвертируем в JSON
  const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
    header: 1, 
    raw: false, 
    defval: '',
    blankrows: false
  });
  
  console.log('\n📝 СОДЕРЖИМОЕ ТАБЛИЦЫ:');
  console.log('=' * 80);
  
  // Показываем первые 20 строк
  jsonData.slice(0, 20).forEach((row, index) => {
    console.log(`Строка ${index + 1}: [${row.join(' | ')}]`);
  });
  
  if (jsonData.length > 20) {
    console.log(`... и еще ${jsonData.length - 20} строк`);
  }
  
  // Анализируем структуру
  console.log('\n🔍 АНАЛИЗ СТРУКТУРЫ:');
  
  // Ищем заголовки
  let headerRow = -1;
  for (let i = 0; i < Math.min(10, jsonData.length); i++) {
    const row = jsonData[i];
    if (row && row.some(cell => 
      cell && typeof cell === 'string' && 
      (cell.toLowerCase().includes('понедельник') || 
       cell.toLowerCase().includes('вторник') ||
       cell.toLowerCase().includes('день'))
    )) {
      headerRow = i;
      break;
    }
  }
  
  if (headerRow >= 0) {
    console.log(`   Заголовки в строке: ${headerRow + 1}`);
    console.log(`   Содержимое: [${jsonData[headerRow].join(' | ')}]`);
  }
  
  // Ищем блюда
  console.log('\n🍽️ ПОИСК БЛЮД:');
  const dishKeywords = ['борщ', 'суп', 'каша', 'котлета', 'мясо', 'рыба', 'салат', 'компот'];
  let dishCount = 0;
  
  jsonData.forEach((row, rowIndex) => {
    if (row && Array.isArray(row)) {
      row.forEach((cell, colIndex) => {
        if (cell && typeof cell === 'string') {
          const cellLower = cell.toLowerCase();
          if (dishKeywords.some(keyword => cellLower.includes(keyword))) {
            console.log(`   Строка ${rowIndex + 1}, Колонка ${colIndex + 1}: "${cell}"`);
            dishCount++;
          }
        }
      });
    }
  });
  
  console.log(`   Найдено блюд: ${dishCount}`);
  
  // Ищем цены
  console.log('\n💰 ПОИСК ЦЕН:');
  const pricePattern = /(\d+)\s*(руб|₽|р\.?)/gi;
  let priceCount = 0;
  
  jsonData.forEach((row, rowIndex) => {
    if (row && Array.isArray(row)) {
      row.forEach((cell, colIndex) => {
        if (cell && typeof cell === 'string') {
          const match = cell.match(pricePattern);
          if (match) {
            console.log(`   Строка ${rowIndex + 1}, Колонка ${colIndex + 1}: "${cell}" -> ${match[1]}₽`);
            priceCount++;
          }
        }
      });
    }
  });
  
  console.log(`   Найдено цен: ${priceCount}`);
  
  console.log('\n✅ АНАЛИЗ ЗАВЕРШЕН!');
  
} catch (error) {
  console.error('❌ ОШИБКА:', error.message);
}
