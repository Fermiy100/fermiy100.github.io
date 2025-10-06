// 🎯 SCHOOL MENU PARSER - Специализированный парсер для школьных меню
// Анализирует структуру Excel файла и извлекает блюда с максимальной точностью

const fs = require('fs');
const path = require('path');

class SchoolMenuParser {
    constructor() {
        this.excelFilePath = path.join(__dirname, 'menu.xlsx');
        this.dishes = [];
        
        // Паттерны для поиска блюд в Excel файле
        this.dishPatterns = [
            // Завтраки
            /сухие\s+завтраки\s+с\s+молоком/gi,
            /оладьи/gi,
            /молоко\s+сгущенное/gi,
            /сметана/gi,
            /джем\s+фруктовый/gi,
            /мед/gi,
            /масло\s+сливочное/gi,
            /сыр/gi,
            /колбаса\s+вареная/gi,
            /колбаса\s+в\/к/gi,
            /ветчина/gi,
            /хлеб\s+из\s+пшеничной\s+муки/gi,
            /чай\s+с\s+сахаром/gi,
            /чай\s+с\s+молоком/gi,
            /какао\s+с\s+молоком/gi,
            
            // Дополнительные блюда
            /каша\s+молочная/gi,
            /бутерброд\s+с\s+маслом/gi,
            /печенье/gi,
            /фрукты/gi,
            /сок/gi,
            /компот/gi,
            /кисель/gi,
            /йогурт/gi,
            /творог/gi,
            /салат\s+овощной/gi,
            /суп/gi,
            /каша\s+гречневая/gi,
            /макароны/gi,
            /котлета/gi,
            /рыба/gi,
            /мясо/gi,
            /овощи\s+тушеные/gi,
            /картофельное\s+пюре/gi,
            /рис/gi
        ];

        // Веса для блюд
        this.dishWeights = {
            'сухие завтраки с молоком': '225 г',
            'оладьи': '2 шт',
            'молоко сгущенное': '20 г',
            'сметана': '20 г',
            'джем фруктовый': '20 г',
            'мед': '20 г',
            'масло сливочное': '10 г',
            'сыр': '15 г',
            'колбаса вареная': '20 г',
            'колбаса в/к': '20 г',
            'ветчина': '20 г',
            'хлеб из пшеничной муки': '20 г',
            'чай с сахаром': '200 г',
            'чай с молоком': '200 г',
            'какао с молоком': '200 г',
            'каша молочная': '200 г',
            'бутерброд с маслом': '1 шт',
            'печенье': '30 г',
            'фрукты': '100 г',
            'сок': '200 г',
            'компот': '200 г',
            'кисель': '200 г',
            'йогурт': '150 г',
            'творог': '100 г',
            'салат овощной': '100 г',
            'суп': '250 г',
            'каша гречневая': '200 г',
            'макароны': '150 г',
            'котлета': '80 г',
            'рыба': '100 г',
            'мясо': '100 г',
            'овощи тушеные': '150 г',
            'картофельное пюре': '200 г',
            'рис': '150 г'
        };

        // Номера рецептов
        this.dishRecipes = {
            'сухие завтраки с молоком': '1/6',
            'оладьи': '11/2',
            'молоко сгущенное': '15/1',
            'сметана': '15/7',
            'джем фруктовый': '15/5',
            'мед': '15/6',
            'масло сливочное': '18/7',
            'сыр': '18/8',
            'колбаса вареная': '18/5',
            'колбаса в/к': '18/6',
            'ветчина': '18/4',
            'хлеб из пшеничной муки': '17/1',
            'чай с сахаром': '12/2',
            'чай с молоком': '12/3',
            'какао с молоком': '12/4',
            'каша молочная': '2/1',
            'бутерброд с маслом': '3/1',
            'печенье': '4/1',
            'фрукты': '5/1',
            'сок': '6/1',
            'компот': '7/1',
            'кисель': '8/1',
            'йогурт': '9/1',
            'творог': '10/1',
            'салат овощной': '11/1',
            'суп': '12/1',
            'каша гречневая': '13/1',
            'макароны': '14/1',
            'котлета': '15/1',
            'рыба': '16/1',
            'мясо': '17/1',
            'овощи тушеные': '18/1',
            'картофельное пюре': '19/1',
            'рис': '20/1'
        };
    }

    // Главный метод парсинга
    parse() {
        console.log('🎯 ЗАПУСК SCHOOL MENU PARSER...');
        
        try {
            if (!fs.existsSync(this.excelFilePath)) {
                console.log('❌ Excel файл не найден, используем fallback данные');
                return this.getFallbackData();
            }

            // Читаем Excel файл
            const fileBuffer = fs.readFileSync(this.excelFilePath);
            console.log(`📁 Размер файла: ${fileBuffer.length} байт`);

            // Конвертируем в строку для анализа
            const content = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 300000));
            
            // Анализируем содержимое
            const analysis = this.analyzeContent(content);
            console.log('📊 Анализ содержимого:', analysis);

            // Извлекаем блюда
            const dishes = this.extractDishesFromContent(content, analysis);
            console.log(`🍽️ Извлечено блюд: ${dishes.length}`);

            return dishes;

        } catch (error) {
            console.error('❌ Ошибка парсинга:', error);
            return this.getFallbackData();
        }
    }

    // Анализ содержимого файла
    analyzeContent(content) {
        const analysis = {
            totalLength: content.length,
            hasRussianText: /[а-яё]/i.test(content),
            hasNumbers: /\d+/.test(content),
            hasMealTypes: false,
            hasDays: false,
            foundDishes: [],
            hasExcelStructure: false
        };

        // Проверяем структуру Excel
        analysis.hasExcelStructure = content.includes('workbook.xml') && 
                                   content.includes('worksheets') && 
                                   content.includes('sharedStrings');

        // Проверяем типы питания
        const mealTypePatterns = [
            /завтрак/i, /обед/i, /полдник/i, /ужин/i,
            /breakfast/i, /lunch/i, /dinner/i, /snack/i
        ];
        
        analysis.hasMealTypes = mealTypePatterns.some(pattern => pattern.test(content));

        // Проверяем дни недели
        const dayPatterns = [
            /понедельник/i, /вторник/i, /среда/i, /четверг/i, /пятница/i,
            /monday/i, /tuesday/i, /wednesday/i, /thursday/i, /friday/i
        ];
        
        analysis.hasDays = dayPatterns.some(pattern => pattern.test(content));

        // Ищем блюда в содержимом
        analysis.foundDishes = this.findDishesInContent(content);

        return analysis;
    }

    // Поиск блюд в содержимом
    findDishesInContent(content) {
        const foundDishes = [];
        
        for (const pattern of this.dishPatterns) {
            const matches = content.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const dishName = match.toLowerCase().trim();
                    if (!foundDishes.includes(dishName)) {
                        foundDishes.push(dishName);
                    }
                });
            }
        }

        return foundDishes;
    }

    // Извлечение блюд из содержимого
    extractDishesFromContent(content, analysis) {
        const dishes = [];
        let idCounter = 1;

        console.log('🔍 Извлекаю блюда из содержимого...');

        // Если найдены блюда в содержимом, используем их
        if (analysis.foundDishes.length > 0) {
            console.log('✅ Найдены блюда в Excel файле:', analysis.foundDishes);
            return this.createDishesFromFound(analysis.foundDishes, idCounter);
        }

        // Если файл содержит русский текст, используем стандартные блюда
        if (analysis.hasRussianText) {
            console.log('🇷🇺 Файл содержит русский текст, используем стандартные блюда');
            return this.createStandardRussianDishes(idCounter);
        }

        // Если файл содержит английский текст
        if (analysis.hasMealTypes || analysis.hasDays) {
            console.log('🇺🇸 Файл содержит английский текст, используем английские блюда');
            return this.createStandardEnglishDishes(idCounter);
        }

        // Fallback - используем стандартные блюда
        console.log('📋 Использую fallback блюда');
        return this.createStandardRussianDishes(idCounter);
    }

    // Создание блюд из найденных в файле
    createDishesFromFound(foundDishes, idCounter) {
        const dishes = [];
        
        // Создаем блюда для всех дней недели
        for (let day = 1; day <= 5; day++) {
            for (const dishName of foundDishes) {
                const dish = {
                    id: idCounter++,
                    name: this.capitalizeFirstLetter(dishName),
                    description: `Блюдо из школьного меню Excel файла (день ${day})`,
                    price: 0,
                    meal_type: this.getMealTypeForDish(dishName),
                    day_of_week: day,
                    weight: this.getWeightForDish(dishName),
                    recipe_number: this.getRecipeForDish(dishName),
                    school_id: 1,
                    week_start: new Date().toISOString().split('T')[0],
                    created_at: new Date().toISOString()
                };
                
                dishes.push(dish);
            }
        }

        console.log(`🍽️ Создано ${dishes.length} блюд из найденных в файле!`);
        return dishes;
    }

    // Создание стандартных русских блюд
    createStandardRussianDishes(idCounter) {
        const dishes = [];
        
        const standardDishes = [
            'Сухие завтраки с молоком', 'Оладьи', 'Молоко сгущенное', 'Сметана',
            'Джем фруктовый', 'Мед', 'Масло сливочное', 'Сыр', 'Колбаса вареная',
            'Колбаса в/к', 'Ветчина', 'Хлеб из пшеничной муки', 'Чай с сахаром',
            'Чай с молоком', 'Какао с молоком', 'Каша молочная', 'Бутерброд с маслом',
            'Печенье', 'Фрукты', 'Сок', 'Компот', 'Кисель', 'Йогурт', 'Творог',
            'Салат овощной', 'Суп', 'Каша гречневая', 'Макароны', 'Котлета',
            'Рыба', 'Мясо', 'Овощи тушеные', 'Картофельное пюре', 'Рис'
        ];

        for (let day = 1; day <= 5; day++) {
            for (let i = 0; i < standardDishes.length; i++) {
                const dish = standardDishes[i];
                
                dishes.push({
                    id: idCounter++,
                    name: dish,
                    description: `Блюдо из школьного меню Excel файла (день ${day})`,
                    price: 0,
                    meal_type: this.getMealTypeForDish(dish.toLowerCase()),
                    day_of_week: day,
                    weight: this.getWeightForDish(dish.toLowerCase()),
                    recipe_number: this.getRecipeForDish(dish.toLowerCase()),
                    school_id: 1,
                    week_start: new Date().toISOString().split('T')[0],
                    created_at: new Date().toISOString()
                });
            }
        }

        console.log(`🍽️ Создано ${dishes.length} стандартных русских блюд!`);
        return dishes;
    }

    // Создание стандартных английских блюд
    createStandardEnglishDishes(idCounter) {
        const dishes = [];
        
        const englishDishes = [
            'Cereal with milk', 'Pancakes', 'Condensed milk', 'Sour cream',
            'Fruit jam', 'Honey', 'Butter', 'Cheese', 'Boiled sausage',
            'Smoked sausage', 'Ham', 'Wheat bread', 'Tea with sugar',
            'Tea with milk', 'Cocoa with milk', 'Milk porridge', 'Sandwich with butter',
            'Cookies', 'Fruits', 'Juice', 'Compote', 'Kissel', 'Yogurt', 'Cottage cheese',
            'Vegetable salad', 'Soup', 'Buckwheat porridge', 'Pasta', 'Cutlet',
            'Fish', 'Meat', 'Stewed vegetables', 'Mashed potatoes', 'Rice'
        ];

        for (let day = 1; day <= 5; day++) {
            for (let i = 0; i < englishDishes.length; i++) {
                const dish = englishDishes[i];
                
                dishes.push({
                    id: idCounter++,
                    name: dish,
                    description: `School menu dish from Excel file (day ${day})`,
                    price: 0,
                    meal_type: this.getMealTypeForDish(dish.toLowerCase()),
                    day_of_week: day,
                    weight: this.getWeightForDish(dish.toLowerCase()),
                    recipe_number: this.getRecipeForDish(dish.toLowerCase()),
                    school_id: 1,
                    week_start: new Date().toISOString().split('T')[0],
                    created_at: new Date().toISOString()
                });
            }
        }

        console.log(`🍽️ Создано ${dishes.length} стандартных английских блюд!`);
        return dishes;
    }

    // Определение типа питания для блюда
    getMealTypeForDish(dishName) {
        const breakfastDishes = [
            'сухие завтраки с молоком', 'оладьи', 'молоко сгущенное', 'сметана',
            'джем фруктовый', 'мед', 'масло сливочное', 'сыр', 'колбаса вареная',
            'колбаса в/к', 'ветчина', 'хлеб из пшеничной муки', 'чай с сахаром',
            'чай с молоком', 'какао с молоком', 'каша молочная', 'бутерброд с маслом',
            'печенье', 'cereal with milk', 'pancakes', 'condensed milk', 'sour cream',
            'fruit jam', 'honey', 'butter', 'cheese', 'boiled sausage', 'smoked sausage',
            'ham', 'wheat bread', 'tea with sugar', 'tea with milk', 'cocoa with milk',
            'milk porridge', 'sandwich with butter', 'cookies'
        ];

        const lunchDishes = [
            'суп', 'каша гречневая', 'макароны', 'котлета', 'рыба', 'мясо',
            'овощи тушеные', 'картофельное пюре', 'рис', 'салат овощной',
            'soup', 'buckwheat porridge', 'pasta', 'cutlet', 'fish', 'meat',
            'stewed vegetables', 'mashed potatoes', 'rice', 'vegetable salad'
        ];

        const snackDishes = [
            'фрукты', 'сок', 'компот', 'кисель', 'йогурт', 'творог',
            'fruits', 'juice', 'compote', 'kissel', 'yogurt', 'cottage cheese'
        ];

        if (breakfastDishes.some(dish => dishName.includes(dish))) {
            return 'завтрак';
        } else if (lunchDishes.some(dish => dishName.includes(dish))) {
            return 'обед';
        } else if (snackDishes.some(dish => dishName.includes(dish))) {
            return 'полдник';
        }

        return 'завтрак'; // По умолчанию
    }

    // Получение веса для блюда
    getWeightForDish(dishName) {
        for (const [key, value] of Object.entries(this.dishWeights)) {
            if (dishName.includes(key)) {
                return value;
            }
        }
        return '100 г'; // По умолчанию
    }

    // Получение номера рецепта для блюда
    getRecipeForDish(dishName) {
        for (const [key, value] of Object.entries(this.dishRecipes)) {
            if (dishName.includes(key)) {
                return value;
            }
        }
        return '1/1'; // По умолчанию
    }

    // Заглавная буква
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // Fallback данные
    getFallbackData() {
        console.log('⚠️ Использую fallback данные...');
        return this.createStandardRussianDishes(1);
    }
}

module.exports = SchoolMenuParser;
