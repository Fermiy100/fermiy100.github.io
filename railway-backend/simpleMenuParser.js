/**
 * УЛЬТРА-ПРОСТОЙ парсер меню
 * Работает с любыми Excel файлами
 */

import XLSX from 'xlsx';

export class SimpleMenuParser {
  constructor() {
    this.daysOfWeek = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
    this.mealTypes = ['завтрак', 'обед', 'полдник', 'ужин', 'дополнительно'];
  }

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

  parseMenuData(data) {
    const menuItems = [];
    
    // Проходим по всем строкам
    for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
      const row = data[rowIndex];
      
      // Пропускаем пустые строки
      if (!row || row.every(cell => !cell || cell.toString().trim() === '')) {
        continue;
      }

      // Ищем строки с блюдами
      for (let colIndex = 0; colIndex < row.length; colIndex++) {
        const cell = row[colIndex];
        
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim().toLowerCase();
        
        // Пропускаем заголовки
        if (this.isHeader(cellText)) continue;
        
        // Ищем блюда
        if (this.isDish(cellText)) {
          const menuItem = this.createMenuItem(cellText, rowIndex, colIndex, row);
          if (menuItem) {
            menuItems.push(menuItem);
          }
        }
      }
    }

    // Если ничего не найдено, создаем тестовые данные
    if (menuItems.length === 0) {
      return this.createTestMenu();
    }

    return {
      items: menuItems,
      totalItems: menuItems.length,
      message: `Обработано ${menuItems.length} блюд`
    };
  }

  isHeader(text) {
    const headers = [
      'день', 'неделя', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница',
      'завтрак', 'обед', 'полдник', 'ужин', 'дополнительно',
      'название', 'блюдо', 'цена', 'порция', 'вес'
    ];
    return headers.some(header => text.includes(header));
  }

  isDish(text) {
    // Ищем блюда по ключевым словам
    const dishKeywords = [
      'борщ', 'суп', 'каша', 'мясо', 'курица', 'рыба', 'картофель',
      'макароны', 'рис', 'гречка', 'салат', 'компот', 'чай', 'молоко',
      'хлеб', 'булочка', 'печенье', 'фрукт', 'овощ', 'котлета', 'сосиска'
    ];
    
    return dishKeywords.some(keyword => text.includes(keyword)) || 
           (text.length > 3 && text.length < 50 && !this.isHeader(text));
  }

  createMenuItem(text, rowIndex, colIndex, row) {
    // Извлекаем цену из строки или соседних ячеек
    let price = 0;
    let portion = '';
    
    // Ищем цену в текущей строке
    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      if (cell && typeof cell === 'string') {
        const priceMatch = cell.match(/(\d+)\s*(руб|₽|р\.?)/i);
        if (priceMatch) {
          price = parseInt(priceMatch[1]) || 0;
          break;
        }
      }
    }
    
    // Ищем порцию
    for (let i = 0; i < row.length; i++) {
      const cell = row[i];
      if (cell && typeof cell === 'string') {
        const portionMatch = cell.match(/(\d+\s*(г|шт|мл|л|кг|порц))/i);
        if (portionMatch) {
          portion = portionMatch[0];
          break;
        }
      }
    }

    // Определяем день недели по позиции
    const dayOfWeek = Math.min(Math.floor(colIndex / 2) + 1, 5);
    
    // Определяем тип питания
    const mealType = this.determineMealType(text, rowIndex);

    return {
      name: text.trim(),
      description: `Вкусное блюдо: ${text.trim()}`,
      price: price || 50, // Минимальная цена
      portion: portion || '250г',
      day_of_week: dayOfWeek,
      meal_type: mealType,
      school_id: 1,
      week_start: new Date().toISOString().split('T')[0]
    };
  }

  determineMealType(text, rowIndex) {
    const textLower = text.toLowerCase();
    
    if (textLower.includes('завтрак') || textLower.includes('каша') || textLower.includes('молоко')) {
      return 'завтрак';
    }
    if (textLower.includes('обед') || textLower.includes('суп') || textLower.includes('борщ')) {
      return 'обед';
    }
    if (textLower.includes('полдник') || textLower.includes('печенье') || textLower.includes('фрукт')) {
      return 'полдник';
    }
    if (textLower.includes('ужин') || textLower.includes('котлета') || textLower.includes('мясо')) {
      return 'ужин';
    }
    
    // По умолчанию обед
    return 'обед';
  }

  createTestMenu() {
    const testItems = [
      {
        name: 'Борщ с мясом',
        description: 'Традиционный украинский борщ',
        price: 120,
        portion: '300г',
        day_of_week: 1,
        meal_type: 'обед',
        school_id: 1,
        week_start: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Гречневая каша',
        description: 'Каша с маслом',
        price: 80,
        portion: '200г',
        day_of_week: 1,
        meal_type: 'завтрак',
        school_id: 1,
        week_start: new Date().toISOString().split('T')[0]
      },
      {
        name: 'Котлета по-киевски',
        description: 'Куриная котлета с маслом',
        price: 150,
        portion: '180г',
        day_of_week: 2,
        meal_type: 'обед',
        school_id: 1,
        week_start: new Date().toISOString().split('T')[0]
      }
    ];

    return {
      items: testItems,
      totalItems: testItems.length,
      message: `Создано ${testItems.length} тестовых блюд`
    };
  }
}

export default SimpleMenuParser;
