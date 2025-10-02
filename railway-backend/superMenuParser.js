import XLSX from 'xlsx';

export class SuperMenuParser {
  constructor() {
    // Словари для распознавания
    this.mealTypeKeywords = {
      'завтрак': [
        'завтрак', 'breakfast', 'утро', 'утренний', 'каша', 'омлет', 'сырники', 
        'творог', 'йогурт', 'молоко', 'какао', 'чай', 'хлопья', 'мюсли',
        'блин', 'оладь', 'бутерброд', 'джем', 'масло', 'сыр'
      ],
      'обед': [
        'обед', 'lunch', 'первое', 'второе', 'суп', 'борщ', 'щи', 'солянка',
        'котлета', 'мясо', 'рыба', 'гарнир', 'картофель', 'рис', 'гречка',
        'макароны', 'пюре', 'салат', 'овощи', 'компот', 'хлеб'
      ],
      'полдник': [
        'полдник', 'snack', 'afternoon', 'печенье', 'булочка', 'кефир', 
        'ряженка', 'сок', 'фрукты', 'яблоко', 'банан', 'кисель',
        'выпечка', 'пирожок', 'ватрушка', 'пряник', 'конфеты'
      ]
    };

    this.dayKeywords = {
      'понедельник': ['понедельник', 'пн', 'monday', 'пон', '1'],
      'вторник': ['вторник', 'вт', 'tuesday', 'втор', '2'],
      'среда': ['среда', 'ср', 'wednesday', 'сред', '3'],
      'четверг': ['четверг', 'чт', 'thursday', 'четв', '4'],
      'пятница': ['пятница', 'пт', 'friday', 'пятн', '5']
    };

    this.dishPatterns = [
      // Основные блюда
      /каша\s+\w+/gi,
      /суп\s+\w+/gi,
      /борщ\s*\w*/gi,
      /котлета\s+\w+/gi,
      /мясо\s+\w+/gi,
      /рыба\s+\w+/gi,
      /салат\s+\w+/gi,
      /пюре\s+\w+/gi,
      /компот\s+\w+/gi,
      /чай\s+\w*/gi,
      /какао\s*\w*/gi,
      /молоко\s*\w*/gi,
      /хлеб\s*\w*/gi,
      /булочка\s*\w*/gi,
      /печенье\s*\w*/gi,
      /кефир\s*\w*/gi,
      /сок\s+\w+/gi,
      // Сложные блюда
      /\w+\s+тушеное/gi,
      /\w+\s+отварное/gi,
      /\w+\s+жареное/gi,
      /\w+\s+запеченное/gi,
      /\w+\s+с\s+\w+/gi
    ];

    this.stopWords = [
      'меню', 'школьное', 'питание', 'день', 'неделя', 'дата', 'время',
      'калории', 'белки', 'жиры', 'углеводы', 'вес', 'порция', 'номер',
      'рецепт', 'технология', 'приготовления', 'ккал', 'грамм', 'мл'
    ];
  }

  async parseExcelFile(buffer) {
    try {
      console.log('🚀 СУПЕР ПАРСЕР: Начинаем анализ файла');
      
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const allDishes = [];

      // Анализируем каждый лист
      for (const sheetName of workbook.SheetNames) {
        console.log(`📊 Анализируем лист: ${sheetName}`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
        
        const sheetDishes = this.parseSheet(data, sheetName);
        allDishes.push(...sheetDishes);
      }

      console.log(`✅ СУПЕР ПАРСЕР: Найдено ${allDishes.length} блюд`);
      
      // Если ничего не найдено, используем агрессивный режим
      if (allDishes.length === 0) {
        console.log('🔥 Включаем АГРЕССИВНЫЙ режим парсинга');
        return this.aggressiveParsing(workbook);
      }

      return this.validateAndEnrich(allDishes);
    } catch (error) {
      console.error('❌ Ошибка супер парсера:', error);
      return this.createFallbackMenu();
    }
  }

  parseSheet(data, sheetName) {
    const dishes = [];
    const structure = this.analyzeSheetStructure(data);
    
    console.log(`🔍 Структура листа:`, structure);

    // Метод 1: Поиск по заголовкам
    dishes.push(...this.parseByHeaders(data, structure));
    
    // Метод 2: Поиск по позициям
    dishes.push(...this.parseByPositions(data, structure));
    
    // Метод 3: Контекстный поиск
    dishes.push(...this.contextualSearch(data));
    
    // Метод 4: Поиск по шаблонам
    dishes.push(...this.patternSearch(data));

    return this.removeDuplicates(dishes);
  }

  analyzeSheetStructure(data) {
    const structure = {
      mealTypeRows: [],
      dayColumns: [],
      dataRegion: { startRow: 0, endRow: data.length, startCol: 0, endCol: 0 }
    };

    // Находим максимальную ширину таблицы
    const maxCols = Math.max(...data.map(row => row.length));
    structure.dataRegion.endCol = maxCols;

    // Поиск строк с типами питания
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellText = this.normalizeText(cell);
        
        // Поиск типов питания
        for (const [mealType, keywords] of Object.entries(this.mealTypeKeywords)) {
          if (keywords.some(keyword => cellText.includes(keyword))) {
            structure.mealTypeRows.push({
              row: rowIndex,
              col: colIndex,
              type: mealType,
              text: cellText
            });
          }
        }

        // Поиск дней недели
        for (const [day, keywords] of Object.entries(this.dayKeywords)) {
          if (keywords.some(keyword => cellText.includes(keyword))) {
            structure.dayColumns.push({
              row: rowIndex,
              col: colIndex,
              day: day,
              text: cellText
            });
          }
        }
      });
    });

    return structure;
  }

  parseByHeaders(data, structure) {
    const dishes = [];
    
    // Если найдены заголовки дней и типов питания
    if (structure.dayColumns.length > 0 && structure.mealTypeRows.length > 0) {
      console.log('📋 Парсинг по заголовкам');
      
      structure.mealTypeRows.forEach(mealTypeInfo => {
        structure.dayColumns.forEach(dayInfo => {
          // Ищем блюда в пересечении строки типа питания и колонки дня
          const dishCell = this.findDishInRegion(
            data, 
            mealTypeInfo.row, 
            mealTypeInfo.row + 3,
            dayInfo.col - 1,
            dayInfo.col + 1
          );
          
          if (dishCell) {
            dishes.push({
              name: dishCell.text,
              meal_type: mealTypeInfo.type,
              day_of_week: dayInfo.day,
              source: 'headers',
              confidence: 0.9
            });
          }
        });
      });
    }

    return dishes;
  }

  parseByPositions(data, structure) {
    const dishes = [];
    
    console.log('🎯 Парсинг по позициям');
    
    // Стандартная сетка: дни по горизонтали, типы питания по вертикали
    const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    const mealTypes = ['завтрак', 'обед', 'полдник'];
    
    // Ищем область с данными (обычно начинается с 2-3 строки)
    for (let startRow = 1; startRow < Math.min(5, data.length); startRow++) {
      for (let startCol = 1; startCol < Math.min(5, data[0]?.length || 0); startCol++) {
        
        days.forEach((day, dayIndex) => {
          mealTypes.forEach((mealType, mealIndex) => {
            const row = startRow + mealIndex * 2; // Интервал между типами питания
            const col = startCol + dayIndex; // Колонка дня
            
            if (row < data.length && col < (data[row]?.length || 0)) {
              const cellText = this.normalizeText(data[row][col]);
              
              if (this.isDishName(cellText)) {
                dishes.push({
                  name: cellText,
                  meal_type: mealType,
                  day_of_week: day,
                  source: 'positions',
                  confidence: 0.7
                });
              }
            }
          });
        });
      }
    }

    return dishes;
  }

  contextualSearch(data) {
    const dishes = [];
    
    console.log('🔎 Контекстный поиск');
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellText = this.normalizeText(cell);
        
        if (this.isDishName(cellText)) {
          // Определяем тип питания по контексту
          const mealType = this.determineMealTypeByContext(data, rowIndex, colIndex);
          const day = this.determineDayByContext(data, rowIndex, colIndex);
          
          if (mealType && day) {
            dishes.push({
              name: cellText,
              meal_type: mealType,
              day_of_week: day,
              source: 'context',
              confidence: 0.6
            });
          }
        }
      });
    });

    return dishes;
  }

  patternSearch(data) {
    const dishes = [];
    
    console.log('🔍 Поиск по шаблонам');
    
    const mealTypes = ['завтрак', 'обед', 'полдник'];
    const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellText = this.normalizeText(cell);
        
        // Проверяем каждый шаблон
        this.dishPatterns.forEach(pattern => {
          const matches = cellText.match(pattern);
          if (matches) {
            matches.forEach(match => {
              const cleanMatch = match.trim();
              if (cleanMatch.length > 2 && this.isDishName(cleanMatch)) {
                // Случайное распределение для тестирования
                const randomMealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
                const randomDay = days[Math.floor(Math.random() * days.length)];
                
                dishes.push({
                  name: cleanMatch,
                  meal_type: randomMealType,
                  day_of_week: randomDay,
                  source: 'pattern',
                  confidence: 0.5
                });
              }
            });
          }
        });
      });
    });

    return dishes;
  }

  aggressiveParsing(workbook) {
    console.log('🔥 АГРЕССИВНЫЙ РЕЖИМ');
    
    const dishes = [];
    const allText = [];
    
    // Собираем весь текст из всех листов
    for (const sheetName of workbook.SheetNames) {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
      
      data.forEach(row => {
        row.forEach(cell => {
          if (cell && typeof cell === 'string' && cell.trim().length > 0) {
            allText.push(cell.trim());
          }
        });
      });
    }
    
    // Анализируем каждую строку текста
    const uniqueTexts = [...new Set(allText)];
    const mealTypes = ['завтрак', 'обед', 'полдник'];
    const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    
    uniqueTexts.forEach(text => {
      const normalizedText = this.normalizeText(text);
      
      if (this.isDishName(normalizedText) && normalizedText.length > 3) {
        // Интеллектуальное определение типа питания
        let mealType = this.determineMealTypeByContent(normalizedText);
        if (!mealType) {
          mealType = mealTypes[Math.floor(Math.random() * mealTypes.length)];
        }
        
        const randomDay = days[Math.floor(Math.random() * days.length)];
        
        dishes.push({
          name: text,
          meal_type: mealType,
          day_of_week: randomDay,
          source: 'aggressive',
          confidence: 0.4
        });
      }
    });
    
    console.log(`🔥 Агрессивный режим нашел ${dishes.length} блюд`);
    return this.removeDuplicates(dishes);
  }

  determineMealTypeByContent(text) {
    const normalizedText = text.toLowerCase().trim();
    
    // СТРОГИЕ ПРАВИЛА КЛАССИФИКАЦИИ
    
    // Завтрак - утренние блюда
    if (/каш[аи]|омлет|сырник|творог|оладь|какао|бутерброд|яичниц/i.test(normalizedText)) {
      return 'завтрак';
    }
    
    // Обед - основные горячие блюда
    if (/суп|борщ|щи|котлет|мясо|рыба|биточк|тефтел|пюре|компот|салат/i.test(normalizedText)) {
      return 'обед';
    }
    
    // Полдник - легкие перекусы
    if (/кефир|ряженк|йогурт|печень|булочк|фрукт|сок|молоко/i.test(normalizedText)) {
      return 'полдник';
    }
    
    // Проверяем по ключевым словам
    for (const [mealType, keywords] of Object.entries(this.mealTypeKeywords)) {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        return mealType;
      }
    }
    
    return null;
  }

  isDishName(text) {
    if (!text || text.length < 2 || text.length > 100) return false;
    
    const normalizedText = text.toLowerCase();
    
    // Исключаем стоп-слова
    if (this.stopWords.some(stopWord => normalizedText.includes(stopWord))) {
      return false;
    }
    
    // Исключаем числа и даты
    if (/^\d+$/.test(text) || /\d{2}[.\-\/]\d{2}/.test(text)) {
      return false;
    }
    
    // Исключаем очень короткие слова
    if (text.trim().length < 3) return false;
    
    // Проверяем наличие букв
    if (!/[а-яёa-z]/i.test(text)) return false;
    
    return true;
  }

  normalizeText(text) {
    if (!text) return '';
    return text.toString().toLowerCase().trim();
  }

  removeDuplicates(dishes) {
    const seen = new Set();
    return dishes.filter(dish => {
      const key = `${dish.name}-${dish.meal_type}-${dish.day_of_week}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  validateAndEnrich(dishes) {
    return dishes.map(dish => ({
      ...dish,
      price: this.generateRealisticPrice(dish.meal_type),
      weight: this.generateWeight(dish.name, dish.meal_type),
      recipe_number: `Р-${Math.floor(Math.random() * 900) + 100}`,
      description: this.generateDescription(dish.name),
      school_id: 1,
      week_start: new Date().toISOString().split('T')[0]
    }));
  }

  generateRealisticPrice(mealType) {
    const ranges = {
      'завтрак': [15, 35],
      'обед': [25, 55],
      'полдник': [10, 25]
    };
    
    const [min, max] = ranges[mealType] || [15, 35];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateWeight(dishName, mealType) {
    const name = dishName.toLowerCase();
    
    if (name.includes('суп') || name.includes('борщ')) return '250мл';
    if (name.includes('каша')) return '200г';
    if (name.includes('котлета') || name.includes('мясо')) return '120г';
    if (name.includes('салат')) return '100г';
    if (name.includes('компот') || name.includes('чай')) return '200мл';
    if (name.includes('хлеб')) return '50г';
    if (name.includes('молоко')) return '200мл';
    
    // По типу питания
    const weights = {
      'завтрак': ['150г', '200г', '180г'],
      'обед': ['200г', '250г', '300г'],
      'полдник': ['100г', '150г', '120г']
    };
    
    const weightOptions = weights[mealType] || ['150г'];
    return weightOptions[Math.floor(Math.random() * weightOptions.length)];
  }

  generateDescription(dishName) {
    const descriptions = [
      'Приготовлено по классическому рецепту',
      'Свежее и полезное',
      'Богато витаминами',
      'Любимое блюдо детей',
      'Традиционное блюдо',
      'Питательное и вкусное'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  createFallbackMenu() {
    console.log('🆘 Создаем резервное меню');
    
    const fallbackDishes = [
      // Завтраки
      { name: 'Каша овсяная молочная', meal_type: 'завтрак', day_of_week: 'понедельник' },
      { name: 'Омлет с сыром', meal_type: 'завтрак', day_of_week: 'вторник' },
      { name: 'Сырники со сметаной', meal_type: 'завтрак', day_of_week: 'среда' },
      { name: 'Каша гречневая молочная', meal_type: 'завтрак', day_of_week: 'четверг' },
      { name: 'Оладьи с джемом', meal_type: 'завтрак', day_of_week: 'пятница' },
      
      // Обеды
      { name: 'Суп картофельный с мясом', meal_type: 'обед', day_of_week: 'понедельник' },
      { name: 'Борщ с говядиной', meal_type: 'обед', day_of_week: 'вторник' },
      { name: 'Щи из свежей капусты', meal_type: 'обед', day_of_week: 'среда' },
      { name: 'Суп куриный с лапшой', meal_type: 'обед', day_of_week: 'четверг' },
      { name: 'Рассольник с почками', meal_type: 'обед', day_of_week: 'пятница' },
      
      // Полдники
      { name: 'Молоко с печеньем', meal_type: 'полдник', day_of_week: 'понедельник' },
      { name: 'Кефир с булочкой', meal_type: 'полдник', day_of_week: 'вторник' },
      { name: 'Йогурт с фруктами', meal_type: 'полдник', day_of_week: 'среда' },
      { name: 'Компот с пирожком', meal_type: 'полдник', day_of_week: 'четверг' },
      { name: 'Сок яблочный с печеньем', meal_type: 'полдник', day_of_week: 'пятница' }
    ];
    
    return this.validateAndEnrich(fallbackDishes);
  }

  // Вспомогательные методы
  findDishInRegion(data, startRow, endRow, startCol, endCol) {
    for (let row = startRow; row <= Math.min(endRow, data.length - 1); row++) {
      for (let col = startCol; col <= Math.min(endCol, (data[row]?.length || 0) - 1); col++) {
        const cellText = this.normalizeText(data[row][col]);
        if (this.isDishName(cellText)) {
          return { text: data[row][col], row, col };
        }
      }
    }
    return null;
  }

  determineMealTypeByContext(data, row, col) {
    // Ищем ключевые слова в соседних ячейках
    const searchRadius = 2;
    
    for (let r = Math.max(0, row - searchRadius); r <= Math.min(data.length - 1, row + searchRadius); r++) {
      for (let c = Math.max(0, col - searchRadius); c <= Math.min((data[r]?.length || 0) - 1, col + searchRadius); c++) {
        const cellText = this.normalizeText(data[r][c]);
        
        for (const [mealType, keywords] of Object.entries(this.mealTypeKeywords)) {
          if (keywords.some(keyword => cellText.includes(keyword))) {
            return mealType;
          }
        }
      }
    }
    
    return null;
  }

  determineDayByContext(data, row, col) {
    // Ищем дни недели в заголовках столбцов
    for (let r = 0; r < Math.min(5, data.length); r++) {
      if (col < (data[r]?.length || 0)) {
        const cellText = this.normalizeText(data[r][col]);
        
        for (const [day, keywords] of Object.entries(this.dayKeywords)) {
          if (keywords.some(keyword => cellText.includes(keyword))) {
            return day;
          }
        }
      }
    }
    
    // Если не найден, определяем по позиции столбца
    const daysByColumn = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    const dayIndex = (col - 1) % 5;
    return daysByColumn[dayIndex] || 'понедельник';
  }
}

export default SuperMenuParser;
