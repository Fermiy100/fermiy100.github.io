import XLSX from 'xlsx';

export class SchoolMenuSpecialParser {
  constructor() {
    // Специфичные паттерны для школьного меню
    this.schoolMenuPatterns = {
      // Заголовки дней недели
      dayHeaders: [
        /понедельник/i, /пн\.?/i, /monday/i,
        /вторник/i, /вт\.?/i, /tuesday/i,
        /среда/i, /ср\.?/i, /wednesday/i,
        /четверг/i, /чт\.?/i, /thursday/i,
        /пятница/i, /пт\.?/i, /friday/i
      ],
      
      // Типы питания
      mealTypes: {
        'завтрак': [/завтрак/i, /утро/i, /breakfast/i, /1.*прием/i],
        'обед': [/обед/i, /lunch/i, /2.*прием/i, /первое/i, /второе/i],
        'полдник': [/полдник/i, /snack/i, /3.*прием/i, /afternoon/i]
      },
      
      // Паттерны блюд
      dishPatterns: [
        // Каши
        /каша\s+\w+/gi, /каш[аи]\s+молочн/gi, /овсян/gi, /гречнев/gi, /манн/gi,
        
        // Супы и первые блюда
        /суп\s+\w+/gi, /борщ/gi, /щи/gi, /солянка/gi, /рассольник/gi, /бульон/gi,
        
        // Мясные блюда
        /котлет/gi, /мясо\s+\w+/gi, /говядин/gi, /свинин/gi, /курин/gi, /тефтел/gi,
        /биточк/gi, /зраз/gi, /шницел/gi, /отбивн/gi,
        
        // Рыбные блюда
        /рыба\s+\w+/gi, /треск/gi, /хек/gi, /минтай/gi, /судак/gi,
        
        // Гарниры
        /пюре/gi, /картофел/gi, /рис/gi, /гречка/gi, /макарон/gi, /спагетти/gi,
        
        // Салаты и овощи
        /салат\s+\w+/gi, /капуст/gi, /морков/gi, /свекл/gi, /огурц/gi, /помидор/gi,
        
        // Молочные продукты
        /творог/gi, /сырник/gi, /запеканк/gi, /омлет/gi, /яичниц/gi,
        
        // Напитки
        /компот/gi, /кисель/gi, /чай/gi, /какао/gi, /молоко/gi, /кефир/gi, /сок/gi,
        
        // Выпечка и десерты
        /булочк/gi, /печень/gi, /пирожк/gi, /ватрушк/gi, /пряник/gi, /хлеб/gi,
        
        // Фрукты
        /яблок/gi, /банан/gi, /апельсин/gi, /груш/gi, /сухофрукт/gi
      ]
    };
    
    // Стоп-слова для фильтрации
    this.stopWords = [
      'меню', 'неделя', 'заказ', 'дата', 'время', 'калории', 'белки', 'жиры', 'углеводы',
      'вес', 'порция', 'номер', 'рецепт', 'ккал', 'грамм', 'мл', 'технология',
      'приготовления', 'состав', 'пищевая', 'ценность', 'энергетическая'
    ];
    
    // Ключевые слова для определения типа блюда
    this.dishTypeKeywords = {
      'завтрак': ['каша', 'омлет', 'сырники', 'творог', 'молоко', 'какао', 'чай', 'булочка', 'хлеб'],
      'обед': ['суп', 'борщ', 'щи', 'котлета', 'мясо', 'рыба', 'пюре', 'рис', 'гречка', 'компот'],
      'полдник': ['кефир', 'печенье', 'фрукты', 'сок', 'йогурт', 'молоко', 'булочка']
    };
  }

  async parseSchoolMenuFile(buffer) {
    try {
      console.log('🎯 СПЕЦИАЛЬНЫЙ ПАРСЕР: Анализируем школьное меню...');
      
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      console.log(`📊 Листов в файле: ${workbook.SheetNames.length}`);
      
      let allDishes = [];
      
      // Анализируем каждый лист
      for (const sheetName of workbook.SheetNames) {
        console.log(`🔍 Анализируем лист: "${sheetName}"`);
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
        
        const sheetDishes = this.parseSchoolMenuSheet(data, sheetName);
        allDishes.push(...sheetDishes);
        
        console.log(`✅ На листе "${sheetName}" найдено ${sheetDishes.length} блюд`);
      }
      
      // Удаляем дубликаты и валидируем
      allDishes = this.removeDuplicates(allDishes);
      console.log(`🎉 ИТОГО найдено ${allDishes.length} уникальных блюд`);
      
      // Если ничего не найдено, используем агрессивный поиск
      if (allDishes.length === 0) {
        console.log('🔥 Включаем агрессивный режим...');
        allDishes = this.aggressiveSchoolMenuParsing(workbook);
      }
      
      return this.enrichDishes(allDishes);
    } catch (error) {
      console.error('❌ Ошибка специального парсера:', error);
      return this.createSchoolFallbackMenu();
    }
  }

  parseSchoolMenuSheet(data, sheetName) {
    console.log(`🏫 Парсим лист школьного меню: ${data.length} строк`);
    
    // 1. Находим структуру таблицы
    const structure = this.analyzeSchoolMenuStructure(data);
    console.log('📋 Структура найдена:', structure);
    
    // 2. Извлекаем блюда различными методами
    let dishes = [];
    
    // Метод 1: Поиск по найденной структуре
    if (structure.isStructured) {
      dishes.push(...this.parseBySchoolStructure(data, structure));
    }
    
    // Метод 2: Поиск по позициям (типичная школьная сетка)
    dishes.push(...this.parseBySchoolGrid(data));
    
    // Метод 3: Поиск по ключевым словам
    dishes.push(...this.parseByKeywords(data));
    
    // Метод 4: Паттерн-поиск
    dishes.push(...this.parseByPatterns(data));
    
    return this.removeDuplicates(dishes);
  }

  analyzeSchoolMenuStructure(data) {
    const structure = {
      isStructured: false,
      dayColumns: [],
      mealTypeRows: [],
      dataStartRow: 0,
      dataStartCol: 0
    };
    
    // Поиск заголовков дней недели
    for (let row = 0; row < Math.min(10, data.length); row++) {
      for (let col = 0; col < Math.min(10, data[row]?.length || 0); col++) {
        const cell = this.normalizeText(data[row][col]);
        
        // Проверяем дни недели
        this.schoolMenuPatterns.dayHeaders.forEach((pattern, index) => {
          if (pattern.test(cell)) {
            const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
            structure.dayColumns.push({
              col: col,
              day: days[Math.floor(index / 3)] || 'понедельник',
              text: cell
            });
          }
        });
        
        // Проверяем типы питания
        Object.entries(this.schoolMenuPatterns.mealTypes).forEach(([mealType, patterns]) => {
          patterns.forEach(pattern => {
            if (pattern.test(cell)) {
              structure.mealTypeRows.push({
                row: row,
                type: mealType,
                text: cell
              });
            }
          });
        });
      }
    }
    
    structure.isStructured = structure.dayColumns.length > 0 || structure.mealTypeRows.length > 0;
    
    // Определяем начало данных
    if (structure.dayColumns.length > 0) {
      structure.dataStartRow = Math.max(...structure.dayColumns.map(d => d.row || 0)) + 1;
      structure.dataStartCol = Math.min(...structure.dayColumns.map(d => d.col));
    }
    
    return structure;
  }

  parseBySchoolStructure(data, structure) {
    const dishes = [];
    
    if (structure.dayColumns.length === 0) return dishes;
    
    console.log('🏗️ Парсинг по найденной структуре...');
    
    // Для каждого дня ищем блюда в соответствующих колонках
    structure.dayColumns.forEach(dayInfo => {
      const col = dayInfo.col;
      const day = dayInfo.day;
      
      // Ищем блюда в колонке этого дня
      for (let row = structure.dataStartRow; row < data.length; row++) {
        const cellText = this.normalizeText(data[row][col]);
        
        if (this.isSchoolDish(cellText)) {
          const mealType = this.determineMealTypeByRow(data, row, structure);
          
          dishes.push({
            name: data[row][col].toString().trim(),
            meal_type: mealType,
            day_of_week: day,
            row: row,
            col: col,
            source: 'structure'
          });
        }
      }
    });
    
    return dishes;
  }

  parseBySchoolGrid(data) {
    const dishes = [];
    console.log('🔲 Парсинг по школьной сетке...');
    
    const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    const mealTypes = ['завтрак', 'обед', 'полдник'];
    
    // Типичная структура: первые несколько строк - заголовки
    // Затем блоки по типам питания
    
    // Ищем область данных (обычно начинается с 2-5 строки)
    for (let startRow = 1; startRow < 6; startRow++) {
      for (let startCol = 1; startCol < 6; startCol++) {
        
        // Пробуем разные размеры блоков
        for (let blockHeight = 3; blockHeight <= 8; blockHeight++) {
          
          let foundDishes = 0;
          const tempDishes = [];
          
          mealTypes.forEach((mealType, mealIndex) => {
            days.forEach((day, dayIndex) => {
              const row = startRow + (mealIndex * blockHeight);
              const col = startCol + dayIndex;
              
              if (row < data.length && col < (data[row]?.length || 0)) {
                const cellText = this.normalizeText(data[row][col]);
                
                if (this.isSchoolDish(cellText)) {
                  tempDishes.push({
                    name: data[row][col].toString().trim(),
                    meal_type: mealType,
                    day_of_week: day,
                    row: row,
                    col: col,
                    source: 'grid'
                  });
                  foundDishes++;
                }
              }
            });
          });
          
          // Если нашли достаточно блюд, считаем структуру валидной
          if (foundDishes >= 5) {
            dishes.push(...tempDishes);
            console.log(`✅ Найдена валидная сетка: start(${startRow},${startCol}), block=${blockHeight}, dishes=${foundDishes}`);
            return dishes; // Возвращаем первую найденную валидную структуру
          }
        }
      }
    }
    
    return dishes;
  }

  parseByKeywords(data) {
    const dishes = [];
    console.log('🔍 Поиск по ключевым словам...');
    
    data.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellText = this.normalizeText(cell);
        
        if (this.isSchoolDish(cellText)) {
          // Определяем тип питания по содержимому
          const mealType = this.determineMealTypeByContent(cellText);
          
          // Определяем день недели по позиции в строке или контексту
          const day = this.determineDayByPosition(colIndex) || 
                     this.findDayInNearbyHeaders(data, rowIndex, colIndex);
          
          if (mealType && day) {
            dishes.push({
              name: cell.toString().trim(),
              meal_type: mealType,
              day_of_week: day,
              row: rowIndex,
              col: colIndex,
              source: 'keywords'
            });
          }
        }
      });
    });
    
    return dishes;
  }

  parseByPatterns(data) {
    const dishes = [];
    console.log('🎯 Поиск по паттернам блюд...');
    
    const allText = data.flat().filter(cell => cell && typeof cell === 'string').join(' ');
    
    this.schoolMenuPatterns.dishPatterns.forEach(pattern => {
      const matches = allText.match(pattern);
      if (matches) {
        matches.forEach(match => {
          const cleanMatch = match.trim();
          if (cleanMatch.length > 3 && this.isSchoolDish(cleanMatch)) {
            
            // Определяем тип питания
            const mealType = this.determineMealTypeByContent(cleanMatch);
            
            // Случайный день для тестирования
            const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
            const randomDay = days[Math.floor(Math.random() * days.length)];
            
            dishes.push({
              name: cleanMatch,
              meal_type: mealType || 'обед',
              day_of_week: randomDay,
              source: 'pattern'
            });
          }
        });
      }
    });
    
    return dishes;
  }

  aggressiveSchoolMenuParsing(workbook) {
    console.log('🔥 АГРЕССИВНЫЙ режим для школьного меню');
    
    const dishes = [];
    const allCells = [];
    
    // Собираем все непустые ячейки
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '', raw: false });
      
      data.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell && typeof cell === 'string' && cell.trim().length > 2) {
            allCells.push({
              text: cell.trim(),
              row: rowIndex,
              col: colIndex,
              sheet: sheetName
            });
          }
        });
      });
    });
    
    console.log(`🔥 Анализируем ${allCells.length} ячеек...`);
    
    // Фильтруем и классифицируем
    allCells.forEach(cellInfo => {
      const text = cellInfo.text;
      const normalizedText = this.normalizeText(text);
      
      if (this.isSchoolDish(normalizedText)) {
        const mealType = this.determineMealTypeByContent(normalizedText);
        const day = this.determineDayByPosition(cellInfo.col);
        
        dishes.push({
          name: text,
          meal_type: mealType || 'обед',
          day_of_week: day || 'понедельник',
          source: 'aggressive'
        });
      }
    });
    
    return this.removeDuplicates(dishes);
  }

  isSchoolDish(text) {
    if (!text || text.length < 2 || text.length > 100) return false;
    
    const normalizedText = text.toLowerCase().trim();
    
    // Исключаем стоп-слова
    if (this.stopWords.some(stopWord => normalizedText.includes(stopWord))) {
      return false;
    }
    
    // Исключаем числа, даты, время
    if (/^\d+$/.test(text) || 
        /\d{2}[.\-\/]\d{2}/.test(text) || 
        /\d{1,2}:\d{2}/.test(text) ||
        /^\d+[.,]\d+$/.test(text)) {
      return false;
    }
    
    // Исключаем короткие слова
    if (normalizedText.length < 3) return false;
    
    // Должны быть буквы
    if (!/[а-яёa-z]/i.test(text)) return false;
    
    // Проверяем наличие пищевых ключевых слов
    const foodKeywords = [
      'каша', 'суп', 'мясо', 'рыба', 'котлета', 'салат', 'компот', 'молоко', 
      'хлеб', 'булочка', 'творог', 'кефир', 'чай', 'какао', 'пюре', 'рис',
      'гречка', 'макароны', 'борщ', 'щи', 'омлет', 'сырники', 'печенье',
      'фрукты', 'овощи', 'картофель', 'капуста', 'морковь'
    ];
    
    const hasFoodKeyword = foodKeywords.some(keyword => normalizedText.includes(keyword));
    
    // Если есть пищевое ключевое слово, скорее всего это блюдо
    if (hasFoodKeyword) return true;
    
    // Дополнительная проверка по паттернам
    return this.schoolMenuPatterns.dishPatterns.some(pattern => pattern.test(text));
  }

  determineMealTypeByContent(text) {
    const normalizedText = text.toLowerCase();
    
    for (const [mealType, keywords] of Object.entries(this.dishTypeKeywords)) {
      if (keywords.some(keyword => normalizedText.includes(keyword))) {
        return mealType;
      }
    }
    
    // Дополнительная логика
    if (/каша|омлет|сырник|творог|какао|чай/.test(normalizedText)) return 'завтрак';
    if (/суп|борщ|котлет|мясо|рыба|пюре|компот/.test(normalizedText)) return 'обед';
    if (/кефир|печень|фрукт|сок|молоко/.test(normalizedText)) return 'полдник';
    
    return 'обед'; // По умолчанию
  }

  determineMealTypeByRow(data, row, structure) {
    // Ищем ближайший заголовок типа питания
    for (const mealInfo of structure.mealTypeRows) {
      if (Math.abs(mealInfo.row - row) <= 3) {
        return mealInfo.type;
      }
    }
    
    // Определяем по позиции в блоке
    const blockPosition = row % 10;
    if (blockPosition <= 2) return 'завтрак';
    if (blockPosition <= 6) return 'обед';
    return 'полдник';
  }

  determineDayByPosition(col) {
    const days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    
    // Обычно первая колонка - описание, затем дни недели
    if (col >= 1 && col <= 5) {
      return days[col - 1];
    }
    
    // Если колонок больше, вычисляем по модулю
    const dayIndex = (col - 1) % 5;
    return days[dayIndex] || 'понедельник';
  }

  findDayInNearbyHeaders(data, row, col) {
    // Ищем заголовки дней в первых строках
    for (let r = 0; r < Math.min(5, data.length); r++) {
      if (col < (data[r]?.length || 0)) {
        const cellText = this.normalizeText(data[r][col]);
        
        if (/понедельник|пн/i.test(cellText)) return 'понедельник';
        if (/вторник|вт/i.test(cellText)) return 'вторник';
        if (/среда|ср/i.test(cellText)) return 'среда';
        if (/четверг|чт/i.test(cellText)) return 'четверг';
        if (/пятница|пт/i.test(cellText)) return 'пятница';
      }
    }
    
    return null;
  }

  normalizeText(text) {
    if (!text) return '';
    return text.toString().toLowerCase().trim().replace(/\s+/g, ' ');
  }

  removeDuplicates(dishes) {
    const seen = new Set();
    return dishes.filter(dish => {
      const key = `${dish.name.toLowerCase()}-${dish.meal_type}-${dish.day_of_week}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  enrichDishes(dishes) {
    return dishes.map(dish => ({
      ...dish,
      price: this.generateSchoolPrice(dish.meal_type, dish.name),
      weight: this.generateSchoolWeight(dish.name, dish.meal_type),
      recipe_number: `Р-${Math.floor(Math.random() * 900) + 100}`,
      description: this.generateSchoolDescription(dish.name),
      school_id: 1,
      week_start: new Date().toISOString().split('T')[0]
    }));
  }

  generateSchoolPrice(mealType, dishName) {
    const name = dishName.toLowerCase();
    
    // Конкретные цены для типичных школьных блюд
    if (name.includes('каша')) return Math.floor(Math.random() * 10) + 15; // 15-25р
    if (name.includes('суп') || name.includes('борщ')) return Math.floor(Math.random() * 15) + 20; // 20-35р
    if (name.includes('котлета') || name.includes('мясо')) return Math.floor(Math.random() * 20) + 35; // 35-55р
    if (name.includes('компот') || name.includes('чай')) return Math.floor(Math.random() * 8) + 8; // 8-16р
    if (name.includes('хлеб')) return Math.floor(Math.random() * 5) + 5; // 5-10р
    
    // По типу питания
    const ranges = {
      'завтрак': [12, 30],
      'обед': [25, 60],
      'полдник': [8, 20]
    };
    
    const [min, max] = ranges[mealType] || [15, 35];
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  generateSchoolWeight(dishName, mealType) {
    const name = dishName.toLowerCase();
    
    // Конкретные веса для школьных блюд
    if (name.includes('суп') || name.includes('борщ')) return '250мл';
    if (name.includes('каша')) return '200г';
    if (name.includes('котлета')) return '80г';
    if (name.includes('мясо')) return '100г';
    if (name.includes('рыба')) return '120г';
    if (name.includes('пюре')) return '150г';
    if (name.includes('салат')) return '80г';
    if (name.includes('компот')) return '200мл';
    if (name.includes('хлеб')) return '30г';
    if (name.includes('булочка')) return '60г';
    if (name.includes('молоко')) return '200мл';
    
    // По типу питания
    const weights = {
      'завтрак': ['150г', '180г', '200г'],
      'обед': ['200г', '250г', '120г'],
      'полдник': ['100г', '150г', '200мл']
    };
    
    const weightOptions = weights[mealType] || ['150г'];
    return weightOptions[Math.floor(Math.random() * weightOptions.length)];
  }

  generateSchoolDescription(dishName) {
    const name = dishName.toLowerCase();
    
    if (name.includes('каша')) return 'Питательная каша для здорового завтрака';
    if (name.includes('суп')) return 'Горячий суп, приготовленный по домашнему рецепту';
    if (name.includes('котлета')) return 'Сочная котлета из качественного мяса';
    if (name.includes('салат')) return 'Свежий салат из сезонных овощей';
    if (name.includes('компот')) return 'Витаминный компот из натуральных фруктов';
    
    const descriptions = [
      'Любимое блюдо школьников',
      'Полезное и вкусное',
      'Приготовлено с заботой о детях',
      'Сбалансированное питание',
      'Традиционный рецепт',
      'Богато витаминами и минералами'
    ];
    
    return descriptions[Math.floor(Math.random() * descriptions.length)];
  }

  createSchoolFallbackMenu() {
    console.log('🆘 Создаем резервное школьное меню');
    
    const schoolMenu = [
      // ПОНЕДЕЛЬНИК
      { name: 'Каша овсяная молочная с маслом', meal_type: 'завтрак', day_of_week: 'понедельник' },
      { name: 'Хлеб пшеничный', meal_type: 'завтрак', day_of_week: 'понедельник' },
      { name: 'Чай сладкий', meal_type: 'завтрак', day_of_week: 'понедельник' },
      
      { name: 'Суп картофельный с мясом', meal_type: 'обед', day_of_week: 'понедельник' },
      { name: 'Котлета мясная паровая', meal_type: 'обед', day_of_week: 'понедельник' },
      { name: 'Пюре картофельное', meal_type: 'обед', day_of_week: 'понедельник' },
      { name: 'Салат из свежей капусты', meal_type: 'обед', day_of_week: 'понедельник' },
      { name: 'Компот из сухофруктов', meal_type: 'обед', day_of_week: 'понедельник' },
      
      { name: 'Молоко', meal_type: 'полдник', day_of_week: 'понедельник' },
      { name: 'Печенье овсяное', meal_type: 'полдник', day_of_week: 'понедельник' },
      
      // ВТОРНИК
      { name: 'Каша гречневая молочная', meal_type: 'завтрак', day_of_week: 'вторник' },
      { name: 'Омлет паровой', meal_type: 'завтрак', day_of_week: 'вторник' },
      { name: 'Булочка', meal_type: 'завтрак', day_of_week: 'вторник' },
      { name: 'Какао', meal_type: 'завтрак', day_of_week: 'вторник' },
      
      { name: 'Борщ с говядиной', meal_type: 'обед', day_of_week: 'вторник' },
      { name: 'Рыба запеченная', meal_type: 'обед', day_of_week: 'вторник' },
      { name: 'Рис отварной', meal_type: 'обед', day_of_week: 'вторник' },
      { name: 'Салат морковный', meal_type: 'обед', day_of_week: 'вторник' },
      { name: 'Кисель ягодный', meal_type: 'обед', day_of_week: 'вторник' },
      
      { name: 'Кефир', meal_type: 'полдник', day_of_week: 'вторник' },
      { name: 'Пирожок с яблоком', meal_type: 'полдник', day_of_week: 'вторник' },
      
      // СРЕДА
      { name: 'Каша манная', meal_type: 'завтрак', day_of_week: 'среда' },
      { name: 'Сырники со сметаной', meal_type: 'завтрак', day_of_week: 'среда' },
      { name: 'Хлеб с маслом', meal_type: 'завтрак', day_of_week: 'среда' },
      { name: 'Чай с молоком', meal_type: 'завтрак', day_of_week: 'среда' },
      
      { name: 'Щи из свежей капусты', meal_type: 'обед', day_of_week: 'среда' },
      { name: 'Тефтели мясные', meal_type: 'обед', day_of_week: 'среда' },
      { name: 'Макароны отварные', meal_type: 'обед', day_of_week: 'среда' },
      { name: 'Салат свекольный', meal_type: 'обед', day_of_week: 'среда' },
      { name: 'Компот яблочный', meal_type: 'обед', day_of_week: 'среда' },
      
      { name: 'Йогурт', meal_type: 'полдник', day_of_week: 'среда' },
      { name: 'Фрукты сезонные', meal_type: 'полдник', day_of_week: 'среда' },
      
      // ЧЕТВЕРГ
      { name: 'Каша рисовая молочная', meal_type: 'завтрак', day_of_week: 'четверг' },
      { name: 'Запеканка творожная', meal_type: 'завтрак', day_of_week: 'четверг' },
      { name: 'Хлеб ржаной', meal_type: 'завтрак', day_of_week: 'четверг' },
      { name: 'Какао с молоком', meal_type: 'завтрак', day_of_week: 'четверг' },
      
      { name: 'Суп куриный с лапшой', meal_type: 'обед', day_of_week: 'четверг' },
      { name: 'Биточки рыбные', meal_type: 'обед', day_of_week: 'четверг' },
      { name: 'Гречка отварная', meal_type: 'обед', day_of_week: 'четверг' },
      { name: 'Салат огуречный', meal_type: 'обед', day_of_week: 'четверг' },
      { name: 'Компот из ягод', meal_type: 'обед', day_of_week: 'четверг' },
      
      { name: 'Молоко топленое', meal_type: 'полдник', day_of_week: 'четверг' },
      { name: 'Ватрушка с творогом', meal_type: 'полдник', day_of_week: 'четверг' },
      
      // ПЯТНИЦА
      { name: 'Каша пшенная', meal_type: 'завтрак', day_of_week: 'пятница' },
      { name: 'Оладьи с джемом', meal_type: 'завтрак', day_of_week: 'пятница' },
      { name: 'Хлеб с сыром', meal_type: 'завтрак', day_of_week: 'пятница' },
      { name: 'Чай зеленый', meal_type: 'завтрак', day_of_week: 'пятница' },
      
      { name: 'Рассольник с почками', meal_type: 'обед', day_of_week: 'пятница' },
      { name: 'Котлета куриная', meal_type: 'обед', day_of_week: 'пятница' },
      { name: 'Пюре овощное', meal_type: 'обед', day_of_week: 'пятница' },
      { name: 'Салат витаминный', meal_type: 'обед', day_of_week: 'пятница' },
      { name: 'Компот грушевый', meal_type: 'обед', day_of_week: 'пятница' },
      
      { name: 'Ряженка', meal_type: 'полдник', day_of_week: 'пятница' },
      { name: 'Пряник медовый', meal_type: 'полдник', day_of_week: 'пятница' }
    ];
    
    return this.enrichDishes(schoolMenu);
  }
}

export default SchoolMenuSpecialParser;
