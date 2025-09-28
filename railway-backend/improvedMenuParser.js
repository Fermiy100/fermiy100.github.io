/**
 * УЛУЧШЕННЫЙ ПАРСЕР МЕНЮ
 * Универсальный парсер для любых структур школьного меню
 * Автоматически определяет структуру и извлекает блюда
 */

import XLSX from 'xlsx';

export class ImprovedMenuParser {
  constructor() {
    // Паттерны для извлечения данных
    this.weightPattern = /\d+\s*г/gi;
    this.recipePattern = /№\s*(\d+\/\d+)/gi;
    this.portionPattern = /\d+\s*шт/gi;
    
    // Расширенные словари для определения типов приемов пищи
    this.breakfastKeywords = ['завтрак', 'утром', 'утренний', 'утро'];
    this.lunchKeywords = ['обед', 'дневной', 'основной', 'день'];
    this.snackKeywords = ['полдник', 'перекус', 'дополнительный', 'доп'];
    this.dinnerKeywords = ['ужин', 'вечерний', 'вечером', 'вечер'];
    
    // Дни недели (разные варианты написания)
    this.daysOfWeek = [
      ['понедельник', 'пн', 'monday'],
      ['вторник', 'вт', 'tuesday'],
      ['среда', 'ср', 'wednesday'],
      ['четверг', 'чт', 'thursday'],
      ['пятница', 'пт', 'friday'],
      ['суббота', 'сб', 'saturday'],
      ['воскресенье', 'вс', 'sunday']
    ];
  }

  /**
   * Основной метод парсинга Excel файла
   */
  parseExcelFile(buffer) {
    try {
      console.log('🔍 Начинаем улучшенный парсинг Excel файла...');
      
      // Читаем Excel файл
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Конвертируем в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`📊 Загружен лист: ${sheetName}`);
      console.log(`📏 Размер данных: ${jsonData.length} строк`);
      
      // Пробуем разные стратегии парсинга
      let items = [];
      
      // Стратегия 1: Стандартная структура с днями и приемами пищи
      items = this.parseStandardStructure(jsonData);
      if (items.length > 0) {
        console.log(`✅ Стандартная структура: найдено ${items.length} блюд`);
        return items;
      }
      
      // Стратегия 2: Простой список блюд
      items = this.parseSimpleList(jsonData);
      if (items.length > 0) {
        console.log(`✅ Простой список: найдено ${items.length} блюд`);
        return items;
      }
      
      // Стратегия 3: Поиск по ключевым словам
      items = this.parseByKeywords(jsonData);
      if (items.length > 0) {
        console.log(`✅ Поиск по ключевым словам: найдено ${items.length} блюд`);
        return items;
      }
      
      // Стратегия 4: Универсальный парсинг
      items = this.parseUniversal(jsonData);
      console.log(`✅ Универсальный парсинг: найдено ${items.length} блюд`);
      
      return items;
      
    } catch (error) {
      console.error('❌ Ошибка парсинга:', error);
      throw new Error(`Ошибка парсинга Excel файла: ${error.message}`);
    }
  }

  /**
   * Парсинг стандартной структуры (дни + приемы пищи)
   */
  parseStandardStructure(data) {
    const items = [];
    
    // Ищем заголовки дней недели
    const dayColumns = this.findDayColumns(data);
    if (dayColumns.length === 0) return items;
    
    // Ищем строки с типами приемов пищи
    const mealRows = this.findMealRows(data);
    if (mealRows.length === 0) return items;
    
    console.log(`📅 Найдено дней: ${dayColumns.length}`);
    console.log(`🍽️ Найдено приемов пищи: ${mealRows.length}`);
    
    // Парсим блюда для каждой комбинации день + прием пищи
    dayColumns.forEach(dayCol => {
      mealRows.forEach(mealRow => {
        const mealItems = this.extractDishesFromArea(
          data, 
          dayCol.column, 
          mealRow.row + 1, 
          dayCol.day, 
          mealRow.meal
        );
        items.push(...mealItems);
      });
    });
    
    // Удаляем дубликаты
    return this.removeDuplicates(items);
  }

  /**
   * Парсинг простого списка блюд
   */
  parseSimpleList(data) {
    const items = [];
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cleanName = this.cleanDishName(cell);
        if (!cleanName || cleanName.length < 3) continue;
        
        // Определяем день и прием пищи по позиции
        const dayOfWeek = this.determineDayByPosition(colIndex, data);
        const mealType = this.determineMealByPosition(rowIndex, data);
        
        const dish = this.createDish(cleanName, dayOfWeek, mealType, cell);
        if (dish) {
          items.push(dish);
        }
      }
    }
    
    return items;
  }

  /**
   * Парсинг по ключевым словам
   */
  parseByKeywords(data) {
    const items = [];
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toLowerCase().trim();
        
        // Ищем блюда по ключевым словам
        if (this.isDishName(cellText)) {
          const cleanName = this.cleanDishName(cell);
          if (!cleanName || cleanName.length < 3) continue;
          
          const dayOfWeek = this.determineDayByContext(data, rowIndex, colIndex);
          const mealType = this.determineMealByContext(data, rowIndex, colIndex);
          
          const dish = this.createDish(cleanName, dayOfWeek, mealType, cell);
          if (dish) {
            items.push(dish);
          }
        }
      }
    }
    
    return items;
  }

  /**
   * Универсальный парсинг
   */
  parseUniversal(data) {
    const items = [];
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cleanName = this.cleanDishName(cell);
        if (!cleanName || cleanName.length < 3) continue;
        
        // Пытаемся определить контекст
        const dayOfWeek = this.determineDayByPosition(colIndex, data) || 
                         this.determineDayByContext(data, rowIndex, colIndex) || 
                         Math.floor(colIndex / 2) + 1;
        
        const mealType = this.determineMealByPosition(rowIndex, data) || 
                        this.determineMealByContext(data, rowIndex, colIndex) || 
                        (rowIndex % 2 === 0 ? 'завтрак' : 'обед');
        
        const dish = this.createDish(cleanName, dayOfWeek, mealType, cell);
        if (dish) {
          items.push(dish);
        }
      }
    }
    
    return items;
  }

  /**
   * Поиск колонок с днями недели
   */
  findDayColumns(data) {
    const dayColumns = [];
    const foundColumns = new Set();
    
    for (let rowIndex = 0; rowIndex < Math.min(5, data.length); rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        if (foundColumns.has(colIndex)) continue; // Избегаем дубликатов
        
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toLowerCase().trim();
        
        this.daysOfWeek.forEach((dayVariants, dayIndex) => {
          dayVariants.forEach(variant => {
            if (cellText.includes(variant)) {
              dayColumns.push({
                day: dayIndex + 1,
                column: colIndex,
                name: dayVariants[0]
              });
              foundColumns.add(colIndex);
            }
          });
        });
      }
    }
    
    return dayColumns;
  }

  /**
   * Поиск строк с типами приемов пищи
   */
  findMealRows(data) {
    const mealRows = [];
    const foundRows = new Set();
    
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      if (foundRows.has(rowIndex)) continue; // Избегаем дубликатов
      
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toLowerCase().trim();
        
        // Определяем тип приема пищи
        let mealType = null;
        if (this.breakfastKeywords.some(keyword => cellText.includes(keyword))) {
          mealType = 'завтрак';
        } else if (this.lunchKeywords.some(keyword => cellText.includes(keyword))) {
          mealType = 'обед';
        } else if (this.snackKeywords.some(keyword => cellText.includes(keyword))) {
          mealType = 'полдник';
        } else if (this.dinnerKeywords.some(keyword => cellText.includes(keyword))) {
          mealType = 'обед'; // Ужин как дополнение к обеду
        }
        
        if (mealType) {
          mealRows.push({
            meal: mealType,
            row: rowIndex,
            name: cellText
          });
          foundRows.add(rowIndex);
          break; // Нашли прием пищи в этой строке, переходим к следующей
        }
      }
    }
    
    return mealRows;
  }

  /**
   * Извлечение блюд из определенной области
   */
  extractDishesFromArea(data, colIndex, startRow, dayOfWeek, mealType) {
    const items = [];
    
    // Ищем в следующих 15 строках после заголовка приема пищи
    for (let rowIndex = startRow; rowIndex < Math.min(startRow + 15, data.length); rowIndex++) {
      const row = data[rowIndex];
      if (!row || !row[colIndex]) continue;
      
      const cell = row[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.trim();
      if (!cellText || cellText.length < 3) continue;
      
      // Проверяем, не является ли это заголовком другого приема пищи
      if (this.isMealHeader(cellText)) break;
      
      const dish = this.createDish(cellText, dayOfWeek, mealType, cell);
      if (dish) {
        items.push(dish);
      }
    }
    
    return items;
  }

  /**
   * Создание блюда
   */
  createDish(text, dayOfWeek, mealType, originalText) {
    const cleanName = this.cleanDishName(text);
    if (!cleanName || cleanName.length < 3) return null;
    
    // Извлекаем дополнительные данные
    const weight = this.extractWeight(originalText);
    const recipeNumber = this.extractRecipeNumber(originalText);
    const portion = this.extractPortion(originalText);
    
    return {
      name: cleanName,
      description: this.generateDescription(cleanName, recipeNumber),
      price: 0, // Цены не генерируем
      portion: portion || weight || this.generatePortion(cleanName),
      day_of_week: Math.min(Math.max(dayOfWeek, 1), 7), // Ограничиваем 1-7
      meal_type: mealType || 'обед',
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
    const excludeWords = [
      'завтрак', 'обед', 'полдник', 'ужин', 
      'завтрак:', 'обед:', 'полдник:', 'ужин:',
      'понедельник', 'вторник', 'среда', 'четверг', 'пятница',
      'суббота', 'воскресенье', 'день', 'неделя'
    ];
    
    if (excludeWords.some(word => clean.toLowerCase() === word.toLowerCase())) {
      return null;
    }
    
    return clean;
  }

  /**
   * Проверка, является ли текст названием блюда
   */
  isDishName(text) {
    const lowerText = text.toLowerCase();
    
    // Исключаем заголовки
    if (this.isMealHeader(lowerText) || this.isDayHeader(lowerText)) {
      return false;
    }
    
    // Проверяем, что это не пустая строка или число
    if (!text || text.length < 3 || /^\d+$/.test(text)) {
      return false;
    }
    
    // Проверяем наличие русских букв
    if (!/[а-яё]/i.test(text)) {
      return false;
    }
    
    return true;
  }

  /**
   * Проверка, является ли текст заголовком приема пищи
   */
  isMealHeader(text) {
    const lowerText = text.toLowerCase();
    return this.breakfastKeywords.some(k => lowerText.includes(k)) ||
           this.lunchKeywords.some(k => lowerText.includes(k)) ||
           this.snackKeywords.some(k => lowerText.includes(k)) ||
           this.dinnerKeywords.some(k => lowerText.includes(k));
  }

  /**
   * Проверка, является ли текст заголовком дня
   */
  isDayHeader(text) {
    const lowerText = text.toLowerCase();
    return this.daysOfWeek.some(dayVariants => 
      dayVariants.some(variant => lowerText.includes(variant))
    );
  }

  /**
   * Определение дня недели по позиции
   */
  determineDayByPosition(colIndex, data) {
    // Простая логика: каждая колонка = день недели
    return Math.min(colIndex + 1, 7);
  }

  /**
   * Определение приема пищи по позиции
   */
  determineMealByPosition(rowIndex, data) {
    // Простая логика: четные строки = завтрак, нечетные = обед
    return rowIndex % 2 === 0 ? 'завтрак' : 'обед';
  }

  /**
   * Определение дня недели по контексту
   */
  determineDayByContext(data, rowIndex, colIndex) {
    // Ищем ближайшие заголовки дней
    for (let r = Math.max(0, rowIndex - 5); r < Math.min(data.length, rowIndex + 5); r++) {
      const row = data[r];
      if (!row) continue;
      
      for (let c = Math.max(0, colIndex - 3); c < Math.min(row.length, colIndex + 3); c++) {
        const cell = row[c];
        if (!cell || typeof cell !== 'string') continue;
        
        if (this.isDayHeader(cell.toLowerCase())) {
          return this.getDayNumber(cell.toLowerCase());
        }
      }
    }
    
    return null;
  }

  /**
   * Определение приема пищи по контексту
   */
  determineMealByContext(data, rowIndex, colIndex) {
    // Ищем ближайшие заголовки приемов пищи
    for (let r = Math.max(0, rowIndex - 5); r < Math.min(data.length, rowIndex + 5); r++) {
      const row = data[r];
      if (!row) continue;
      
      for (let c = Math.max(0, colIndex - 3); c < Math.min(row.length, colIndex + 3); c++) {
        const cell = row[c];
        if (!cell || typeof cell !== 'string') continue;
        
        const lowerText = cell.toLowerCase();
        if (this.breakfastKeywords.some(k => lowerText.includes(k))) return 'завтрак';
        if (this.lunchKeywords.some(k => lowerText.includes(k))) return 'обед';
        if (this.snackKeywords.some(k => lowerText.includes(k))) return 'полдник';
        if (this.dinnerKeywords.some(k => lowerText.includes(k))) return 'обед';
      }
    }
    
    return null;
  }

  /**
   * Получение номера дня недели
   */
  getDayNumber(dayText) {
    for (let i = 0; i < this.daysOfWeek.length; i++) {
      if (this.daysOfWeek[i].some(variant => dayText.includes(variant))) {
        return i + 1;
      }
    }
    return null;
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
    
    return '150г';
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
   * Удаление дубликатов из списка блюд
   */
  removeDuplicates(items) {
    const seen = new Set();
    const unique = [];
    
    items.forEach(item => {
      const key = `${item.name.toLowerCase()}-${item.day_of_week}-${item.meal_type}`;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(item);
      }
    });
    
    console.log(`🔄 Удалено ${items.length - unique.length} дубликатов`);
    return unique;
  }

  /**
   * Валидация распарсенного меню
   */
  validateParsedMenu(items) {
    const errors = [];
    const warnings = [];
    
    if (!items || items.length === 0) {
      errors.push('Меню пустое - не найдено ни одного блюда');
      return { isValid: false, errors, warnings };
    }
    
    // Проверяем качество названий блюд
    items.forEach((item, index) => {
      if (!item.name || item.name.length < 3) {
        errors.push(`Блюдо ${index + 1}: некорректное название`);
      }
      
      if (item.name && item.name.length > 100) {
        warnings.push(`Блюдо "${item.name}": слишком длинное название`);
      }
    });
    
    // Проверяем наличие блюд для каждого дня
    const daysWithItems = new Set(items.map(item => item.day_of_week));
    const expectedDays = [1, 2, 3, 4, 5]; // Понедельник - Пятница
    
    expectedDays.forEach(day => {
      if (!daysWithItems.has(day)) {
        warnings.push(`Нет блюд для дня ${day}`);
      }
    });
    
    // Проверяем наличие блюд для каждого типа приема пищи
    const mealTypes = new Set(items.map(item => item.meal_type));
    const expectedMeals = ['завтрак', 'обед', 'полдник'];
    
    expectedMeals.forEach(meal => {
      if (!mealTypes.has(meal)) {
        warnings.push(`Нет блюд для приема пищи: ${meal}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      stats: {
        totalItems: items.length,
        daysCovered: daysWithItems.size,
        mealTypesCovered: mealTypes.size
      }
    };
  }
}
