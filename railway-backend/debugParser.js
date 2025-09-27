/**
 * ОТЛАДКА ПАРСЕРА
 */

import { UltimateMenuParser } from './ultimateMenuParser.js';

// Простые тестовые данные
const simpleData = [
  ['Борщ с мясом', '120 руб'],
  ['Гречневая каша', '80 руб'],
  ['Котлета', '150 руб']
];

console.log('🔍 ОТЛАДКА ПАРСЕРА...\n');

try {
  const parser = new UltimateMenuParser();
  
  console.log('📊 Входные данные:');
  simpleData.forEach((row, i) => {
    console.log(`Строка ${i}: [${row.join(', ')}]`);
  });
  
  // Тестируем каждый метод
  console.log('\n🔍 ТЕСТИРУЮ МЕТОДЫ:');
  
  // Тест isDish
  console.log('\n1. Тест isDish:');
  simpleData.forEach(row => {
    row.forEach(cell => {
      if (cell && typeof cell === 'string') {
        const isDish = parser.isDish(cell);
        console.log(`   "${cell}" -> ${isDish ? '✅ БЛЮДО' : '❌ НЕ БЛЮДО'}`);
      }
    });
  });
  
  // Тест extractPrice
  console.log('\n2. Тест extractPrice:');
  simpleData.forEach((row, i) => {
    const price = parser.extractPrice(row, 0);
    console.log(`   Строка ${i}: [${row.join(', ')}] -> Цена: ${price}₽`);
  });
  
  // Тест createDishFromCell
  console.log('\n3. Тест createDishFromCell:');
  simpleData.forEach((row, i) => {
    const dish = parser.createDishFromCell(row[0], row, i, 0, {});
    if (dish) {
      console.log(`   "${row[0]}" -> ${dish.name} (${dish.price}₽, ${dish.portion})`);
    } else {
      console.log(`   "${row[0]}" -> НЕ СОЗДАНО`);
    }
  });
  
  // Полный тест
  console.log('\n4. Полный тест парсинга:');
  const result = parser.parseMenuData(simpleData);
  
  console.log(`📊 Результат: ${result.totalItems} блюд`);
  console.log(`💬 Сообщение: ${result.message}`);
  
  if (result.items.length > 0) {
    console.log('\n🍽️ Найденные блюда:');
    result.items.forEach((item, index) => {
      console.log(`${index + 1}. ${item.name} - ${item.price}₽ (${item.portion})`);
    });
  }
  
} catch (error) {
  console.error('❌ ОШИБКА:', error.message);
  console.error(error.stack);
}
