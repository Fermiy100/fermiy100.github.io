/**
 * ОТЛАДКА СТРУКТУРЫ ФАЙЛА
 */

import XLSX from 'xlsx';
import fs from 'fs';

function debugFile() {
  console.log('🔍 ОТЛАДКА СТРУКТУРЫ ФАЙЛА...');
  
  try {
    const filePath = '../2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА  22.09-26.09 (копия) — копия.xlsx';
    const buffer = fs.readFileSync(filePath);
    
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    
    console.log(`📊 Лист: ${sheetName}`);
    console.log(`📏 Размер: ${jsonData.length} строк`);
    
    // Показываем первые 30 строк
    console.log('\n📋 ПЕРВЫЕ 30 СТРОК:');
    for (let i = 0; i < Math.min(30, jsonData.length); i++) {
      const row = jsonData[i];
      console.log(`Строка ${i + 1}:`, row);
    }
    
    // Ищем "О Б Е Д"
    console.log('\n🔍 ПОИСК "О Б Е Д":');
    for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.trim().toLowerCase();
        if (cellText.includes('о б е д') || cellText.includes('обед')) {
          console.log(`  Найден "О Б Е Д" в строке ${rowIndex + 1}, колонке ${colIndex + 1}: "${cell}"`);
          
          // Показываем следующие 10 строк
          console.log(`  Следующие строки после "О Б Е Д":`);
          for (let j = rowIndex + 1; j < Math.min(rowIndex + 11, jsonData.length); j++) {
            const nextRow = jsonData[j];
            if (nextRow && nextRow[colIndex]) {
              console.log(`    Строка ${j + 1}: "${nextRow[colIndex]}"`);
            }
          }
        }
      }
    }
    
    // Ищем дни недели
    console.log('\n📅 ПОИСК ДНЕЙ НЕДЕЛИ:');
    const dayKeywords = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'];
    
    for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
      const row = jsonData[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.trim().toLowerCase();
        dayKeywords.forEach(day => {
          if (cellText.includes(day)) {
            console.log(`  Найден "${day}" в строке ${rowIndex + 1}, колонке ${colIndex + 1}: "${cell}"`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка отладки:', error);
  }
}

debugFile();
