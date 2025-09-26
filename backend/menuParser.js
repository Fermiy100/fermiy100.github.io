/**
 * Умный парсер меню для школьного питания
 * Поддерживает различные форматы Excel файлов
 */

import XLSX from 'xlsx';

export class MenuParser {
  constructor() {
    this.daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    this.mealTypes = ['завтрак', 'обед', 'полдник', 'ужин', 'дополнительно'];
    this.portionPatterns = [
      /(\d+\s*(г|шт|мл|л|кг|порц|порции?))/gi,
      /(\d+\s*(грамм|штук|миллилитр|литр|килограмм))/gi
    ];
    this.pricePatterns = [
      /(\d+)\s*(руб|₽|р\.?|рублей?)/gi,
      /(\d+)\s*(руб\.)/gi
    ];
  }

  /**
   * Основной метод парсинга Excel файла
   */
  parseExcelFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Конвертируем в JSON с сохранением структуры
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1, 
        raw: false, 
        defval: '',
        blankrows: false
      });

      return this.parseMenuData(jsonData);
    } catch (error) {
      throw new Error(`Ошибка чтения Excel файла: ${error.message}`);
    }
  }

  /**
   * Парсинг данных меню
   */
  parseMenuData(data) {
    const menuItems = [];
    let currentMealType = 'обед';
    let currentDay = 1;

    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row || row.length === 0) continue;

      // Определяем тип приема пищи
      const mealType = this.detectMealType(row);
      if (mealType) {
        currentMealType = mealType;
        continue;
      }

      // Определяем день недели
      const dayOfWeek = this.detectDayOfWeek(row);
      if (dayOfWeek) {
        currentDay = dayOfWeek;
        continue;
      }

      // Парсим блюда
      const dishes = this.parseDishes(row, currentMealType, currentDay);
      menuItems.push(...dishes);
    }

    return {
      items: menuItems,
      totalItems: menuItems.length,
      mealTypes: [...new Set(menuItems.map(item => item.meal_type))],
      days: [...new Set(menuItems.map(item => item.day_of_week))]
    };
  }

  /**
   * Определение типа приема пищи
   */
  detectMealType(row) {
    const firstCell = (row[0] || '').toString().toLowerCase().trim();
    
    const mealTypeMap = {
      'завтрак': 'завтрак',
      'завтр': 'завтрак',
      'обед': 'обед',
      'полдник': 'полдник',
      'полд': 'полдник',
      'ужин': 'ужин',
      'дополнительный': 'дополнительно',
      'дополнительно': 'дополнительно',
      'гарнир': 'дополнительно',
      'перекус': 'полдник'
    };

    for (const [keyword, mealType] of Object.entries(mealTypeMap)) {
      if (firstCell.includes(keyword)) {
        return mealType;
      }
    }

    return null;
  }

  /**
   * Определение дня недели
   */
  detectDayOfWeek(row) {
    const firstCell = (row[0] || '').toString().toLowerCase().trim();
    
    const dayMap = {
      'понедельник': 1,
      'пн': 1,
      'вторник': 2,
      'вт': 2,
      'среда': 3,
      'ср': 3,
      'четверг': 4,
      'чт': 4,
      'пятница': 5,
      'пт': 5
    };

    for (const [keyword, day] of Object.entries(dayMap)) {
      if (firstCell.includes(keyword)) {
        return day;
      }
    }

    return null;
  }

  /**
   * Парсинг блюд из строки
   */
  parseDishes(row, mealType, dayOfWeek) {
    const dishes = [];
    
    // Пропускаем заголовки и пустые строки
    if (this.isHeaderRow(row) || this.isEmptyRow(row)) {
      return dishes;
    }

    // Обрабатываем каждую ячейку (кроме первой)
    for (let colIndex = 1; colIndex < row.length; colIndex++) {
      const cellValue = (row[colIndex] || '').toString().trim();
      
      if (this.isValidDish(cellValue)) {
        const dish = this.parseDish(cellValue, mealType, dayOfWeek, colIndex);
        if (dish) {
          dishes.push(dish);
        }
      }
    }

    return dishes;
  }

  /**
   * Проверка, является ли строка заголовком
   */
  isHeaderRow(row) {
    const firstCell = (row[0] || '').toString().toLowerCase().trim();
    
    const headerKeywords = [
      'день', 'недел', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница',
      'завтрак', 'обед', 'полдник', 'ужин', 'дополнительный', 'гарнир',
      '№', 'номер', 'кол', 'количество', 'порц', 'порции', 'иче', 'ств'
    ];

    return headerKeywords.some(keyword => firstCell.includes(keyword));
  }

  /**
   * Проверка, является ли строка пустой
   */
  isEmptyRow(row) {
    return row.every(cell => !cell || cell.toString().trim() === '');
  }

  /**
   * Проверка, является ли значение валидным блюдом
   */
  isValidDish(value) {
    if (!value || value.length < 3) return false;
    
    // Исключаем числа, даты и служебные слова
    const excludePatterns = [
      /^\d+$/, // только числа
      /^\d{1,2}[.\-/]\d{1,2}/, // даты
      /недел|день|понедельник|вторник|среда|четверг|пятница/i,
      /завтрак|обед|полдник|ужин|дополнительный|гарнир/i,
      /№|номер|кол|количество|порц|порции|иче|ств/i
    ];

    return !excludePatterns.some(pattern => pattern.test(value));
  }

  /**
   * Парсинг отдельного блюда
   */
  parseDish(value, mealType, dayOfWeek, columnIndex) {
    const { name, portion, price } = this.extractDishInfo(value);
    
    if (!name || name.length < 3) return null;

    return {
      name: name,
      description: portion || null,
      price: price || 0,
      meal_type: mealType,
      day_of_week: this.calculateDayOfWeek(columnIndex, dayOfWeek),
      portion: portion || null
    };
  }

  /**
   * Извлечение информации о блюде
   */
  extractDishInfo(text) {
    let name = text;
    let portion = '';
    let price = 0;

    // Извлекаем порцию
    for (const pattern of this.portionPatterns) {
      const match = text.match(pattern);
      if (match) {
        portion = match[0];
        name = name.replace(match[0], '').trim();
        break;
      }
    }

    // Извлекаем цену
    for (const pattern of this.pricePatterns) {
      const match = text.match(pattern);
      if (match) {
        price = parseInt(match[1]);
        name = name.replace(match[0], '').trim();
        break;
      }
    }

    // Очищаем название
    name = name
      .replace(/[,\-–—]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    return { name, portion, price };
  }

  /**
   * Вычисление дня недели на основе колонки
   */
  calculateDayOfWeek(columnIndex, currentDay) {
    // Если текущий день определен, используем его
    if (currentDay && currentDay >= 1 && currentDay <= 5) {
      return currentDay;
    }

    // Иначе вычисляем на основе позиции колонки
    const dayIndex = Math.max(0, columnIndex - 1);
    return Math.min(dayIndex + 1, 5);
  }

  /**
   * Валидация результата парсинга
   */
  validateParsedMenu(menuData) {
    const errors = [];
    const warnings = [];

    if (!menuData.items || menuData.items.length === 0) {
      errors.push('Не найдено ни одного блюда в меню');
    }

    if (menuData.items.length < 5) {
      warnings.push('Найдено очень мало блюд. Проверьте формат файла.');
    }

    // Проверяем наличие всех дней недели
    const days = new Set(menuData.items.map(item => item.day_of_week));
    if (days.size < 3) {
      warnings.push('Меню содержит блюда менее чем для 3 дней недели');
    }

    // Проверяем наличие всех типов питания
    const mealTypes = new Set(menuData.items.map(item => item.meal_type));
    if (mealTypes.size < 2) {
      warnings.push('Меню содержит блюда менее чем для 2 типов питания');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default MenuParser;
