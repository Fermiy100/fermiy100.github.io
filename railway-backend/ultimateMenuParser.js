/**
 * УЛЬТИМАТИВНЫЙ ПАРСЕР МЕНЮ - ИДЕАЛЬНО ДЛЯ ЭТОГО ТИПА ФАЙЛОВ
 * Специально разработан для структуры "2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА"
 */

import XLSX from 'xlsx';

class UltimateMenuParser {
  constructor() {
    console.log('🚀 Ультимативный парсер меню инициализирован');
    
    // Паттерны для дней недели
    this.dayPatterns = [
      ['понедельник', 'пн', 'monday', 'mon', '1'],
      ['вторник', 'вт', 'tuesday', 'tue', '2'],
      ['среда', 'ср', 'wednesday', 'wed', '3'],
      ['четверг', 'чт', 'thursday', 'thu', '4'],
      ['пятница', 'пт', 'friday', 'fri', '5'],
      ['суббота', 'сб', 'saturday', 'sat', '6'],
      ['воскресенье', 'вс', 'sunday', 'sun', '7']
    ];
    
    // Паттерны для приемов пищи
    this.mealPatterns = {
      'завтрак': ['завтрак', 'з а в т р а к', 'утром', 'утренний', 'утро', 'breakfast'],
      'обед': ['обед', 'о б е д', 'дневной', 'основной', 'день', 'lunch'],
      'полдник': ['полдник', 'п о л д н и к', 'перекус', 'дополнительный', 'доп', 'snack'],
      'ужин': ['ужин', 'у ж и н', 'вечерний', 'вечером', 'вечер', 'dinner']
    };
  }

  /**
   * Главный метод парсинга Excel файла
   */
  async parseExcelFile(fileBuffer) {
    try {
      console.log('📊 Начинаем ультимативный парсинг Excel файла');
      
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
      
      // Анализируем структуру файла
      const structure = this.analyzeFileStructure(data);
      console.log('📋 Структура файла:', structure);
      
      // Парсим меню на основе структуры
      const menuItems = this.parseBasedOnStructure(data, structure);
      
      console.log(`🎯 Ультимативный парсинг завершен! Найдено ${menuItems.length} блюд`);
      return menuItems;
      
    } catch (error) {
      console.error('❌ Ошибка ультимативного парсинга:', error);
      return [];
    }
  }

  /**
   * Анализ структуры файла
   */
  analyzeFileStructure(data) {
    console.log('🔍 Анализируем структуру файла...');
    
    const structure = {
      hasDayHeaders: false,
      hasMealHeaders: false,
      dayColumns: [],
      mealRows: [],
      dataStartRow: 0,
      dataEndRow: data.length - 1
    };
    
    // Ищем заголовки дней в первых 10 строках
    for (let row = 0; row < Math.min(10, data.length); row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim().toLowerCase();
        if (cellText.length < 2) continue;
        
        // Проверяем дни недели
        this.dayPatterns.forEach((patterns, dayIndex) => {
          if (patterns.some(pattern => cellText.includes(pattern))) {
            structure.dayColumns.push({
              day: dayIndex + 1,
              column: col,
              row: row,
              text: cell.toString().trim()
            });
            structure.hasDayHeaders = true;
            console.log(`✅ Найден день ${dayIndex + 1} в колонке ${col}, строка ${row}: "${cell.toString().trim()}"`);
          }
        });
      }
    }
    
    // Ищем заголовки приемов пищи
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim().toLowerCase();
        if (cellText.length < 3) continue;
        
        // Проверяем приемы пищи
        Object.entries(this.mealPatterns).forEach(([mealType, patterns]) => {
          if (patterns.some(pattern => cellText.includes(pattern))) {
            structure.mealRows.push({
              mealType: mealType,
              row: row,
              column: col,
              text: cell.toString().trim()
            });
            structure.hasMealHeaders = true;
            console.log(`✅ Найден ${mealType} в строке ${row}, колонка ${col}: "${cell.toString().trim()}"`);
          }
        });
      }
    }
    
    return structure;
  }

  /**
   * Парсинг на основе структуры
   */
  parseBasedOnStructure(data, structure) {
    console.log('🍽️ Парсим на основе структуры...');
    
    if (structure.hasDayHeaders && structure.hasMealHeaders) {
      console.log('📋 Структура: дни + приемы пищи');
      return this.parseDayAndMealStructure(data, structure);
    } else if (structure.hasDayHeaders) {
      console.log('📋 Структура: только дни');
      return this.parseDayOnlyStructure(data, structure);
    } else if (structure.hasMealHeaders) {
      console.log('📋 Структура: только приемы пищи');
      return this.parseMealOnlyStructure(data, structure);
    } else {
      console.log('📋 Структура: неопределенная, используем универсальный парсинг');
      return this.parseUniversalStructure(data);
    }
  }

  /**
   * Парсинг структуры "дни + приемы пищи"
   */
  parseDayAndMealStructure(data, structure) {
    const items = [];
    
    structure.dayColumns.forEach(dayCol => {
      console.log(`🔍 Парсим день ${dayCol.day} в колонке ${dayCol.column}`);
      
      // Ищем приемы пищи для этого дня
      const mealSections = this.findMealSectionsForDay(data, dayCol.column, dayCol.row);
      
      mealSections.forEach(section => {
        const mealItems = this.extractDishesFromSection(
          data, 
          dayCol.column, 
          section.startRow, 
          section.endRow, 
          dayCol.day, 
          section.mealType
        );
        items.push(...mealItems);
        console.log(`✅ Добавлено ${mealItems.length} блюд для ${section.mealType}`);
      });
    });
    
    return this.removeDuplicates(items);
  }

  /**
   * Парсинг структуры "только дни"
   */
  parseDayOnlyStructure(data, structure) {
    const items = [];
    
    structure.dayColumns.forEach(dayCol => {
      console.log(`🔍 Парсим день ${dayCol.day} в колонке ${dayCol.column}`);
      
      // Парсим все блюда в колонке как обед
      const dayItems = this.extractAllDishesFromColumn(data, dayCol.column, dayCol.day, 'обед');
      items.push(...dayItems);
      console.log(`✅ Добавлено ${dayItems.length} блюд для дня ${dayCol.day}`);
    });
    
    return this.removeDuplicates(items);
  }

  /**
   * Парсинг структуры "только приемы пищи"
   */
  parseMealOnlyStructure(data, structure) {
    const items = [];
    
    structure.mealRows.forEach(mealRow => {
      console.log(`🔍 Парсим ${mealRow.mealType} в строке ${mealRow.row}`);
      
      // Парсим все блюда в строке
      const mealItems = this.extractAllDishesFromRow(data, mealRow.row, 1, mealRow.mealType);
      items.push(...mealItems);
      console.log(`✅ Добавлено ${mealItems.length} блюд для ${mealRow.mealType}`);
    });
    
    return this.removeDuplicates(items);
  }

  /**
   * Универсальный парсинг
   */
  parseUniversalStructure(data) {
    console.log('🌐 Универсальный парсинг - берем все что похоже на блюда');
    const items = [];
    
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim();
        if (cellText.length < 3) continue;
        
        // Пропускаем заголовки
        if (this.isHeader(cellText)) continue;
        
        // Создаем блюдо
        const dish = this.createUltimateDish(cellText, row, col);
        if (dish) {
          items.push(dish);
        }
      }
    }
    
    return this.removeDuplicates(items);
  }

  /**
   * Поиск секций приемов пищи для дня
   */
  findMealSectionsForDay(data, colIndex, startRow) {
    const sections = [];
    let currentSection = null;
    
    for (let row = startRow; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData || !rowData[colIndex]) continue;
      
      const cell = rowData[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.toString().trim().toLowerCase();
      if (!cellText) continue;
      
      // Определяем тип приема пищи
      let mealType = null;
      Object.entries(this.mealPatterns).forEach(([type, patterns]) => {
        if (patterns.some(pattern => cellText.includes(pattern))) {
          mealType = type;
        }
      });
      
      if (mealType) {
        // Завершаем предыдущую секцию
        if (currentSection) {
          currentSection.endRow = row - 1;
          sections.push(currentSection);
        }
        
        // Начинаем новую секцию
        currentSection = {
          mealType: mealType,
          startRow: row + 1,
          endRow: data.length - 1
        };
      }
    }
    
    // Добавляем последнюю секцию
    if (currentSection) {
      sections.push(currentSection);
    }
    
    return sections;
  }

  /**
   * Извлечение блюд из секции
   */
  extractDishesFromSection(data, colIndex, startRow, endRow, dayOfWeek, mealType) {
    const items = [];
    
    for (let row = startRow; row <= endRow; row++) {
      const rowData = data[row];
      if (!rowData || !rowData[colIndex]) continue;
      
      const cell = rowData[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.toString().trim();
      if (cellText.length < 3) continue;
      
      // Проверяем, не является ли это заголовком другого приема пищи
      if (this.isMealHeader(cellText)) break;
      
      const dish = this.createUltimateDish(cellText, row, colIndex, dayOfWeek, mealType);
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
   * Извлечение всех блюд из колонки
   */
  extractAllDishesFromColumn(data, colIndex, dayOfWeek, mealType) {
    const items = [];
    
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData || !rowData[colIndex]) continue;
      
      const cell = rowData[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.toString().trim();
      if (cellText.length < 3) continue;
      
      // Пропускаем заголовки
      if (this.isHeader(cellText)) continue;
      
      const dish = this.createUltimateDish(cellText, row, colIndex, dayOfWeek, mealType);
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
   * Извлечение всех блюд из строки
   */
  extractAllDishesFromRow(data, rowIndex, dayOfWeek, mealType) {
    const items = [];
    const rowData = data[rowIndex];
    if (!rowData) return items;
    
    for (let col = 0; col < rowData.length; col++) {
      const cell = rowData[col];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.toString().trim();
      if (cellText.length < 3) continue;
      
      // Пропускаем заголовки
      if (this.isHeader(cellText)) continue;
      
      const dish = this.createUltimateDish(cellText, rowIndex, col, dayOfWeek, mealType);
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
   * Создание ультимативного блюда
   */
  createUltimateDish(text, row, col, dayOfWeek = null, mealType = null) {
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
      return this.createSauceDishes(cleanName, dayOfWeek || this.getDayFromPosition(col), mealType || 'обед');
    }
    
    const dish = {
      name: cleanName,
      description: description,
      price: 0,
      portion: portion,
      day_of_week: dayOfWeek || this.getDayFromPosition(col),
      meal_type: mealType || this.getMealTypeFromText(text),
      school_id: 1,
      week_start: new Date().toISOString().split('T')[0],
      recipe_number: recipeNumber,
      weight: weight
    };
    
    console.log(`🍽️ Создано ультимативное блюдо: "${cleanName}" (${dish.meal_type}, день ${dish.day_of_week})`);
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
    if (this.isHeader(clean)) return null;
    
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
        const dish = this.createUltimateDish(cleanSauce, 0, 0, dayOfWeek, mealType);
        if (dish) {
          dishes.push(dish);
        }
      }
    });
    
    return dishes;
  }

  /**
   * Определение дня недели по позиции
   */
  getDayFromPosition(col) {
    const days = [1, 2, 3, 4, 5, 6, 7];
    return days[col % 7] || 1;
  }

  /**
   * Определение типа приема пищи по тексту
   */
  getMealTypeFromText(text) {
    const lowerText = text.toLowerCase();
    
    Object.entries(this.mealPatterns).forEach(([mealType, patterns]) => {
      if (patterns.some(pattern => lowerText.includes(pattern))) {
        return mealType;
      }
    });
    
    return 'обед'; // По умолчанию
  }

  /**
   * Проверка, является ли заголовком
   */
  isHeader(text) {
    const lowerText = text.toLowerCase();
    
    // Проверяем дни недели
    if (this.dayPatterns.some(patterns => patterns.some(pattern => lowerText.includes(pattern)))) {
      return true;
    }
    
    // Проверяем приемы пищи
    if (Object.values(this.mealPatterns).some(patterns => patterns.some(pattern => lowerText.includes(pattern)))) {
      return true;
    }
    
    return false;
  }

  /**
   * Проверка, является ли заголовком приема пищи
   */
  isMealHeader(text) {
    const lowerText = text.toLowerCase();
    return Object.values(this.mealPatterns).some(patterns => 
      patterns.some(pattern => lowerText.includes(pattern))
    );
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

export default UltimateMenuParser;