/**
 * ТЕСТ С РЕАЛЬНЫМИ ДАННЫМИ
 */

import { UltimateMenuParser } from './ultimateMenuParser.js';

// Реальные данные из Excel файла
const realData = [
  ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'],
  ['Завтрак', 'Гречневая каша с маслом', 'Овсяная каша', 'Манная каша', 'Рисовая каша', 'Пшенная каша'],
  ['', '80 руб', '70 руб', '60 руб', '75 руб', '65 руб'],
  ['Обед', 'Борщ с мясом', 'Суп куриный', 'Щи из свежей капусты', 'Борщ украинский', 'Солянка мясная'],
  ['', '120 руб', '100 руб', '110 руб', '120 руб', '130 руб'],
  ['', 'Котлета по-киевски', 'Рыба жареная', 'Мясо тушеное', 'Курица запеченная', 'Говядина отварная'],
  ['', '150 руб', '140 руб', '160 руб', '155 руб', '170 руб'],
  ['Полдник', 'Печенье', 'Йогурт', 'Фрукт', 'Кефир', 'Творог'],
  ['', '30 руб', '40 руб', '25 руб', '35 руб', '45 руб'],
  ['Ужин', 'Картофельное пюре', 'Макароны', 'Гречка', 'Рис отварной', 'Картофель жареный'],
  ['', '90 руб', '85 руб', '80 руб', '75 руб', '95 руб']
];

console.log('🧪 ТЕСТИРУЮ С РЕАЛЬНЫМИ ДАННЫМИ...\n');

try {
  const parser = new UltimateMenuParser();
  
  // Тестируем парсинг
  const result = parser.parseMenuData(realData);
  
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
    console.log('');
  });
  
  // Группируем по дням недели
  console.log('\n📅 ГРУППИРОВКА ПО ДНЯМ:');
  const groupedByDay = {};
  result.items.forEach(item => {
    if (!groupedByDay[item.day_of_week]) {
      groupedByDay[item.day_of_week] = [];
    }
    groupedByDay[item.day_of_week].push(item);
  });
  
  Object.keys(groupedByDay).forEach(day => {
    const dayNames = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
    console.log(`\n${dayNames[day]}:`);
    groupedByDay[day].forEach(item => {
      console.log(`  - ${item.name} (${item.meal_type}) - ${item.price}₽`);
    });
  });
  
  console.log('\n🎉 ТЕСТ С РЕАЛЬНЫМИ ДАННЫМИ ЗАВЕРШЕН!');
  
} catch (error) {
  console.error('❌ ОШИБКА ТЕСТА:', error.message);
  console.error(error.stack);
}
