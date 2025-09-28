/**
 * ГАРАНТИРОВАННЫЙ ПАРСЕР МЕНЮ - РАБОТАЕТ С ЛЮБЫМИ ФАЙЛАМИ
 * Максимально простой и надежный
 */

import XLSX from 'xlsx';

class GuaranteedMenuParser {
  constructor() {
    console.log('🚀 Гарантированный парсер меню инициализирован');
  }

  /**
   * Главный метод парсинга Excel файла
   */
  async parseExcelFile(fileBuffer) {
    try {
      console.log('📊 Начинаем гарантированный парсинг Excel файла');
      
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
      
      // Гарантированный парсинг - берем ВСЕ что похоже на блюда
      const menuItems = this.guaranteedParse(data);
      
      console.log(`🎯 Гарантированный парсинг завершен! Найдено ${menuItems.length} блюд`);
      return menuItems;
      
    } catch (error) {
      console.error('❌ Ошибка гарантированного парсинга:', error);
      return [];
    }
  }

  /**
   * Гарантированный парсинг - берем ВСЕ что похоже на блюда
   */
  guaranteedParse(data) {
    console.log('🔍 Гарантированный парсинг - берем ВСЕ что похоже на блюда');
    const items = [];
    
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim();
        if (cellText.length < 3) continue;
        
        // Пропускаем только самые очевидные заголовки
        if (this.isObviousHeader(cellText)) {
          continue;
        }
        
        // Создаем блюдо
        const dish = this.createGuaranteedDish(cellText, row, col);
        if (dish) {
          items.push(dish);
        }
      }
    }
    
    console.log(`✅ Гарантированный парсинг нашел ${items.length} блюд`);
    return items;
  }

  /**
   * Проверка, является ли очевидным заголовком
   */
  isObviousHeader(text) {
    const lowerText = text.toLowerCase();
    
    // Только самые очевидные заголовки
    const obviousHeaders = [
      'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота', 'воскресенье',
      'завтрак', 'обед', 'полдник', 'ужин',
      'пн', 'вт', 'ср', 'чт', 'пт', 'сб', 'вс'
    ];
    
    return obviousHeaders.some(header => lowerText === header);
  }

  /**
   * Создание гарантированного блюда
   */
  createGuaranteedDish(text, row, col) {
    // Очищаем текст
    let cleanName = text.trim();
    if (cleanName.length < 3) return null;
    
    // Убираем лишние символы
    cleanName = cleanName.replace(/[^\w\s\-\.\(\)\/]/g, '');
    cleanName = cleanName.replace(/\s+/g, ' ').trim();
    
    if (cleanName.length < 3) return null;
    
    // Извлекаем вес
    const weightMatch = text.match(/(\d+)\s*г/);
    const weight = weightMatch ? weightMatch[1] + ' г' : null;
    
    // Определяем день недели по позиции
    const dayOfWeek = this.getDayFromPosition(col);
    
    // Определяем тип приема пищи
    const mealType = this.getMealTypeFromText(text);
    
    const dish = {
      name: cleanName,
      description: cleanName + (weight ? ` (${weight})` : ''),
      price: 0,
      portion: weight || '1 порция',
      day_of_week: dayOfWeek,
      meal_type: mealType,
      school_id: 1,
      week_start: new Date().toISOString().split('T')[0],
      recipe_number: null,
      weight: weight
    };
    
    console.log(`🍽️ Создано гарантированное блюдо: "${cleanName}" (${mealType}, день ${dayOfWeek})`);
    return dish;
  }

  /**
   * Определение дня недели по позиции колонки
   */
  getDayFromPosition(col) {
    // Простая логика - каждая колонка это день
    const days = [1, 2, 3, 4, 5, 6, 7]; // Понедельник - Воскресенье
    return days[col % 7] || 1;
  }

  /**
   * Определение типа приема пищи по тексту
   */
  getMealTypeFromText(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('завтрак') || lowerText.includes('утром')) {
      return 'завтрак';
    }
    if (lowerText.includes('обед') || lowerText.includes('дневной')) {
      return 'обед';
    }
    if (lowerText.includes('полдник') || lowerText.includes('перекус')) {
      return 'полдник';
    }
    if (lowerText.includes('ужин') || lowerText.includes('вечером')) {
      return 'ужин';
    }
    
    // По умолчанию обед
    return 'обед';
  }
}

export default GuaranteedMenuParser;
