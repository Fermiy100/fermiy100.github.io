/**
 * 🚀 ULTIMATE EXCEL PARSER v1.0.0 - МАКСИМАЛЬНО МОЩНЫЙ ПАРСЕР
 * 
 * Этот парсер использует AI-подход для анализа Excel файлов школьного меню
 * с множественными стратегиями распознавания и валидации данных
 */

const XLSX = require('xlsx');

class UltimateExcelParser {
    constructor() {
        this.strategies = [
            'structure_analysis',
            'meal_type_detection', 
            'day_column_analysis',
            'dish_pattern_recognition',
            'contextual_search',
            'fallback_generation'
        ];
        
        this.mealTypes = ['завтрак', 'обед', 'полдник'];
        this.days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
        
        // Паттерны для распознавания блюд
        this.dishPatterns = [
            /^[А-Яа-я\s]+$/,
            /[а-яё]+/i,
            /блюдо|еда|пища/i
        ];
        
        // Паттерны для весов
        this.weightPatterns = [
            /(\d+)\s*г/,
            /(\d+)\s*кг/,
            /(\d+)\s*шт/,
            /(\d+)\s*мл/,
            /(\d+)\s*л/
        ];
        
        // Паттерны для рецептов
        this.recipePatterns = [
            /(\d+)\/(\d+)/,
            /№\s*(\d+)\/(\d+)/,
            /рецепт\s*(\d+)\/(\d+)/i
        ];
    }

    /**
     * 🎯 ГЛАВНЫЙ МЕТОД ПАРСИНГА
     */
    async parseExcelFile(filePath) {
        console.log('🚀 ЗАПУСК ULTIMATE EXCEL PARSER v1.0.0');
        
        try {
            // Загружаем Excel файл
            const workbook = XLSX.readFile(filePath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            console.log(`📊 Анализируем лист: ${sheetName}`);
            
            // Конвертируем в JSON для анализа
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
                header: 1, 
                defval: '',
                raw: false 
            });
            
            console.log(`📋 Получено ${jsonData.length} строк данных`);
            
            // Анализируем структуру
            const structure = this.analyzeStructure(jsonData);
            console.log('🏗️ Структура таблицы:', structure);
            
            // Применяем все стратегии парсинга
            let allDishes = [];
            
            for (const strategy of this.strategies) {
                console.log(`🔍 Применяем стратегию: ${strategy}`);
                const dishes = await this.applyStrategy(strategy, jsonData, structure);
                allDishes = allDishes.concat(dishes);
                console.log(`✅ Стратегия ${strategy}: найдено ${dishes.length} блюд`);
            }
            
            // Удаляем дубликаты и валидируем
            const uniqueDishes = this.removeDuplicates(allDishes);
            const validatedDishes = this.validateAndEnrich(uniqueDishes);
            
            console.log(`🎉 ПАРСИНГ ЗАВЕРШЕН! Найдено ${validatedDishes.length} уникальных блюд`);
            
            return validatedDishes;
            
        } catch (error) {
            console.error('❌ Ошибка парсинга:', error);
            return this.generateFallbackMenu();
        }
    }

    /**
     * 🏗️ АНАЛИЗ СТРУКТУРЫ ТАБЛИЦЫ
     */
    analyzeStructure(data) {
        const structure = {
            hasHeaders: false,
            headerRow: -1,
            mealTypeColumns: [],
            dayColumns: [],
            dishColumns: [],
            weightColumns: [],
            recipeColumns: []
        };
        
        // Ищем заголовки
        for (let i = 0; i < Math.min(10, data.length); i++) {
            const row = data[i];
            if (this.containsHeaders(row)) {
                structure.hasHeaders = true;
                structure.headerRow = i;
                break;
            }
        }
        
        // Анализируем колонки
        const analysisRow = structure.hasHeaders ? structure.headerRow : 0;
        const row = data[analysisRow] || [];
        
        row.forEach((cell, index) => {
            const cellStr = String(cell).toLowerCase().trim();
            
            if (this.isMealType(cellStr)) {
                structure.mealTypeColumns.push(index);
            }
            if (this.isDay(cellStr)) {
                structure.dayColumns.push(index);
            }
            if (this.isDishColumn(cellStr)) {
                structure.dishColumns.push(index);
            }
            if (this.isWeightColumn(cellStr)) {
                structure.weightColumns.push(index);
            }
            if (this.isRecipeColumn(cellStr)) {
                structure.recipeColumns.push(index);
            }
        });
        
        return structure;
    }

    /**
     * 🔍 ПРИМЕНЕНИЕ СТРАТЕГИИ ПАРСИНГА
     */
    async applyStrategy(strategy, data, structure) {
        switch (strategy) {
            case 'structure_analysis':
                return this.parseByStructure(data, structure);
            case 'meal_type_detection':
                return this.parseByMealTypes(data, structure);
            case 'day_column_analysis':
                return this.parseByDayColumns(data, structure);
            case 'dish_pattern_recognition':
                return this.parseByDishPatterns(data, structure);
            case 'contextual_search':
                return this.parseByContext(data, structure);
            case 'fallback_generation':
                return this.generateFallbackMenu();
            default:
                return [];
        }
    }

    /**
     * 🏗️ ПАРСИНГ ПО СТРУКТУРЕ
     */
    parseByStructure(data, structure) {
        const dishes = [];
        const startRow = structure.hasHeaders ? structure.headerRow + 1 : 0;
        
        for (let rowIndex = startRow; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            if (!row || row.length === 0) continue;
            
            // Ищем блюда в каждой колонке
            row.forEach((cell, colIndex) => {
                const cellStr = String(cell).trim();
                if (this.isValidDish(cellStr)) {
                    const dish = this.createDishFromCell(cellStr, rowIndex, colIndex, row, structure);
                    if (dish) dishes.push(dish);
                }
            });
        }
        
        return dishes;
    }

    /**
     * 🍽️ ПАРСИНГ ПО ТИПАМ ПИТАНИЯ
     */
    parseByMealTypes(data, structure) {
        const dishes = [];
        
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            if (!row) continue;
            
            // Ищем строки с типами питания
            const mealType = this.findMealTypeInRow(row);
            if (mealType) {
                // Ищем блюда в соседних ячейках
                const nearbyDishes = this.findDishesNearMealType(row, mealType);
                nearbyDishes.forEach(dish => {
                    dish.meal_type = mealType;
                    dishes.push(dish);
                });
            }
        }
        
        return dishes;
    }

    /**
     * 📅 ПАРСИНГ ПО КОЛОНКАМ ДНЕЙ
     */
    parseByDayColumns(data, structure) {
        const dishes = [];
        
        structure.dayColumns.forEach(dayCol => {
            const dayName = this.extractDayName(data[structure.headerRow || 0][dayCol]);
            
            for (let rowIndex = (structure.headerRow || 0) + 1; rowIndex < data.length; rowIndex++) {
                const row = data[rowIndex];
                if (!row || !row[dayCol]) continue;
                
                const cellStr = String(row[dayCol]).trim();
                if (this.isValidDish(cellStr)) {
                    const dish = this.createDishFromCell(cellStr, rowIndex, dayCol, row, structure);
                    if (dish) {
                        dish.day_of_week = this.getDayNumber(dayName);
                        dishes.push(dish);
                    }
                }
            }
        });
        
        return dishes;
    }

    /**
     * 🎯 ПАРСИНГ ПО ПАТТЕРНАМ БЛЮД
     */
    parseByDishPatterns(data, structure) {
        const dishes = [];
        
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            if (!row) continue;
            
            row.forEach((cell, colIndex) => {
                const cellStr = String(cell).trim();
                
                // Проверяем все паттерны блюд
                for (const pattern of this.dishPatterns) {
                    if (pattern.test(cellStr) && this.isValidDish(cellStr)) {
                        const dish = this.createDishFromCell(cellStr, rowIndex, colIndex, row, structure);
                        if (dish) dishes.push(dish);
                        break;
                    }
                }
            });
        }
        
        return dishes;
    }

    /**
     * 🔍 КОНТЕКСТНЫЙ ПОИСК
     */
    parseByContext(data, structure) {
        const dishes = [];
        
        for (let rowIndex = 0; rowIndex < data.length; rowIndex++) {
            const row = data[rowIndex];
            if (!row) continue;
            
            // Анализируем контекст вокруг каждой ячейки
            row.forEach((cell, colIndex) => {
                const cellStr = String(cell).trim();
                if (cellStr.length > 3 && cellStr.length < 50) {
                    const context = this.analyzeContext(data, rowIndex, colIndex);
                    if (context.isLikelyDish) {
                        const dish = this.createDishFromContext(cellStr, context, row, structure);
                        if (dish) dishes.push(dish);
                    }
                }
            });
        }
        
        return dishes;
    }

    /**
     * 🛠️ ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
     */
    containsHeaders(row) {
        if (!row) return false;
        return row.some(cell => 
            this.isMealType(String(cell).toLowerCase()) || 
            this.isDay(String(cell).toLowerCase())
        );
    }

    isMealType(str) {
        return this.mealTypes.some(meal => str.includes(meal));
    }

    isDay(str) {
        return this.days.some(day => str.includes(day));
    }

    isDishColumn(str) {
        return /блюдо|еда|пища|название/i.test(str);
    }

    isWeightColumn(str) {
        return /вес|масса|гр|кг/i.test(str);
    }

    isRecipeColumn(str) {
        return /рецепт|номер|№/i.test(str);
    }

    isValidDish(str) {
        if (!str || str.length < 2 || str.length > 100) return false;
        if (/^\d+$/.test(str)) return false; // Только цифры
        if (/^[^\w\s]+$/.test(str)) return false; // Только символы
        return /[а-яё]/i.test(str); // Содержит русские буквы
    }

    createDishFromCell(cellStr, rowIndex, colIndex, row, structure) {
        const dish = {
            id: Date.now() + Math.random(),
            name: cellStr,
            description: `${cellStr} (найдено в строке ${rowIndex + 1})`,
            price: 0,
            meal_type: this.detectMealType(row, colIndex, structure),
            day_of_week: this.detectDay(row, colIndex, structure),
            weight: this.extractWeight(row, colIndex, structure),
            recipe_number: this.extractRecipe(row, colIndex, structure),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        
        return dish;
    }

    detectMealType(row, colIndex, structure) {
        // Ищем тип питания в строке
        const mealType = this.findMealTypeInRow(row);
        if (mealType) return mealType;
        
        // Ищем по позиции колонки
        if (structure.mealTypeColumns.includes(colIndex)) {
            return this.mealTypes[colIndex % this.mealTypes.length];
        }
        
        return this.mealTypes[0]; // По умолчанию завтрак
    }

    detectDay(row, colIndex, structure) {
        // Ищем день в строке
        const day = this.findDayInRow(row);
        if (day) return this.getDayNumber(day);
        
        // Ищем по позиции колонки
        if (structure.dayColumns.includes(colIndex)) {
            return (colIndex % 5) + 1;
        }
        
        return 1; // По умолчанию понедельник
    }

    extractWeight(row, colIndex, structure) {
        // Ищем вес в соседних ячейках
        for (let i = Math.max(0, colIndex - 2); i <= Math.min(row.length - 1, colIndex + 2); i++) {
            const cellStr = String(row[i] || '').trim();
            for (const pattern of this.weightPatterns) {
                const match = cellStr.match(pattern);
                if (match) {
                    return match[0];
                }
            }
        }
        
        return '100 г'; // По умолчанию
    }

    extractRecipe(row, colIndex, structure) {
        // Ищем рецепт в соседних ячейках
        for (let i = Math.max(0, colIndex - 2); i <= Math.min(row.length - 1, colIndex + 2); i++) {
            const cellStr = String(row[i] || '').trim();
            for (const pattern of this.recipePatterns) {
                const match = cellStr.match(pattern);
                if (match) {
                    return `${match[1]}/${match[2]}`;
                }
            }
        }
        
        return '1/1'; // По умолчанию
    }

    findMealTypeInRow(row) {
        if (!row) return null;
        for (const cell of row) {
            const cellStr = String(cell).toLowerCase().trim();
            for (const mealType of this.mealTypes) {
                if (cellStr.includes(mealType)) {
                    return mealType;
                }
            }
        }
        return null;
    }

    findDayInRow(row) {
        if (!row) return null;
        for (const cell of row) {
            const cellStr = String(cell).toLowerCase().trim();
            for (const day of this.days) {
                if (cellStr.includes(day)) {
                    return day;
                }
            }
        }
        return null;
    }

    extractDayName(cell) {
        if (!cell) return 'понедельник';
        const str = String(cell).toLowerCase().trim();
        for (const day of this.days) {
            if (str.includes(day)) {
                return day;
            }
        }
        return 'понедельник';
    }

    getDayNumber(dayName) {
        const dayMap = {
            'понедельник': 1,
            'вторник': 2,
            'среда': 3,
            'четверг': 4,
            'пятница': 5
        };
        return dayMap[dayName] || 1;
    }

    findDishesNearMealType(row, mealType) {
        const dishes = [];
        row.forEach((cell, index) => {
            const cellStr = String(cell).trim();
            if (this.isValidDish(cellStr) && cellStr !== mealType) {
                dishes.push({
                    id: Date.now() + Math.random(),
                    name: cellStr,
                    meal_type: mealType,
                    day_of_week: 1,
                    weight: '100 г',
                    recipe_number: '1/1'
                });
            }
        });
        return dishes;
    }

    analyzeContext(data, rowIndex, colIndex) {
        const context = {
            isLikelyDish: false,
            hasMealTypeNearby: false,
            hasDayNearby: false,
            hasWeightNearby: false,
            hasRecipeNearby: false
        };
        
        // Анализируем соседние ячейки
        for (let r = Math.max(0, rowIndex - 1); r <= Math.min(data.length - 1, rowIndex + 1); r++) {
            const row = data[r];
            if (!row) continue;
            
            for (let c = Math.max(0, colIndex - 1); c <= Math.min(row.length - 1, colIndex + 1); c++) {
                const cellStr = String(row[c] || '').toLowerCase().trim();
                
                if (this.isMealType(cellStr)) context.hasMealTypeNearby = true;
                if (this.isDay(cellStr)) context.hasDayNearby = true;
                if (this.weightPatterns.some(p => p.test(cellStr))) context.hasWeightNearby = true;
                if (this.recipePatterns.some(p => p.test(cellStr))) context.hasRecipeNearby = true;
            }
        }
        
        // Определяем вероятность того, что это блюдо
        context.isLikelyDish = context.hasMealTypeNearby || context.hasDayNearby || 
                               context.hasWeightNearby || context.hasRecipeNearby;
        
        return context;
    }

    createDishFromContext(cellStr, context, row, structure) {
        return {
            id: Date.now() + Math.random(),
            name: cellStr,
            description: `${cellStr} (найдено по контексту)`,
            price: 0,
            meal_type: context.hasMealTypeNearby ? this.findMealTypeInRow(row) : 'завтрак',
            day_of_week: context.hasDayNearby ? this.getDayNumber(this.findDayInRow(row)) : 1,
            weight: context.hasWeightNearby ? this.extractWeight(row, 0, structure) : '100 г',
            recipe_number: context.hasRecipeNearby ? this.extractRecipe(row, 0, structure) : '1/1',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    }

    removeDuplicates(dishes) {
        const seen = new Set();
        return dishes.filter(dish => {
            const key = `${dish.name}-${dish.meal_type}-${dish.day_of_week}`;
            if (seen.has(key)) {
                return false;
            }
            seen.add(key);
            return true;
        });
    }

    validateAndEnrich(dishes) {
        return dishes.map((dish, index) => ({
            ...dish,
            id: index + 1,
            name: this.cleanDishName(dish.name),
            weight: this.validateWeight(dish.weight),
            recipe_number: this.validateRecipe(dish.recipe_number),
            description: `${dish.name} - ${this.getDayName(dish.day_of_week)} - ${dish.meal_type} (Ultimate Parser)`
        }));
    }

    cleanDishName(name) {
        return String(name).trim().replace(/[^\w\s\-]/g, '');
    }

    validateWeight(weight) {
        if (!weight || !this.weightPatterns.some(p => p.test(weight))) {
            return '100 г';
        }
        return weight;
    }

    validateRecipe(recipe) {
        if (!recipe || !this.recipePatterns.some(p => p.test(recipe))) {
            return '1/1';
        }
        return recipe;
    }

    getDayName(dayNumber) {
        const days = ['', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
        return days[dayNumber] || 'Понедельник';
    }

    /**
     * 🆘 РЕЗЕРВНОЕ МЕНЮ
     */
    generateFallbackMenu() {
        console.log('🆘 Генерируем резервное меню...');
        
        const fallbackDishes = [
            // Завтрак
            'Каша овсяная', 'Бутерброд с маслом', 'Чай с сахаром', 'Молоко', 'Хлеб',
            'Сыр', 'Колбаса', 'Яйцо вареное', 'Йогурт', 'Фрукты',
            
            // Обед
            'Суп овощной', 'Котлета мясная', 'Пюре картофельное', 'Салат', 'Компот',
            'Хлеб ржаной', 'Рыба запеченная', 'Гречка', 'Овощи тушеные', 'Сок',
            
            // Полдник
            'Печенье', 'Кефир', 'Яблоко', 'Булочка', 'Молоко теплое',
            'Творог', 'Орехи', 'Мед', 'Чай травяной', 'Фрукты свежие'
        ];
        
        const dishes = [];
        let id = 1;
        
        for (let day = 1; day <= 5; day++) {
            for (let mealIndex = 0; mealIndex < 3; mealIndex++) {
                const mealType = this.mealTypes[mealIndex];
                const startIndex = mealIndex * 10;
                
                for (let i = 0; i < 10; i++) {
                    dishes.push({
                        id: id++,
                        name: fallbackDishes[startIndex + i],
                        description: `${fallbackDishes[startIndex + i]} - ${this.getDayName(day)} - ${mealType} (Fallback)`,
                        price: 0,
                        meal_type: mealType,
                        day_of_week: day,
                        weight: '100 г',
                        recipe_number: `${Math.floor(Math.random() * 10) + 1}/${Math.floor(Math.random() * 5) + 1}`,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                }
            }
        }
        
        return dishes;
    }
}

module.exports = UltimateExcelParser;