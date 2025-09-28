/**
 * ТЕСТ ПАРСЕРА МЕНЮ
 * Тестирует улучшенный парсер на разных типах данных
 */

import { ImprovedMenuParser } from './improvedMenuParser.js';
import XLSX from 'xlsx';

// Создаем тестовые данные
const testData = [
  ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'],
  ['Завтрак', 'Завтрак', 'Завтрак', 'Завтрак', 'Завтрак'],
  ['Каша овсяная 200г', 'Каша гречневая 200г', 'Каша манная 200г', 'Каша рисовая 200г', 'Каша пшенная 200г'],
  ['Чай с сахаром 200мл', 'Какао 200мл', 'Молоко 200мл', 'Чай с лимоном 200мл', 'Компот 200мл'],
  ['Хлеб с маслом 20г', 'Хлеб с сыром 20г', 'Хлеб с вареньем 20г', 'Хлеб с медом 20г', 'Хлеб с джемом 20г'],
  ['', '', '', '', ''],
  ['Обед', 'Обед', 'Обед', 'Обед', 'Обед'],
  ['Суп гороховый 250г', 'Борщ 250г', 'Суп овощной 250г', 'Суп куриный 250г', 'Суп рыбный 250г'],
  ['Котлета мясная 80г', 'Рыба жареная 80г', 'Гуляш 80г', 'Курица тушеная 80г', 'Тефтели 80г'],
  ['Картофель пюре 150г', 'Гречка 150г', 'Рис 150г', 'Макароны 150г', 'Овощи тушеные 150г'],
  ['Салат из капусты 60г', 'Салат из моркови 60г', 'Салат из свеклы 60г', 'Салат из огурцов 60г', 'Салат из помидоров 60г'],
  ['Компот 200мл', 'Чай 200мл', 'Кисель 200мл', 'Морс 200мл', 'Сок 200мл']
];

// Создаем Excel файл в памяти
function createTestExcel() {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.aoa_to_sheet(testData);
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Меню');
  
  return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
}

// Тестируем парсер
async function testParser() {
  console.log('🧪 Начинаем тестирование улучшенного парсера...');
  
  try {
    // Создаем тестовый Excel файл
    const excelBuffer = createTestExcel();
    console.log('📊 Создан тестовый Excel файл');
    
    // Создаем парсер
    const parser = new ImprovedMenuParser();
    console.log('🔧 Создан экземпляр парсера');
    
    // Парсим файл
    const items = parser.parseExcelFile(excelBuffer);
    console.log(`✅ Парсинг завершен. Найдено ${items.length} блюд`);
    
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
    console.log('🍽️ Примеры найденных блюд:');
    items.slice(0, 10).forEach((item, index) => {
      console.log(`  ${index + 1}. ${item.name} (${item.meal_type}, день ${item.day_of_week})`);
    });
    
    // Группируем по дням
    const groupedByDay = items.reduce((acc, item) => {
      if (!acc[item.day_of_week]) acc[item.day_of_week] = [];
      acc[item.day_of_week].push(item);
      return acc;
    }, {});
    
    console.log('📅 Блюда по дням:');
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
    
    console.log('🍴 Блюда по типам приемов пищи:');
    Object.keys(groupedByMeal).forEach(meal => {
      console.log(`  ${meal}: ${groupedByMeal[meal].length} блюд`);
    });
    
    console.log('✅ Тестирование завершено успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка тестирования:', error);
  }
}

// Запускаем тест
testParser();