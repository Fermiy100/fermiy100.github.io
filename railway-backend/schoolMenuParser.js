/**
 * СПЕЦИАЛИЗИРОВАННЫЙ ПАРСЕР ДЛЯ ШКОЛЬНОГО МЕНЮ
 * Создан специально для структуры: "2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА"
 */

import XLSX from 'xlsx';

export class SchoolMenuParser {
  constructor() {
    this.daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    this.mealTypes = ['завтрак', 'обед', 'полдник', 'ужин', 'дополнительно'];
    
    // Структура таблицы
    this.structure = {
      headerRow: 1,        // Строка с днями недели (0-based)
      breakfastStart: 2,   // Начало завтрака
      breakfastEnd: 15,    // Конец завтрака
      lunchStart: 18,      // Начало обеда
      lunchEnd: 39,        // Конец обеда
      dayColumns: [0, 2, 4, 6, 8] // Колонки дней недели (A, C, E, G, I)
    };
    
    // Паттерны для извлечения данных
    this.weightPattern = /(\d+)\s*г/gi;
    this.recipePattern = /№\s*(\d+\/\d+)/gi;
    this.portionPattern = /(\d+)\s*(шт|порц|порции?)/gi;
  }

  /**
   * Основной метод парсинга Excel файла
   */
  parseExcelFile(buffer) {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Конвертируем в JSON
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
    const errors = [];
    const warnings = [];
    
    console.log('🍽️ Парсинг школьного меню...');
    
    // Парсим завтрак
    const breakfastItems = this.parseMealSection(data, 'завтрак', this.structure.breakfastStart, this.structure.breakfastEnd);
    menuItems.push(...breakfastItems);
    
    // Парсим обед
    const lunchItems = this.parseMealSection(data, 'обед', this.structure.lunchStart, this.structure.lunchEnd);
    menuItems.push(...lunchItems);
    
    console.log(`✅ Найдено блюд: ${menuItems.length}`);
    
    return {
      items: menuItems,
      totalItems: menuItems.length,
      message: `Обработано ${menuItems.length} блюд из школьного меню`,
      errors: errors,
      warnings: warnings
    };
  }

  /**
   * Парсинг секции питания (завтрак/обед)
   */
  parseMealSection(data, mealType, startRow, endRow) {
    const items = [];
    
    console.log(`📋 Парсинг ${mealType} (строки ${startRow + 1}-${endRow + 1})`);
    
    for (let rowIndex = startRow; rowIndex <= endRow && rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      if (!row || row.length === 0) continue;
      
      // Пропускаем заголовки
      if (this.isHeaderRow(row, rowIndex)) continue;
      
      // Парсим каждую колонку дня недели
      this.structure.dayColumns.forEach((colIndex, dayIndex) => {
        const cell = row[colIndex];
        
        if (!cell || typeof cell !== 'string') return;
        
        const cellText = cell.trim();
        if (!cellText || cellText.length < 3) return;
        
        // Создаем блюдо
        const dish = this.createDishFromCell(cellText, rowIndex, colIndex, dayIndex + 1, mealType);
        if (dish) {
          items.push(dish);
          console.log(`   ✅ ${dish.name} (${dish.meal_type}, день ${dish.day_of_week})`);
        }
      });
    }
    
    return items;
  }

  /**
   * Создание блюда из ячейки
   */
  createDishFromCell(text, rowIndex, colIndex, dayOfWeek, mealType) {
    // Очищаем название
    const cleanName = this.cleanDishName(text);
    if (!cleanName || cleanName.length < 3) return null;
    
    // Извлекаем вес
    const weight = this.extractWeight(text);
    
    // Извлекаем номер рецепта
    const recipeNumber = this.extractRecipeNumber(text);
    
    // Извлекаем порцию
    const portion = this.extractPortion(text);
    
    // НЕ генерируем цены - их нет в таблице
    const price = 0;
    
    return {
      name: cleanName,
      description: this.generateDescription(cleanName, recipeNumber),
      price: price,
      portion: portion || weight || this.generatePortion(cleanName),
      day_of_week: dayOfWeek,
      meal_type: mealType,
      school_id: 1,
      week_start: new Date().toISOString().split('T')[0],
      recipe_number: recipeNumber,
      weight: weight
    };
  }

  /**
   * Очистка названия блюда
   */
  cleanDishName(text) {
    let clean = text.trim();
    
    // Убираем номера рецептов
    clean = clean.replace(/№\s*\d+\/\d+/g, '');
    
    // Убираем лишние пробелы
    clean = clean.replace(/\s+/g, ' ').trim();
    
    // Убираем лишние символы в начале и конце
    clean = clean.replace(/^[^\wа-яё]+|[^\wа-яё]+$/gi, '');
    
    // Исключаем общие слова, которые не являются блюдами
    const excludeWords = ['завтрак', 'обед', 'полдник', 'ужин', 'завтрак:', 'обед:', 'полдник:', 'ужин:'];
    if (excludeWords.some(word => clean.toLowerCase() === word.toLowerCase())) {
      return null;
    }
    
    return clean;
  }

  /**
   * Извлечение веса
   */
  extractWeight(text) {
    const match = text.match(this.weightPattern);
    return match ? match[0] : '';
  }

  /**
   * Извлечение номера рецепта
   */
  extractRecipeNumber(text) {
    const match = text.match(this.recipePattern);
    return match ? match[1] : '';
  }

  /**
   * Извлечение порции
   */
  extractPortion(text) {
    const match = text.match(this.portionPattern);
    return match ? match[0] : '';
  }

  /**
   * Генерация цены на основе названия и типа
   */
  generatePrice(name, mealType) {
    const nameLower = name.toLowerCase();
    
    // Цены для завтрака
    if (mealType === 'завтрак') {
      if (nameLower.includes('каша')) return 80;
      if (nameLower.includes('оладьи') || nameLower.includes('блинчики')) return 60;
      if (nameLower.includes('омлет')) return 90;
      if (nameLower.includes('сырники')) return 85;
      if (nameLower.includes('пудинг')) return 70;
      if (nameLower.includes('молоко') || nameLower.includes('чай') || nameLower.includes('какао')) return 25;
      if (nameLower.includes('хлеб') || nameLower.includes('сыр') || nameLower.includes('масло')) return 15;
      if (nameLower.includes('колбаса') || nameLower.includes('ветчина')) return 40;
      return 50; // Средняя цена завтрака
    }
    
    // Цены для обеда
    if (mealType === 'обед') {
      if (nameLower.includes('суп') || nameLower.includes('борщ')) return 120;
      if (nameLower.includes('мясо') || nameLower.includes('котлета')) return 150;
      if (nameLower.includes('рыба')) return 140;
      if (nameLower.includes('салат')) return 60;
      if (nameLower.includes('овощи')) return 45;
      if (nameLower.includes('каша') || nameLower.includes('гарнир')) return 80;
      if (nameLower.includes('компот') || nameLower.includes('напиток')) return 40;
      return 100; // Средняя цена обеда
    }
    
    return 80; // Средняя цена
  }

  /**
   * Генерация порции
   */
  generatePortion(name) {
    const nameLower = name.toLowerCase();
    
    if (nameLower.includes('суп') || nameLower.includes('борщ')) return '250г';
    if (nameLower.includes('каша')) return '200г';
    if (nameLower.includes('мясо') || nameLower.includes('рыба')) return '80г';
    if (nameLower.includes('салат') || nameLower.includes('овощи')) return '60г';
    if (nameLower.includes('хлеб')) return '20г';
    if (nameLower.includes('молоко') || nameLower.includes('чай') || nameLower.includes('компот')) return '200мл';
    if (nameLower.includes('оладьи') || nameLower.includes('блинчики')) return '2шт';
    
    return '150г'; // Стандартная порция
  }

  /**
   * Генерация описания
   */
  generateDescription(name, recipeNumber) {
    let description = `Вкусное блюдо: ${name}`;
    if (recipeNumber) {
      description += ` (рецепт №${recipeNumber})`;
    }
    return description;
  }

  /**
   * Проверка, является ли строка заголовком
   */
  isHeaderRow(row, rowIndex) {
    if (!row || row.length === 0) return true;
    
    const rowText = row.join(' ').toLowerCase();
    
    // Заголовки типов питания
    if (rowText.includes('завтрак') || rowText.includes('обед') || 
        rowText.includes('полдник') || rowText.includes('ужин')) {
      return true;
    }
    
    // Заголовки дополнительных секций
    if (rowText.includes('дополнительный') || rowText.includes('гарнир')) {
      return true;
    }
    
    // Пустые строки
    if (row.every(cell => !cell || cell.toString().trim() === '')) {
      return true;
    }
    
    return false;
  }

  /**
   * Валидация распарсенного меню
   */
  validateParsedMenu(data) {
    const errors = [];
    const warnings = [];
    
    if (!data || !data.items || !Array.isArray(data.items)) {
      errors.push('Некорректная структура данных');
      return { isValid: false, errors, warnings };
    }
    
    if (data.items.length === 0) {
      warnings.push('Меню пустое');
    }
    
    // Проверяем каждое блюдо
    data.items.forEach((item, index) => {
      if (!item.name || item.name.trim().length < 2) {
        errors.push(`Блюдо ${index + 1}: отсутствует название`);
      }
      
      if (!item.price || item.price <= 0) {
        warnings.push(`Блюдо "${item.name}": цена не указана или равна 0`);
      }
      
      if (!item.portion || item.portion.trim().length === 0) {
        warnings.push(`Блюдо "${item.name}": порция не указана`);
      }
      
      if (!item.day_of_week || item.day_of_week < 1 || item.day_of_week > 5) {
        warnings.push(`Блюдо "${item.name}": некорректный день недели`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}

export default SchoolMenuParser;
