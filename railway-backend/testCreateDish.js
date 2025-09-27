/**
 * ТЕСТ СОЗДАНИЯ БЛЮДА
 */

import { UltimateMenuParser } from './ultimateMenuParser.js';

const parser = new UltimateMenuParser();

console.log('🔍 ТЕСТ СОЗДАНИЯ БЛЮДА...\n');

const testCases = [
  { text: 'Борщ с мясом', row: ['Борщ с мясом', '120 руб'], rowIndex: 0, colIndex: 0 },
  { text: 'Гречневая каша', row: ['Гречневая каша', '80 руб'], rowIndex: 1, colIndex: 0 },
  { text: 'Котлета', row: ['Котлета', '150 руб'], rowIndex: 2, colIndex: 0 }
];

testCases.forEach((testCase, i) => {
  console.log(`Тест ${i + 1}: "${testCase.text}"`);
  
  try {
    const dish = parser.createDishFromCell(
      testCase.text, 
      testCase.row, 
      testCase.rowIndex, 
      testCase.colIndex, 
      {}
    );
    
    if (dish) {
      console.log(`✅ Создано: ${dish.name}`);
      console.log(`   💰 Цена: ${dish.price}₽`);
      console.log(`   📏 Порция: ${dish.portion}`);
      console.log(`   📅 День: ${dish.day_of_week}`);
      console.log(`   🍽️ Тип: ${dish.meal_type}`);
    } else {
      console.log('❌ НЕ СОЗДАНО');
    }
  } catch (error) {
    console.log(`❌ ОШИБКА: ${error.message}`);
  }
  
  console.log('');
});
