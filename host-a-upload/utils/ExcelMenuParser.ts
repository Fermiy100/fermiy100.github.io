import * as XLSX from 'xlsx';

export interface ParsedMenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  day_of_week: string;
  meal_type: string;
  weight: string;
  recipe_number: string;
  portion: string;
  week_start: string;
  school_id: number;
  created_at: string;
}

export interface ParseResult {
  success: boolean;
  items: ParsedMenuItem[];
  errors: string[];
  warnings: string[];
  stats: {
    totalRows: number;
    validItems: number;
    skippedRows: number;
    duplicateNames: string[];
  };
}

export class ExcelMenuParser {
  private static readonly DAYS_MAP: Record<string, string> = {
    'понедельник': 'ПОНЕДЕЛЬНИК',
    'вторник': 'ВТОРНИК',
    'среда': 'СРЕДА',
    'четверг': 'ЧЕТВЕРГ',
    'пятница': 'ПЯТНИЦА',
    'суббота': 'СУББОТА',
    'воскресенье': 'ВОСКРЕСЕНЬЕ',
    'monday': 'ПОНЕДЕЛЬНИК',
    'tuesday': 'ВТОРНИК',
    'wednesday': 'СРЕДА',
    'thursday': 'ЧЕТВЕРГ',
    'friday': 'ПЯТНИЦА',
    'saturday': 'СУББОТА',
    'sunday': 'ВОСКРЕСЕНЬЕ'
  };

  private static readonly MEAL_TYPES_MAP: Record<string, string> = {
    'завтрак': 'breakfast',
    'обед': 'lunch',
    'полдник': 'snack',
    'ужин': 'dinner',
    'breakfast': 'breakfast',
    'lunch': 'lunch',
    'snack': 'snack',
    'dinner': 'dinner'
  };

  private static readonly REQUIRED_COLUMNS = [
    'название', 'название блюда', 'блюдо', 'dish', 'name'
  ];

  private static readonly PRICE_COLUMNS = [
    'цена', 'цена блюда', 'стоимость', 'price', 'cost'
  ];

  private static readonly DAY_COLUMNS = [
    'день', 'день недели', 'день_недели', 'day', 'weekday'
  ];

  private static readonly MEAL_COLUMNS = [
    'тип', 'тип приема пищи', 'прием пищи', 'meal', 'meal_type'
  ];

  private static readonly WEIGHT_COLUMNS = [
    'вес', 'масса', 'вес блюда', 'weight', 'mass'
  ];

  private static readonly RECIPE_COLUMNS = [
    'рецепт', 'номер рецепта', 'рецепт номер', 'recipe', 'recipe_number'
  ];

  private static readonly PORTION_COLUMNS = [
    'порция', 'размер порции', 'portion', 'serving'
  ];

  private static readonly DESCRIPTION_COLUMNS = [
    'описание', 'описание блюда', 'description', 'desc'
  ];

  /**
   * Парсит Excel файл и извлекает данные меню
   */
  static async parseExcelFile(file: File): Promise<ParseResult> {
    const result: ParseResult = {
      success: false,
      items: [],
      errors: [],
      warnings: [],
      stats: {
        totalRows: 0,
        validItems: 0,
        skippedRows: 0,
        duplicateNames: []
      }
    };

    try {
      // Читаем файл
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Получаем первый лист
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      if (!worksheet) {
        result.errors.push('Лист не найден в файле');
        return result;
      }

      // Конвертируем в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
        header: 1,
        defval: '',
        raw: false 
      });

      if (!Array.isArray(jsonData) || jsonData.length === 0) {
        result.errors.push('Файл пуст или не содержит данных');
        return result;
      }

      // Находим заголовки
      const headers = this.findHeaders(jsonData);
      if (!headers) {
        result.errors.push('Не удалось найти заголовки в файле');
        return result;
      }

      console.log('📋 Найденные заголовки:', headers);

      // Парсим данные
      const dataRows = jsonData.slice(1); // Пропускаем заголовки
      result.stats.totalRows = dataRows.length;

      const processedItems = new Set<string>();
      let currentId = 1;

      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i] as any[];
        const rowNumber = i + 2; // +2 потому что начинаем с 1 и пропускаем заголовки

        try {
          const item = this.parseRow(row, headers, currentId, rowNumber);
          
          if (item) {
            // Проверяем на дубликаты
            const itemKey = `${item.name}-${item.day_of_week}-${item.meal_type}`;
            if (processedItems.has(itemKey)) {
              result.stats.duplicateNames.push(item.name);
              result.warnings.push(`Строка ${rowNumber}: Дубликат блюда "${item.name}"`);
            } else {
              processedItems.add(itemKey);
              result.items.push(item);
              currentId++;
              result.stats.validItems++;
            }
          } else {
            result.stats.skippedRows++;
            result.warnings.push(`Строка ${rowNumber}: Пропущена (недостаточно данных)`);
          }
        } catch (error: any) {
          result.errors.push(`Строка ${rowNumber}: ${error.message}`);
          result.stats.skippedRows++;
        }
      }

      result.success = result.items.length > 0;
      
      if (result.items.length === 0) {
        result.errors.push('Не удалось извлечь ни одного блюда из файла');
      }

      console.log('📊 Результат парсинга:', result.stats);
      return result;

    } catch (error: any) {
      console.error('❌ Ошибка парсинга Excel:', error);
      result.errors.push(`Ошибка чтения файла: ${error.message}`);
      return result;
    }
  }

  /**
   * Находит заголовки в данных
   */
  private static findHeaders(data: any[][]): Record<string, number> | null {
    if (data.length === 0) return null;

    const firstRow = data[0];
    const headers: Record<string, number> = {};

    // Ищем нужные колонки
    for (let i = 0; i < firstRow.length; i++) {
      const cellValue = String(firstRow[i] || '').toLowerCase().trim();
      
      // Название блюда
      if (this.REQUIRED_COLUMNS.some(col => cellValue.includes(col))) {
        headers.name = i;
      }
      // Цена
      else if (this.PRICE_COLUMNS.some(col => cellValue.includes(col))) {
        headers.price = i;
      }
      // День недели
      else if (this.DAY_COLUMNS.some(col => cellValue.includes(col))) {
        headers.day = i;
      }
      // Тип приема пищи
      else if (this.MEAL_COLUMNS.some(col => cellValue.includes(col))) {
        headers.meal = i;
      }
      // Вес
      else if (this.WEIGHT_COLUMNS.some(col => cellValue.includes(col))) {
        headers.weight = i;
      }
      // Рецепт
      else if (this.RECIPE_COLUMNS.some(col => cellValue.includes(col))) {
        headers.recipe = i;
      }
      // Порция
      else if (this.PORTION_COLUMNS.some(col => cellValue.includes(col))) {
        headers.portion = i;
      }
      // Описание
      else if (this.DESCRIPTION_COLUMNS.some(col => cellValue.includes(col))) {
        headers.description = i;
      }
    }

    // Проверяем обязательные поля
    if (!headers.name) {
      console.error('❌ Не найдена колонка с названием блюда');
      return null;
    }

    return headers;
  }

  /**
   * Парсит строку данных
   */
  private static parseRow(
    row: any[], 
    headers: Record<string, number>, 
    id: number, 
    rowNumber: number
  ): ParsedMenuItem | null {
    
    // Получаем название (обязательное поле)
    const name = String(row[headers.name] || '').trim();
    if (!name) {
      throw new Error('Название блюда не указано');
    }

    // Получаем цену
    const priceValue = row[headers.price];
    const price = this.parsePrice(priceValue);
    if (price <= 0) {
      throw new Error('Цена не указана или некорректна');
    }

    // Получаем день недели
    const dayValue = headers.day !== undefined ? String(row[headers.day] || '').trim() : '';
    const day_of_week = this.normalizeDay(dayValue);

    // Получаем тип приема пищи
    const mealValue = headers.meal !== undefined ? String(row[headers.meal] || '').trim() : '';
    const meal_type = this.normalizeMealType(mealValue);

    // Получаем опциональные поля
    const description = headers.description !== undefined 
      ? String(row[headers.description] || '').trim() 
      : '';
    
    const weight = headers.weight !== undefined 
      ? String(row[headers.weight] || '').trim() 
      : '';
    
    const recipe_number = headers.recipe !== undefined 
      ? String(row[headers.recipe] || '').trim() 
      : '';
    
    const portion = headers.portion !== undefined 
      ? String(row[headers.portion] || '').trim() 
      : '';

    return {
      id,
      name,
      description,
      price,
      day_of_week,
      meal_type,
      weight,
      recipe_number,
      portion,
      week_start: this.getCurrentWeekStart(),
      school_id: 1,
      created_at: new Date().toISOString()
    };
  }

  /**
   * Парсит цену из различных форматов
   */
  private static parsePrice(value: any): number {
    if (typeof value === 'number') {
      return Math.max(0, value);
    }

    const str = String(value || '').trim();
    if (!str) return 0;

    // Убираем все кроме цифр, точек и запятых
    const cleanStr = str.replace(/[^\d.,]/g, '');
    
    // Заменяем запятую на точку
    const normalizedStr = cleanStr.replace(',', '.');
    
    const price = parseFloat(normalizedStr);
    return isNaN(price) ? 0 : Math.max(0, price);
  }

  /**
   * Нормализует день недели
   */
  private static normalizeDay(day: string): string {
    if (!day) return 'ПОНЕДЕЛЬНИК';
    
    const normalized = day.toLowerCase().trim();
    return this.DAYS_MAP[normalized] || 'ПОНЕДЕЛЬНИК';
  }

  /**
   * Нормализует тип приема пищи
   */
  private static normalizeMealType(meal: string): string {
    if (!meal) return 'lunch';
    
    const normalized = meal.toLowerCase().trim();
    return this.MEAL_TYPES_MAP[normalized] || 'lunch';
  }

  /**
   * Получает начало текущей недели
   */
  private static getCurrentWeekStart(): string {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - dayOfWeek + 1);
    return monday.toISOString().split('T')[0];
  }

  /**
   * Валидирует файл перед парсингом
   */
  static validateFile(file: File): { valid: boolean; error?: string } {
    // Проверяем тип файла
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(file.type)) {
      return {
        valid: false,
        error: 'Поддерживаются только файлы Excel (.xlsx, .xls) и CSV'
      };
    }

    // Проверяем размер файла (максимум 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        valid: false,
        error: 'Размер файла не должен превышать 10MB'
      };
    }

    // Проверяем, что файл не пустой
    if (file.size === 0) {
      return {
        valid: false,
        error: 'Файл пуст'
      };
    }

    return { valid: true };
  }

  /**
   * Создает шаблон Excel файла
   */
  static createTemplate(): void {
    const templateData = [
      ['Название блюда', 'Цена', 'День недели', 'Тип приема пищи', 'Вес', 'Номер рецепта', 'Порция', 'Описание'],
      ['Суп овощной', '50', 'ПОНЕДЕЛЬНИК', 'обед', '250г', '1/1', '1 порция', 'Свежие овощи'],
      ['Каша овсяная', '30', 'ПОНЕДЕЛЬНИК', 'завтрак', '200г', '2/1', '1 порция', 'С молоком'],
      ['Котлета мясная', '80', 'ПОНЕДЕЛЬНИК', 'обед', '100г', '3/1', '1 порция', 'Говядина'],
      ['Фрукты', '25', 'ПОНЕДЕЛЬНИК', 'полдник', '150г', '4/1', '1 порция', 'Сезонные фрукты']
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(templateData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Меню');

    // Скачиваем файл
    XLSX.writeFile(workbook, 'menu_template.xlsx');
  }
}
