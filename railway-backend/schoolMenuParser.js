/**
 * ШКОЛЬНЫЙ ПАРСЕР МЕНЮ
 * Специализированный парсер для структуры школьного меню
 * Обрабатывает таблицы с днями недели и типами приемов пищи
 */

import XLSX from 'xlsx';

export class SchoolMenuParser {
  constructor() {
    // Паттерны для извлечения данных
    this.weightPattern = /\d+\s*г/gi;
    this.recipePattern = /№\s*(\d+\/\d+)/gi;
    this.portionPattern = /\d+\s*шт/gi;
    
    // Словари для определения типов приемов пищи
    this.breakfastKeywords = ['завтрак', 'утром', 'утренний'];
    this.lunchKeywords = ['обед', 'дневной', 'основной'];
    this.snackKeywords = ['полдник', 'перекус', 'дополнительный'];
    this.dinnerKeywords = ['ужин', 'вечерний', 'вечером'];
    
    // Дни недели
    this.daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
  }

  /**
   * Основной метод парсинга Excel файла
   */
  parseExcelFile(buffer) {
    try {
      console.log('🔍 Начинаем парсинг Excel файла...');
      
      // Читаем Excel файл
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Конвертируем в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`📊 Загружен лист: ${sheetName}`);
      console.log(`📏 Размер данных: ${jsonData.length} строк`);
      
      // Анализируем структуру
      const structure = this.analyzeStructure(jsonData);
      console.log('🏗️ Структура таблицы:', structure);
      
      // Парсим блюда
      const items = this.parseMenuItems(jsonData, structure);
      
      console.log(`✅ Парсинг завершен. Найдено ${items.length} блюд`);
      return items;
      
    } catch (error) {
      console.error('❌ Ошибка парсинга:', error);
      throw new Error(`Ошибка парсинга Excel файла: ${error.message}`);
    }
  }

  /**
   * Анализ структуры таблицы
   */
  analyzeStructure(data) {
    const structure = {
      dayColumns: [],
      mealRows: [],
      dataStartRow: 0,
      dataStartCol: 0
    };
    
    // Ищем заголовки дней недели
    for (let rowIndex = 0; rowIndex < Math.min(10, data.length); rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toLowerCase().trim();
        
        // Ищем дни недели
        this.daysOfWeek.forEach((day, dayIndex) => {
          if (cellText.includes(day)) {
            structure.dayColumns.push({
              day: dayIndex + 1,
              column: colIndex,
              name: day
            });
          }
        });
      }
    }
    
    // Ищем строки с типами приемов пищи
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
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
          structure.mealRows.push({
            meal: mealType,
            row: rowIndex,
            name: cellText
          });
        }
      }
    }
    
    // Определяем начало данных
    if (structure.dayColumns.length > 0 && structure.mealRows.length > 0) {
      structure.dataStartRow = Math.min(...structure.mealRows.map(m => m.row)) + 1;
      structure.dataStartCol = Math.min(...structure.dayColumns.map(d => d.column));
    }
    
    return structure;
  }

  /**
   * Парсинг блюд из данных
   */
  parseMenuItems(data, structure) {
    const items = [];
    
    if (!structure.dayColumns.length || !structure.mealRows.length) {
      console.log('⚠️ Не удалось определить структуру таблицы');
      return items;
    }
    
    console.log('🍽️ Парсим блюда...');
    
    // Проходим по каждому дню
    structure.dayColumns.forEach(dayCol => {
      console.log(`📅 Обрабатываем ${dayCol.name} (колонка ${dayCol.column})`);
      
      // Проходим по каждому типу приема пищи
      structure.mealRows.forEach(mealRow => {
        console.log(`  🍴 ${mealRow.meal} (строка ${mealRow.row})`);
        
        // Ищем блюда в этой области
        const mealItems = this.findDishesInArea(
          data, 
          dayCol.column, 
          mealRow.row + 1, 
          dayCol.day, 
          mealRow.meal
        );
        
        items.push(...mealItems);
        console.log(`    ✅ Найдено ${mealItems.length} блюд`);
      });
    });
    
    return items;
  }

  /**
   * Поиск блюд в определенной области
   */
  findDishesInArea(data, colIndex, startRow, dayOfWeek, mealType) {
    const items = [];
    
    // Ищем в следующих 10 строках после заголовка приема пищи
    for (let rowIndex = startRow; rowIndex < Math.min(startRow + 10, data.length); rowIndex++) {
      const row = data[rowIndex];
      if (!row || !row[colIndex]) continue;
      
      const cell = row[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.trim();
      if (!cellText || cellText.length < 3) continue;
      
      // Создаем блюдо
      const dish = this.createDishFromCell(cellText, rowIndex, colIndex, dayOfWeek, mealType);
      if (dish) {
        items.push(dish);
        console.log(`   ✅ ${dish.name} (${dish.meal_type}, день ${dish.day_of_week})`);
      }
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
   * Валидация распарсенного меню
   */
  validateParsedMenu(items) {
    const errors = [];
    const warnings = [];
    
    if (!items || items.length === 0) {
      errors.push('Меню пустое - не найдено ни одного блюда');
      return { isValid: false, errors, warnings };
    }
    
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
    
    // Проверяем качество названий блюд
    items.forEach((item, index) => {
      if (!item.name || item.name.length < 3) {
        errors.push(`Блюдо ${index + 1}: некорректное название`);
      }
      
      if (item.name && item.name.length > 100) {
        warnings.push(`Блюдо "${item.name}": слишком длинное название`);
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