/**
 * ТЕСТ ИЗВЛЕЧЕНИЯ ЦЕНЫ
 */

import { UltimateMenuParser } from './ultimateMenuParser.js';

const parser = new UltimateMenuParser();

console.log('🔍 ТЕСТ ИЗВЛЕЧЕНИЯ ЦЕНЫ...\n');

const testCases = [
  ['Борщ с мясом', '120 руб'],
  ['Гречневая каша', '80 руб'],
  ['Котлета', '150 руб'],
  ['120 руб', 'Борщ с мясом'],
  ['Борщ 120 руб с мясом']
];

testCases.forEach((row, i) => {
  console.log(`Тест ${i + 1}: [${row.join(', ')}]`);
  
  // Тестируем паттерны
  const rowText = row.join(' ');
  console.log(`   Текст: "${rowText}"`);
  
  parser.pricePatterns.forEach((pattern, j) => {
    const match = rowText.match(pattern);
    if (match) {
      console.log(`   ✅ Паттерн ${j + 1}: ${match[0]} -> ${match[1]}`);
    }
  });
  
  // Тестируем extractPrice
  const price = parser.extractPrice(row, 0);
  console.log(`   💰 Извлеченная цена: ${price}₽`);
  console.log('');
});
