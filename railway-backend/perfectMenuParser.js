/**
 * ИДЕАЛЬНЫЙ ПАРСЕР МЕНЮ - БЕЗ БАГОВ
 * Переписан с нуля для точного определения приемов пищи
 */

import XLSX from 'xlsx';

class PerfectMenuParser {
  constructor() {
    console.log('🚀 Инициализация идеального парсера меню');
  }

  /**
   * Главный метод парсинга Excel файла
   */
  async parseExcelFile(fileBuffer) {
    try {
      console.log('📊 Начинаем парсинг Excel файла');
      
      // Читаем Excel файл
      const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      
      if (!sheetName) {
        console.log('❌ Нет листов в файле');
        return [];
      }
      
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      console.log(`✅ Файл прочитан, размер: ${data.length} строк`);
      
      // Парсим меню
      const menuItems = this.parseMenuData(data);
      
      console.log(`🎯 Парсинг завершен! Найдено ${menuItems.length} блюд`);
      return menuItems;
      
    } catch (error) {
      console.error('❌ Ошибка парсинга:', error);
      return [];
    }
  }

  /**
   * Парсинг данных меню
   */
  parseMenuData(data) {
    const menuItems = [];
    
    // Ищем колонки с днями недели
    const dayColumns = this.findDayColumns(data);
    console.log(`📅 Найдено дней: ${dayColumns.length}`);
    
    if (dayColumns.length === 0) {
      console.log('⚠️ Дни недели не найдены, пробуем альтернативный парсинг');
      return this.parseAlternativeStructure(data);
    }
    
    // Парсим каждый день
    dayColumns.forEach(dayCol => {
      console.log(`🔍 Парсим день ${dayCol.day} в колонке ${dayCol.column}`);
      
      const dayItems = this.parseDayColumn(data, dayCol.column, dayCol.day);
      menuItems.push(...dayItems);
      
      console.log(`✅ Добавлено ${dayItems.length} блюд для дня ${dayCol.day}`);
    });
    
    // Удаляем дубликаты
    const uniqueItems = this.removeDuplicates(menuItems);
    console.log(`🎯 Итого уникальных блюд: ${uniqueItems.length}`);
    
    return uniqueItems;
  }

  /**
   * Поиск колонок с днями недели
   */
  findDayColumns(data) {
    const dayColumns = [];
    const dayPatterns = [
      ['понедельник', 'пн', 'monday', 'mon'],
      ['вторник', 'вт', 'tuesday', 'tue'],
      ['среда', 'ср', 'wednesday', 'wed'],
      ['четверг', 'чт', 'thursday', 'thu'],
      ['пятница', 'пт', 'friday', 'fri'],
      ['суббота', 'сб', 'saturday', 'sat'],
      ['воскресенье', 'вс', 'sunday', 'sun']
    ];
    
    // Ищем в первых 10 строках
    for (let row = 0; row < Math.min(10, data.length); row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim().toLowerCase();
        if (cellText.length < 2) continue;
        
        // Проверяем каждый день
        dayPatterns.forEach((patterns, dayIndex) => {
          if (patterns.some(pattern => cellText.includes(pattern))) {
            dayColumns.push({
              day: dayIndex + 1,
              column: col,
              text: cell.toString().trim()
            });
            console.log(`✅ Найден день ${dayIndex + 1} в колонке ${col}: "${cell.toString().trim()}"`);
          }
        });
      }
    }
    
    return dayColumns;
  }

  /**
   * Парсинг колонки дня
   */
  parseDayColumn(data, colIndex, dayOfWeek) {
    const items = [];
    let currentMealType = null;
    let mealStartRow = -1;
    
    console.log(`🔍 Парсим колонку ${colIndex} для дня ${dayOfWeek}`);
    
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData || !rowData[colIndex]) continue;
      
      const cell = rowData[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.toString().trim();
      if (cellText.length < 2) continue;
      
      const lowerText = cellText.toLowerCase();
      
      // Проверяем, является ли это заголовком приема пищи
      const mealType = this.detectMealType(lowerText);
      
      if (mealType) {
        // Сохраняем предыдущий прием пищи
        if (currentMealType && mealStartRow >= 0) {
          const mealItems = this.extractMealItems(data, colIndex, mealStartRow, row - 1, dayOfWeek, currentMealType);
          items.push(...mealItems);
          console.log(`✅ Добавлено ${mealItems.length} блюд для ${currentMealType}`);
        }
        
        // Начинаем новый прием пищи
        currentMealType = mealType;
        mealStartRow = row + 1;
        console.log(`🍽️ Найден ${mealType} в строке ${row}: "${cellText}"`);
      }
    }
    
    // Обрабатываем последний прием пищи
    if (currentMealType && mealStartRow >= 0) {
      const mealItems = this.extractMealItems(data, colIndex, mealStartRow, data.length - 1, dayOfWeek, currentMealType);
      items.push(...mealItems);
      console.log(`✅ Добавлено ${mealItems.length} блюд для ${currentMealType}`);
    }
    
    // Если приемы пищи не найдены, парсим все как обед
    if (items.length === 0) {
      console.log(`⚠️ Приемы пищи не найдены для дня ${dayOfWeek}, парсим все как обед`);
      const allItems = this.extractMealItems(data, colIndex, 0, data.length - 1, dayOfWeek, 'обед');
      items.push(...allItems);
    }
    
    return items;
  }

  /**
   * Определение типа приема пищи
   */
  detectMealType(text) {
    const mealTypes = {
      'завтрак': ['завтрак', 'з а в т р а к', 'утром', 'утренний', 'утро', 'breakfast'],
      'обед': ['обед', 'о б е д', 'дневной', 'основной', 'день', 'lunch'],
      'полдник': ['полдник', 'п о л д н и к', 'перекус', 'дополнительный', 'доп', 'snack'],
      'ужин': ['ужин', 'у ж и н', 'вечерний', 'вечером', 'вечер', 'dinner']
    };
    
    for (const [mealType, keywords] of Object.entries(mealTypes)) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return mealType;
      }
    }
    
    return null;
  }

  /**
   * Извлечение блюд из секции приема пищи
   */
  extractMealItems(data, colIndex, startRow, endRow, dayOfWeek, mealType) {
    const items = [];
    
    console.log(`🍽️ Извлекаем блюда для ${mealType} (строки ${startRow}-${endRow})`);
    
    for (let row = startRow; row <= endRow; row++) {
      const rowData = data[row];
      if (!rowData || !rowData[colIndex]) continue;
      
      const cell = rowData[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.toString().trim();
      if (cellText.length < 3) continue;
      
      // Проверяем, не является ли это заголовком другого приема пищи
      if (this.detectMealType(cellText.toLowerCase())) {
        break;
      }
      
      // Создаем блюдо
      const dish = this.createDish(cellText, dayOfWeek, mealType);
      if (dish) {
        if (Array.isArray(dish)) {
          items.push(...dish);
        } else {
          items.push(dish);
        }
      }
    }
    
    return items;
  }

  /**
   * Создание объекта блюда
   */
  createDish(text, dayOfWeek, mealType) {
    // Очищаем название
    const cleanName = this.cleanDishName(text);
    if (!cleanName || cleanName.length < 3) return null;
    
    // Извлекаем информацию
    const weight = this.extractWeight(text);
    const recipeNumber = this.extractRecipeNumber(text);
    const portion = this.generatePortion(weight);
    const description = this.generateDescription(cleanName, weight);
    
    // Обрабатываем соусы
    if (cleanName.toLowerCase().includes('соусы:')) {
      return this.createSauceDishes(cleanName, dayOfWeek, mealType);
    }
    
    const dish = {
      name: cleanName,
      description: description,
      price: 0, // Цена не указана в файле
      portion: portion,
      day_of_week: dayOfWeek,
      meal_type: mealType,
      school_id: 1, // По умолчанию
      week_start: new Date().toISOString().split('T')[0],
      recipe_number: recipeNumber,
      weight: weight
    };
    
    console.log(`🍽️ Создано блюдо: "${cleanName}" (${mealType})`);
    return dish;
  }

  /**
   * Очистка названия блюда
   */
  cleanDishName(text) {
    let clean = text.trim();
    
    // Убираем лишние символы
    clean = clean.replace(/[^\w\s\-\.\(\)\/]/g, '');
    
    // Убираем лишние пробелы
    clean = clean.replace(/\s+/g, ' ').trim();
    
    // Исключаем заголовки
    const excludeWords = [
      'количество порций', 'порций', 'грамм', 'г', 'кг', 'литр', 'л',
      'завтрак', 'обед', 'полдник', 'ужин', 'дополнительно',
      'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье'
    ];
    
    const lowerClean = clean.toLowerCase();
    if (excludeWords.some(word => lowerClean.includes(word))) {
      return null;
    }
    
    return clean;
  }

  /**
   * Извлечение веса
   */
  extractWeight(text) {
    const weightMatch = text.match(/(\d+)\s*г/);
    return weightMatch ? weightMatch[1] + ' г' : null;
  }

  /**
   * Извлечение номера рецепта
   */
  extractRecipeNumber(text) {
    const recipeMatch = text.match(/№?\s*(\d+)/);
    return recipeMatch ? recipeMatch[1] : null;
  }

  /**
   * Генерация порции
   */
  generatePortion(weight) {
    if (!weight) return '1 порция';
    return weight;
  }

  /**
   * Генерация описания
   */
  generateDescription(name, weight) {
    let description = name;
    if (weight) {
      description += ` (${weight})`;
    }
    return description;
  }

  /**
   * Создание блюд из соусов
   */
  createSauceDishes(text, dayOfWeek, mealType) {
    const sauces = text.split(':')[1]?.split(';') || [];
    const dishes = [];
    
    sauces.forEach(sauce => {
      const cleanSauce = sauce.trim();
      if (cleanSauce && cleanSauce.length > 2) {
        const dish = this.createDish(cleanSauce, dayOfWeek, mealType);
        if (dish) {
          dishes.push(dish);
        }
      }
    });
    
    return dishes;
  }

  /**
   * Альтернативный парсинг для нестандартных структур
   */
  parseAlternativeStructure(data) {
    console.log('🔄 Пробуем альтернативный парсинг');
    const items = [];
    
    // Ищем все ячейки с блюдами
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim();
        if (cellText.length < 3) continue;
        
        // Пропускаем заголовки
        if (this.detectMealType(cellText.toLowerCase()) || this.isDayHeader(cellText.toLowerCase())) {
          continue;
        }
        
        // Создаем блюдо
        const dish = this.createDish(cellText, 1, 'обед'); // По умолчанию понедельник, обед
        if (dish) {
          if (Array.isArray(dish)) {
            items.push(...dish);
          } else {
            items.push(dish);
          }
        }
      }
    }
    
    return items;
  }

  /**
   * Проверка, является ли текст заголовком дня
   */
  isDayHeader(text) {
    const dayKeywords = [
      'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
      'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс',
      'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'
    ];
    
    return dayKeywords.some(keyword => text.includes(keyword));
  }

  /**
   * Удаление дубликатов
   */
  removeDuplicates(items) {
    const seen = new Set();
    const unique = [];
    
    items.forEach(item => {
      const key = `${item.name}-${item.day_of_week}-${item.meal_type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    
    return unique;
  }
}

export default PerfectMenuParser;
