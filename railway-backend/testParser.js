/**
 * ТЕСТ УЛЬТИМАТИВНОГО ПАРСЕРА
 */

import { UltimateMenuParser } from './ultimateMenuParser.js';

// Создаем тестовые данные Excel
const testData = [
  ['День недели', 'Завтрак', 'Обед', 'Полдник', 'Ужин'],
  ['Понедельник', 'Гречневая каша 80 руб', 'Борщ с мясом 120 руб', 'Печенье 30 руб', 'Котлета 150 руб'],
  ['Вторник', 'Овсянка 70 руб', 'Суп куриный 100 руб', 'Йогурт 40 руб', 'Рыба 140 руб'],
  ['Среда', 'Манка 60 руб', 'Щи 110 руб', 'Фрукт 25 руб', 'Мясо 160 руб'],
  ['Четверг', 'Рисовая каша 75 руб', 'Борщ 120 руб', 'Кефир 35 руб', 'Курица 155 руб'],
  ['Пятница', 'Пшенка 65 руб', 'Солянка 130 руб', 'Творог 45 руб', 'Говядина 170 руб']
];

console.log('🧪 ТЕСТИРУЮ УЛЬТИМАТИВНЫЙ ПАРСЕР...\n');

try {
  const parser = new UltimateMenuParser();
  
  // Тестируем парсинг
  const result = parser.parseMenuData(testData);
  
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
  
  console.log('\n🍽️ НАЙДЕННЫЕ БЛЮДА:');
  result.items.forEach((item, index) => {
    console.log(`${index + 1}. ${item.name}`);
    console.log(`   💰 Цена: ${item.price}₽`);
    console.log(`   📏 Порция: ${item.portion}`);
    console.log(`   📅 День: ${item.day_of_week}`);
    console.log(`   🍽️ Тип: ${item.meal_type}`);
    console.log(`   📝 Описание: ${item.description}`);
    console.log('');
  });
  
  // Тестируем валидацию
  console.log('🔍 ТЕСТИРУЮ ВАЛИДАЦИЮ...');
  const validation = parser.validateParsedMenu(result);
  console.log(`✅ Валидация пройдена: ${validation.isValid}`);
  
  if (validation.errors.length > 0) {
    console.log('❌ Ошибки валидации:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }
  
  if (validation.warnings.length > 0) {
    console.log('⚠️ Предупреждения валидации:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }
  
  console.log('\n🎉 ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
  
} catch (error) {
  console.error('❌ ОШИБКА ТЕСТА:', error.message);
  console.error(error.stack);
}
