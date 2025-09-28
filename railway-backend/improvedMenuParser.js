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
    this.breakfastKeywords = ['завтрак', 'утром', 'утренний', 'утро', 'з а в т р а к', 'завтрак'];
    this.lunchKeywords = ['обед', 'дневной', 'основной', 'день', 'о б е д', 'обед'];
    this.snackKeywords = ['полдник', 'перекус', 'дополнительный', 'доп', 'дополнительный гарнир'];
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
      
      // Проверяем буфер
      if (!buffer || buffer.length === 0) {
        console.error('❌ Файл пустой или поврежден');
        return [];
      }
      
      // Читаем Excel файл
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      
      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        console.error('❌ В Excel файле нет листов');
        return [];
      }
      
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        console.error(`❌ Лист "${sheetName}" не найден`);
        return [];
      }
      
      // Конвертируем в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      
      console.log(`📊 Загружен лист: ${sheetName}`);
      console.log(`📏 Размер данных: ${jsonData.length} строк`);
      
      // Пробуем разные стратегии парсинга
      let items = [];
      
      // Стратегия 1: Стандартная структура с днями и приемами пищи
      try {
        items = this.parseStandardStructure(jsonData);
        if (items.length > 0) {
          console.log(`✅ Стандартная структура: найдено ${items.length} блюд`);
          return items;
        }
      } catch (error) {
        console.log(`⚠️ Стандартная структура не сработала: ${error.message}`);
      }
      
      // Стратегия 2: Простой список блюд
      try {
        items = this.parseSimpleList(jsonData);
        if (items.length > 0) {
          console.log(`✅ Простой список: найдено ${items.length} блюд`);
          return items;
        }
      } catch (error) {
        console.log(`⚠️ Простой список не сработал: ${error.message}`);
      }
      
      // Стратегия 3: Поиск по ключевым словам
      try {
        items = this.parseByKeywords(jsonData);
        if (items.length > 0) {
          console.log(`✅ Поиск по ключевым словам: найдено ${items.length} блюд`);
          return items;
        }
      } catch (error) {
        console.log(`⚠️ Поиск по ключевым словам не сработал: ${error.message}`);
      }
      
      // Стратегия 4: Универсальный парсинг
      try {
        items = this.parseUniversal(jsonData);
        console.log(`✅ Универсальный парсинг: найдено ${items.length} блюд`);
        return items;
      } catch (error) {
        console.log(`⚠️ Универсальный парсинг не сработал: ${error.message}`);
        return [];
      }
      
    } catch (error) {
      console.error('❌ Ошибка парсинга:', error);
      return [];
    }
  }

  /**
   * Парсинг стандартной структуры (дни + приемы пищи) - ИСПРАВЛЕННАЯ ВЕРСИЯ
   */
  parseStandardStructure(data) {
    const items = [];
    
    // Ищем заголовки дней недели
    const dayColumns = this.findDayColumns(data);
    if (dayColumns.length === 0) return items;
    
    console.log(`📅 Найдено дней: ${dayColumns.length}`);
    
    // Для каждого дня парсим блюда по приемам пищи
    dayColumns.forEach(dayCol => {
      console.log(`🔍 Парсим день ${dayCol.day} в колонке ${dayCol.column}`);
      
      // Ищем все приемы пищи для этого дня
      const mealSections = this.findMealSectionsForDay(data, dayCol.column);
      console.log(`🍽️ Найдено приемов пищи для дня ${dayCol.day}:`, mealSections.map(s => s.mealType));
      
      // Если не найдено приемов пищи, парсим все как обед
      if (mealSections.length === 0) {
        console.log(`⚠️ Приемы пищи не найдены для дня ${dayCol.day}, парсим все как обед`);
        const allItems = this.extractDishesFromSection(
          data, 
          dayCol.column, 
          0, 
          data.length - 1, 
          dayCol.day, 
          'обед'
        );
        items.push(...allItems);
        console.log(`✅ Добавлено ${allItems.length} блюд как обед`);
      } else {
        // Парсим блюда для каждого приема пищи
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
      }
    });
    
    // Удаляем дубликаты
    const uniqueItems = this.removeDuplicates(items);
    
    console.log(`✅ Парсинг завершен. Найдено ${uniqueItems.length} уникальных блюд`);
    return uniqueItems;
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
        
        // Дополнительная проверка для "О Б Е Д" с пробелами
        if (cellText.includes('о б е д') || cellText.includes('обед')) {
          mealType = 'обед';
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
   * Поиск секций приемов пищи для конкретного дня - ИСПРАВЛЕННАЯ ВЕРСИЯ
   */
  findMealSectionsForDay(data, colIndex) {
    const sections = [];
    const mealHeaders = [];
    
    console.log(`🔍 Ищем приемы пищи в колонке ${colIndex}`);
    
    // Сначала находим все заголовки приемов пищи
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row || !row[colIndex]) continue;
      
      const cell = row[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.trim();
      if (!cellText || cellText.length < 3) continue;
      
      // Проверяем все возможные варианты написания
      const lowerText = cellText.toLowerCase();
      
      // Завтрак
      if (this.isMealType(lowerText, 'завтрак')) {
        mealHeaders.push({ row: rowIndex, type: 'завтрак', text: cellText });
        console.log(`✅ Найден ЗАВТРАК в строке ${rowIndex}: "${cellText}"`);
      }
      // Обед
      else if (this.isMealType(lowerText, 'обед')) {
        mealHeaders.push({ row: rowIndex, type: 'обед', text: cellText });
        console.log(`✅ Найден ОБЕД в строке ${rowIndex}: "${cellText}"`);
      }
      // Полдник
      else if (this.isMealType(lowerText, 'полдник')) {
        mealHeaders.push({ row: rowIndex, type: 'полдник', text: cellText });
        console.log(`✅ Найден ПОЛДНИК в строке ${rowIndex}: "${cellText}"`);
      }
      // Ужин
      else if (this.isMealType(lowerText, 'ужин')) {
        mealHeaders.push({ row: rowIndex, type: 'ужин', text: cellText });
        console.log(`✅ Найден УЖИН в строке ${rowIndex}: "${cellText}"`);
      }
    }
    
    console.log(`📊 Найдено ${mealHeaders.length} приемов пищи:`, mealHeaders.map(h => `${h.type} (строка ${h.row})`));
    
    // Создаем секции на основе найденных заголовков
    for (let i = 0; i < mealHeaders.length; i++) {
      const currentHeader = mealHeaders[i];
      const nextHeader = mealHeaders[i + 1];
      
      const section = {
        mealType: currentHeader.type,
        startRow: currentHeader.row + 1,
        endRow: nextHeader ? nextHeader.row - 1 : data.length - 1
      };
      
      sections.push(section);
      console.log(`📋 Секция ${section.mealType}: строки ${section.startRow}-${section.endRow}`);
    }
    
    return sections;
  }

  /**
   * Проверка является ли текст заголовком приема пищи
   */
  isMealType(text, mealType) {
    const keywords = {
      'завтрак': ['завтрак', 'з а в т р а к', 'утром', 'утренний', 'утро'],
      'обед': ['обед', 'о б е д', 'дневной', 'основной', 'день'],
      'полдник': ['полдник', 'п о л д н и к', 'перекус', 'дополнительный', 'доп'],
      'ужин': ['ужин', 'у ж и н', 'вечерний', 'вечером', 'вечер']
    };
    
    return keywords[mealType].some(keyword => text.includes(keyword));
  }

  /**
   * Извлечение блюд из секции приема пищи
   */
  extractDishesFromSection(data, colIndex, startRow, endRow, dayOfWeek, mealType) {
    const items = [];
    
    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
      const row = data[rowIndex];
      if (!row || !row[colIndex]) continue;
      
      const cell = row[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.trim();
      if (!cellText || cellText.length < 3) continue;
      
      // Проверяем, не является ли это заголовком другого приема пищи
      if (this.isMealHeader(cellText)) {
        break; // Завершаем парсинг этой секции
      }
      
      const dish = this.createDish(cellText, dayOfWeek, mealType, cell);
      if (dish) {
        // Если это массив блюд (соусы), добавляем все
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
   * Извлечение блюд из определенной области (старый метод для совместимости)
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
      if (this.isMealHeader(cellText)) {
        // Если нашли заголовок "О Б Е Д", меняем тип приема пищи на обед
        if (cellText.toLowerCase().includes('о б е д') || cellText.toLowerCase().includes('обед')) {
          mealType = 'обед';
        }
        break;
      }
      
      const dish = this.createDish(cellText, dayOfWeek, mealType, cell);
      if (dish) {
        // Если это массив блюд (соусы), добавляем все
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
   * Извлечение блюд обеда после заголовка "О Б Е Д"
   */
  extractLunchDishes(data, colIndex, dayOfWeek) {
    const items = [];
    
    console.log(`🔍 Ищем "О Б Е Д" в колонке ${colIndex} для дня ${dayOfWeek}`);
    
    // Ищем строку с "О Б Е Д" (заглавными буквами)
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row || !row[colIndex]) continue;
      
      const cell = row[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      const cellText = cell.trim();
      
      // Отладочная информация
      if (cellText.toLowerCase().includes('обед') || cellText.includes('О  Б  Е  Д')) {
        console.log(`  Проверяем строку ${rowIndex}: "${cell}"`);
      }
      
      // Если нашли "О Б Е Д" (заглавными буквами)
      if (cellText === 'О  Б  Е  Д  ' || cellText.includes('О  Б  Е  Д') || cellText.toLowerCase().includes('обед')) {
        console.log(`🍽️ Найден обед для дня ${dayOfWeek} в строке ${rowIndex}: "${cell}"`);
        
        // Парсим следующие 15 строк как блюда обеда
        for (let i = rowIndex + 1; i < Math.min(rowIndex + 15, data.length); i++) {
          const lunchRow = data[i];
          if (!lunchRow || !lunchRow[colIndex]) continue;
          
          const lunchCell = lunchRow[colIndex];
          if (!lunchCell || typeof lunchCell !== 'string') continue;
          
          const lunchText = lunchCell.trim();
          if (!lunchText || lunchText.length < 3) continue;
          
          // Проверяем, не является ли это заголовком другого приема пищи
          if (this.isMealHeader(lunchText)) break;
          
          const dish = this.createDish(lunchText, dayOfWeek, 'обед', lunchCell);
          if (dish) {
            if (Array.isArray(dish)) {
              items.push(...dish);
            } else {
              items.push(dish);
            }
          }
        }
        break;
      }
    }
    
    console.log(`  Найдено блюд обеда: ${items.length}`);
    return items;
  }

  /**
   * Извлечение блюд обеда из всех колонок
   */
  extractLunchFromAllColumns(data, items, dayColumns) {
    console.log('🔍 Ищем "О Б Е Д" во всех колонках...');
    
    // Ищем строку с "О Б Е Д" во всех колонках
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.trim();
        
        // Отладочная информация для строки 18
        if (rowIndex === 17) { // строка 18 (индекс 17)
          console.log(`  Строка 18, колонка ${colIndex}: "${cell}"`);
          console.log(`  cellText: "${cellText}"`);
          console.log(`  cellText.length: ${cellText.length}`);
          console.log(`  cellText.charCodeAt(0): ${cellText.charCodeAt(0)}`);
          console.log(`  cellText.charCodeAt(1): ${cellText.charCodeAt(1)}`);
          console.log(`  cellText.charCodeAt(2): ${cellText.charCodeAt(2)}`);
          console.log(`  cellText.charCodeAt(3): ${cellText.charCodeAt(3)}`);
          console.log(`  cellText.charCodeAt(4): ${cellText.charCodeAt(4)}`);
          console.log(`  cellText.charCodeAt(5): ${cellText.charCodeAt(5)}`);
          console.log(`  cellText.charCodeAt(6): ${cellText.charCodeAt(6)}`);
          console.log(`  cellText.charCodeAt(7): ${cellText.charCodeAt(7)}`);
          console.log(`  cellText.charCodeAt(8): ${cellText.charCodeAt(8)}`);
          console.log(`  cellText.charCodeAt(9): ${cellText.charCodeAt(9)}`);
          console.log(`  === 'О  Б  Е  Д': ${cellText === 'О  Б  Е  Д'}`);
          console.log(`  includes('О  Б  Е  Д'): ${cellText.includes('О  Б  Е  Д')}`);
          console.log(`  toLowerCase().includes('обед'): ${cellText.toLowerCase().includes('обед')}`);
        }
        
        // Если нашли "О Б Е Д" (с неразрывными пробелами)
        if (cellText.includes('О') && cellText.includes('Б') && cellText.includes('Е') && cellText.includes('Д') && cellText.length <= 15) {
          console.log(`🍽️ Найден "О Б Е Д" в строке ${rowIndex + 1}, колонке ${colIndex}: "${cell}"`);
          
          // Определяем день недели по колонке
          const dayCol = dayColumns.find(dc => dc.column === colIndex);
          if (!dayCol) {
            console.log(`  Колонка ${colIndex} не найдена в днях недели`);
            continue;
          }
          
          console.log(`  Обрабатываем день ${dayCol.day} (колонка ${colIndex})`);
          
          // Парсим следующие 15 строк как блюда обеда
          for (let i = rowIndex + 1; i < Math.min(rowIndex + 15, data.length); i++) {
            const lunchRow = data[i];
            if (!lunchRow || !lunchRow[colIndex]) continue;
            
            const lunchCell = lunchRow[colIndex];
            if (!lunchCell || typeof lunchCell !== 'string') continue;
            
            const lunchText = lunchCell.trim();
            if (!lunchText || lunchText.length < 3) continue;
            
            // Проверяем, не является ли это заголовком другого приема пищи
            if (this.isMealHeader(lunchText)) break;
            
            const dish = this.createDish(lunchText, dayCol.day, 'обед', lunchCell);
            if (dish) {
              if (Array.isArray(dish)) {
                items.push(...dish);
              } else {
                items.push(dish);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Создание блюда
   */
  createDish(text, dayOfWeek, mealType, originalText) {
    // Обрабатываем сложные соусы - разбиваем на отдельные блюда
    if (text.includes('Соусы:') && text.includes(';')) {
      return this.createSauceDishes(text, dayOfWeek, mealType, originalText);
    }
    
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
   * Создание отдельных блюд из сложных соусов
   */
  createSauceDishes(text, dayOfWeek, mealType, originalText) {
    const dishes = [];
    
    // Извлекаем соусы из текста
    const sauceText = text.replace('Соусы:', '').trim();
    const sauces = sauceText.split(';').map(s => s.trim()).filter(s => s.length > 0);
    
    sauces.forEach(sauce => {
      const cleanName = this.cleanDishName(sauce);
      if (cleanName && cleanName.length >= 3) {
        const weight = this.extractWeight(sauce);
        const recipeNumber = this.extractRecipeNumber(sauce);
        
        dishes.push({
          name: cleanName,
          description: this.generateDescription(cleanName, recipeNumber),
          price: 0,
          portion: weight || this.generatePortion(cleanName),
          day_of_week: Math.min(Math.max(dayOfWeek, 1), 7),
          meal_type: mealType || 'обед',
          school_id: 1,
          week_start: new Date().toISOString().split('T')[0],
          recipe_number: recipeNumber,
          weight: weight
        });
      }
    });
    
    return dishes;
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
      'з а в т р а к', 'о б е д', 'п о л д н и к', 'у ж и н',
      'понедельник', 'вторник', 'среда', 'четверг', 'пятница',
      'суббота', 'воскресенье', 'день', 'неделя',
      'дополнительный гарнир', 'количество порций'
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
    return this.isMealType(lowerText, 'завтрак') ||
           this.isMealType(lowerText, 'обед') ||
           this.isMealType(lowerText, 'полдник') ||
           this.isMealType(lowerText, 'ужин');
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
   * Исправление типов приемов пищи
   */
  fixMealTypes(data, items) {
    // Ищем строки с "О Б Е Д" и исправляем типы приемов пищи
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row) continue;
      
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.trim();
        
        // Если нашли "О Б Е Д", исправляем все блюда после этой строки
        if (cellText === 'О  Б  Е  Д  ' || cellText.includes('О  Б  Е  Д') || cellText.toLowerCase().includes('обед')) {
          console.log(`🍽️ Исправляем типы приемов пищи после "О Б Е Д" в строке ${rowIndex}, колонке ${colIndex}`);
          
          // Определяем день недели по колонке
          const dayOfWeek = this.determineDayByPosition(colIndex, data);
          
          // Исправляем все блюда этого дня, которые находятся после строки с "О Б Е Д"
          items.forEach(item => {
            if (item.day_of_week === dayOfWeek && item.meal_type === 'полдник') {
              // Проверяем, находится ли это блюдо после "О Б Е Д"
              const itemRow = this.findItemRow(data, item.name, colIndex);
              if (itemRow > rowIndex) {
                item.meal_type = 'обед';
                console.log(`  ✅ ${item.name} → обед`);
              }
            }
          });
        }
      }
    }
  }

  /**
   * Поиск строки с блюдом
   */
  findItemRow(data, itemName, colIndex) {
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      if (!row || !row[colIndex]) continue;
      
      const cell = row[colIndex];
      if (!cell || typeof cell !== 'string') continue;
      
      if (cell.includes(itemName)) {
        return rowIndex;
      }
    }
    return -1;
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
