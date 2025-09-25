import * as XLSX from 'xlsx';

export interface ParsedMenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  mealType: string;
  dayOfWeek: number;
  portion?: string;
  raw?: string;
}

export interface ParsedMenu {
  items: ParsedMenuItem[];
  week: string;
  title?: string;
}

// Функция для извлечения порции и цены из текста
function extractPortionAndPrice(text: string): { portion: string; price: number; cleanName: string } {
  let portion = '';
  let price = 0;
  let cleanName = text;

  // Ищем порцию (г, шт, мл и т.д.)
  const portionMatch = text.match(/(\d+\s*(г|шт|мл|л|кг|порц|порции?))/i);
  if (portionMatch) {
    portion = portionMatch[0];
    cleanName = cleanName.replace(portion, '').trim();
  }

  // Ищем цену (руб, ₽, р.)
  const priceMatch = text.match(/(\d+)\s*(руб|₽|р\.?)/i);
  if (priceMatch) {
    price = parseInt(priceMatch[1]);
    cleanName = cleanName.replace(priceMatch[0], '').trim();
  }

  // Очищаем лишние символы
  cleanName = cleanName.replace(/[,\-–—]/g, '').trim();

  return { portion, price, cleanName };
}

// Функция для определения дня недели по номеру колонки
function getDayOfWeek(columnIndex: number, _totalColumns: number, headers?: string[]): number {
  // Если есть заголовки, пытаемся найти день недели по названию
  if (headers && headers[columnIndex]) {
    const header = headers[columnIndex].toLowerCase();
    const dayMap: { [key: string]: number } = {
      'понедельник': 1, 'пн': 1, 'monday': 1, 'mon': 1,
      'вторник': 2, 'вт': 2, 'tuesday': 2, 'tue': 2,
      'среда': 3, 'ср': 3, 'wednesday': 3, 'wed': 3,
      'четверг': 4, 'чт': 4, 'thursday': 4, 'thu': 4,
      'пятница': 5, 'пт': 5, 'friday': 5, 'fri': 5,
      'суббота': 6, 'сб': 6, 'saturday': 6, 'sat': 6,
      'воскресенье': 7, 'вс': 7, 'sunday': 7, 'sun': 7
    };
    
    for (const [key, value] of Object.entries(dayMap)) {
      if (header.includes(key)) {
        return value;
      }
    }
  }
  
  // Если не нашли по названию, используем позицию
  // Предполагаем, что дни недели идут в порядке: Понедельник, Вторник, Среда, Четверг, Пятница
  // Первые несколько колонок могут быть служебными (номер, название и т.д.)
  const dayIndex = Math.max(0, columnIndex - 1); // -1 для служебных колонок
  return Math.min(dayIndex + 1, 5); // Понедельник = 1, Пятница = 5
}

// Функция для определения типа питания по тексту
function getMealType(text: string): string {
  const lowerText = text.toLowerCase();
  
  if (lowerText.includes('завтрак') || lowerText.includes('завтр')) return 'завтрак';
  if (lowerText.includes('обед')) return 'обед';
  if (lowerText.includes('полдник') || lowerText.includes('полд')) return 'полдник';
  if (lowerText.includes('ужин')) return 'ужин';
  if (lowerText.includes('дополнительный') || lowerText.includes('гарнир')) return 'дополнительно';
  
  return 'обед'; // По умолчанию
}

// Основная функция парсинга
export function parseMenuFile(file: File): Promise<ParsedMenu> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Ищем подходящий лист
        const sheetName = workbook.SheetNames.find(name => 
          /недель|меню|питание|заказ/i.test(name)
        ) || workbook.SheetNames[0];
        
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: false,
          defval: ''
        }) as any[][];

        if (!jsonData || jsonData.length === 0) {
          throw new Error('Пустой файл или лист');
        }

        const items: ParsedMenuItem[] = [];
        let currentMealType = 'обед';
        let itemId = 1;
        let headers: string[] = [];

        // Определяем заголовки (первая строка)
        if (jsonData.length > 0) {
          headers = jsonData[0].map(cell => (cell || '').toString().trim());
        }

        // Проходим по всем строкам
        for (let rowIndex = 0; rowIndex < jsonData.length; rowIndex++) {
          const row = jsonData[rowIndex];
          if (!row) continue;

          // Пропускаем пустые строки
          if (row.every(cell => !cell || cell.toString().trim() === '')) {
            continue;
          }

          // Проверяем, является ли строка заголовком типа питания
          const firstCell = (row[0] || '').toString().trim();
          if (firstCell) {
            const mealType = getMealType(firstCell);
            if (mealType !== 'обед' || firstCell.toLowerCase().includes('завтрак') || 
                firstCell.toLowerCase().includes('обед') || firstCell.toLowerCase().includes('полдник') ||
                firstCell.toLowerCase().includes('ужин') || firstCell.toLowerCase().includes('дополнительный')) {
              currentMealType = mealType;
              continue;
            }
          }

          // Обрабатываем строки с блюдами
          for (let colIndex = 1; colIndex < row.length; colIndex++) {
            const cellValue = (row[colIndex] || '').toString().trim();
            
            if (cellValue && cellValue.length > 2 && !cellValue.match(/^\d+$/)) {
              // Пропускаем служебные ячейки
              if (cellValue.includes('№') || cellValue.includes('кол') || 
                  cellValue.includes('иче') || cellValue.includes('ств') ||
                  cellValue.includes('порц') || cellValue.includes('количество') ||
                  cellValue.includes('недел') || cellValue.includes('день')) {
                continue;
              }

              const { portion, price, cleanName } = extractPortionAndPrice(cellValue);
              
              if (cleanName && cleanName.length > 1) {
                const dayOfWeek = getDayOfWeek(colIndex, row.length, headers);
                
                // Проверяем, что это действительно блюдо, а не служебная информация
                if (!cleanName.match(/^\d+$/) && 
                    !cleanName.includes('недел') && 
                    !cleanName.includes('день') &&
                    cleanName.length > 2) {
                  
                  items.push({
                    id: itemId++,
                    name: cleanName,
                    description: portion || undefined,
                    price: price || 0,
                    mealType: currentMealType,
                    dayOfWeek: dayOfWeek,
                    portion: portion,
                    raw: cellValue
                  });
                }
              }
            }
          }
        }

        // Извлекаем информацию о неделе из названия листа или файла
        const weekMatch = sheetName.match(/(\d+)\s*недел/i) || file.name.match(/(\d+)\s*недел/i);
        const week = weekMatch ? `Неделя ${weekMatch[1]}` : 'Текущая неделя';

        resolve({
          items,
          week,
          title: `Меню на ${week}`
        });

      } catch (error) {
        console.error('Ошибка парсинга Excel файла:', error);
        reject(new Error(`Не удалось обработать файл: ${error}`));
      }
    };

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };

    reader.readAsArrayBuffer(file);
  });
}

// Функция для валидации структуры файла
export function validateMenuFile(file: File): boolean {
  const fileName = file.name.toLowerCase();
  const validExtensions = ['.xlsx', '.xls'];
  
  return validExtensions.some(ext => fileName.endsWith(ext));
}

// Функция для предварительного просмотра файла
export function previewMenuFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          header: 1, 
          raw: false,
          defval: ''
        }) as any[][];

        const preview: string[] = [];
        const maxRows = Math.min(10, jsonData.length);
        
        for (let i = 0; i < maxRows; i++) {
          const row = jsonData[i];
          if (row) {
            preview.push(row.slice(0, 5).join(' | ')); // Первые 5 колонок
          }
        }
        
        resolve(preview);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла'));
    };

    reader.readAsArrayBuffer(file);
  });
}
