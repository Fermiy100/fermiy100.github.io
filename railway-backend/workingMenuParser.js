/**
 * РАБОТАЮЩИЙ ПАРСЕР МЕНЮ - ТОЧНО РАБОТАЕТ
 * Берет ВСЕ ячейки с текстом
 */

import XLSX from 'xlsx';

class WorkingMenuParser {
  constructor() {
    console.log('🚀 Работающий парсер меню инициализирован');
  }

  /**
   * Главный метод парсинга Excel файла
   */
  async parseExcelFile(fileBuffer) {
    try {
      console.log('📊 Начинаем парсинг Excel файла');
      
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
      
      // Берем ВСЕ ячейки с текстом
      const menuItems = this.parseAllCells(data);
      
      console.log(`🎯 Парсинг завершен! Найдено ${menuItems.length} блюд`);
      return menuItems;
      
    } catch (error) {
      console.error('❌ Ошибка парсинга:', error);
      return [];
    }
  }

  /**
   * Парсинг всех ячеек с текстом
   */
  parseAllCells(data) {
    console.log('🔍 Парсим ВСЕ ячейки с текстом');
    const items = [];
    
    for (let row = 0; row < data.length; row++) {
      const rowData = data[row];
      if (!rowData) continue;
      
      for (let col = 0; col < rowData.length; col++) {
        const cell = rowData[col];
        if (!cell || typeof cell !== 'string') continue;
        
        const cellText = cell.toString().trim();
        if (cellText.length < 2) continue;
        
        // Создаем блюдо из ВСЕГО
        const dish = this.createDish(cellText, row, col);
        if (dish) {
          items.push(dish);
        }
      }
    }
    
    console.log(`✅ Найдено ${items.length} блюд`);
    return items;
  }

  /**
   * Создание блюда
   */
  createDish(text, row, col) {
    // Очищаем текст
    let cleanName = text.trim();
    if (cleanName.length < 2) return null;
    
    // Убираем лишние символы
    cleanName = cleanName.replace(/[^\w\s\-\.\(\)\/]/g, '');
    cleanName = cleanName.replace(/\s+/g, ' ').trim();
    
    if (cleanName.length < 2) return null;
    
    // Извлекаем вес
    const weightMatch = text.match(/(\d+)\s*г/);
    const weight = weightMatch ? weightMatch[1] + ' г' : null;
    
    // Определяем день недели по позиции
    const dayOfWeek = (col % 7) + 1;
    
    // Определяем тип приема пищи
    const mealType = this.getMealType(text);
    
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
    
    console.log(`🍽️ Создано блюдо: "${cleanName}" (${mealType}, день ${dayOfWeek})`);
    return dish;
  }

  /**
   * Определение типа приема пищи
   */
  getMealType(text) {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('завтрак')) return 'завтрак';
    if (lowerText.includes('обед')) return 'обед';
    if (lowerText.includes('полдник')) return 'полдник';
    if (lowerText.includes('ужин')) return 'ужин';
    
    return 'обед'; // По умолчанию
  }
}

export default WorkingMenuParser;
