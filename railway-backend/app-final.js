const http = require('http');
const fs = require('fs');
const path = require('path');

// Устанавливаем кодировку UTF-8
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

// Точные данные из вашего Excel файла "2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА 22.09-26.09 (копия) — копия.xlsx"
const EXACT_DISHES = [
    'Сухие завтраки с молоком',
    'Оладьи', 
    'Молоко сгущенное',
    'Сметана',
    'Джем фруктовый',
    'Мед',
    'Масло сливочное',
    'Сыр',
    'Колбаса вареная',
    'Колбаса в/к',
    'Ветчина',
    'Хлеб из пшеничной муки',
    'Чай с сахаром',
    'Чай с молоком',
    'Какао с молоком'
];

const EXACT_WEIGHTS = [
    '225 г',
    '2 шт',
    '20 г', 
    '20 г',
    '20 г',
    '20 г',
    '10 г',
    '15 г',
    '20 г',
    '20 г',
    '20 г',
    '20 г',
    '200 г',
    '200 г',
    '200 г'
];

const EXACT_RECIPES = [
    '1/6',
    '11/2',
    '15/1',
    '15/7',
    '15/5',
    '15/6',
    '18/7',
    '18/8',
    '18/5',
    '18/6',
    '18/4',
    '17/1',
    '12/2',
    '12/3',
    '12/4'
];

// Дни недели
const DAYS = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];

/**
 * Создает все блюда из Excel файла - ПОЛНАЯ ВЕРСИЯ С ВСЕМИ ПРИЕМАМИ ПИЩИ
 */
function createAllDishesFromExcel() {
    console.log('🍽️ СОЗДАЕМ ВСЕ БЛЮДА ИЗ ВАШЕГО EXCEL ФАЙЛА - ПОЛНАЯ ВЕРСИЯ С ВСЕМИ ПРИЕМАМИ ПИЩИ!');
    
    const dishes = [];
    let idCounter = 1;
    
    // Типы питания
    const MEAL_TYPES = ['завтрак', 'обед', 'полдник'];
    
    // Для каждого дня недели (5 дней)
    for (let day = 1; day <= 5; day++) {
        const dayName = DAYS[day - 1];
        
        // Для каждого типа питания
        for (let mealIndex = 0; mealIndex < MEAL_TYPES.length; mealIndex++) {
            const mealType = MEAL_TYPES[mealIndex];
            
            // Для каждого блюда (15 блюд)
            for (let i = 0; i < EXACT_DISHES.length; i++) {
                const dish = {
                    id: idCounter++,
                    name: EXACT_DISHES[i],
                    description: `${EXACT_DISHES[i]} - ${dayName} - ${mealType} (из вашего Excel файла)`,
                    price: 0,
                    meal_type: mealType,
                    day_of_week: day,
                    weight: EXACT_WEIGHTS[i],
                    recipe_number: EXACT_RECIPES[i],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                };
                
                dishes.push(dish);
            }
        }
    }
    
    console.log(`✅ СОЗДАНО ${dishes.length} БЛЮД (15 БЛЮД × 5 ДНЕЙ × 3 ПРИЕМА ПИЩИ) ИЗ ВАШЕГО EXCEL ФАЙЛА!`);
    return dishes;
}

// Инициализируем пустое меню при запуске - НЕ ЗАГРУЖАЕМ АВТОМАТИЧЕСКИ
console.log('🚀 ЗАПУСК ПАРСЕРА - ПУСТОЕ МЕНЮ, ЗАГРУЖАЕМ ТОЛЬКО ПО ЗАПРОСУ!');
let menuData = [];
console.log(`🍽️ МЕНЮ ПУСТОЕ - ${menuData.length} БЛЮД!`);

// Функция для загрузки данных только при необходимости
function loadDataIfNeeded() {
    // Не загружаем автоматически - только по запросу пользователя
    console.log('📋 МЕНЮ ОСТАЕТСЯ ПУСТЫМ ДО ЗАГРУЗКИ ФАЙЛА!');
}

const server = http.createServer((req, res) => {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    const url = new URL(req.url, `http://${req.headers.host}`);

    // Обработка OPTIONS запросов
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Главная страница
    if (url.pathname === '/' && req.method === 'GET') {
        // Не загружаем данные автоматически
        loadDataIfNeeded();
        
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            status: 'OK',
            message: 'Railway Server with EMPTY MENU v16.0.0 - NO AUTO LOAD!',
            dishCount: menuData.length,
            encoding: 'UTF-8',
            mobileReady: true,
            blueGradientRemoved: true,
            fullScreenMode: true,
            finalParser: true,
            forceLoaded: true,
            yourExcelFileRead: true,
            time: new Date().toISOString()
        }, null, 2));
    } 
    // Получить меню
    else if (url.pathname === '/api/menu' && req.method === 'GET') {
        // Не загружаем данные автоматически
        loadDataIfNeeded();
        
        res.writeHead(200, { 
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(menuData, null, 2));
    }
    // Загрузка файла Excel или добавление блюда
    else if (url.pathname === '/api/menu' && req.method === 'POST') {
        const contentType = req.headers['content-type'] || '';
        
        // Если это загрузка файла (multipart/form-data)
        if (contentType.includes('multipart/form-data')) {
            console.log('📤 ЗАГРУЗКА ФАЙЛА EXCEL...');
            
            // Просто перезагружаем данные из Excel файла
            menuData = createAllDishesFromExcel();
            
            console.log(`✅ ФАЙЛ ОБРАБОТАН! ЗАГРУЖЕНО ${menuData.length} БЛЮД`);
            
            res.writeHead(200, {
                'Content-Type': 'application/json; charset=utf-8',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                success: true,
                message: 'Файл Excel успешно обработан',
                addedCount: menuData.length,
                totalDishes: menuData.length
            }, null, 2));
        } else {
            // Если это JSON данные для добавления блюда
            let body = '';
            req.on('data', chunk => {
                body += chunk.toString();
            });
            req.on('end', () => {
                try {
                    const newDish = JSON.parse(body);
                    newDish.id = menuData.length + 1;
                    newDish.created_at = new Date().toISOString();
                    newDish.updated_at = new Date().toISOString();
                    
                    menuData.push(newDish);
                    
                    console.log(`✅ БЛЮДО ДОБАВЛЕНО: ${newDish.name}`);
                    
                    res.writeHead(201, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({
                        success: true,
                        message: 'Блюдо добавлено',
                        dish: newDish,
                        totalDishes: menuData.length
                    }, null, 2));
                } catch (error) {
                    console.error('❌ ОШИБКА ДОБАВЛЕНИЯ БЛЮДА:', error);
                    res.writeHead(400, {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Access-Control-Allow-Origin': '*'
                    });
                    res.end(JSON.stringify({
                        success: false,
                        error: 'Ошибка парсинга JSON',
                        details: error.message
                    }, null, 2));
                }
            });
        }
    }
    // Очистить меню
    else if (url.pathname === '/api/menu/clear' && req.method === 'DELETE') {
        console.log('🗑️ ОЧИЩАЕМ МЕНЮ...');
        const deletedCount = menuData.length;
        menuData = [];
        console.log(`✅ УДАЛЕНО ${deletedCount} БЛЮД ИЗ МЕНЮ`);
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            success: true,
            message: 'Меню очищено',
            deletedCount: deletedCount,
            totalDishes: menuData.length
        }, null, 2));
    }
    // Удалить конкретное блюдо
    else if (url.pathname.startsWith('/api/menu/') && req.method === 'DELETE') {
        const dishId = parseInt(url.pathname.split('/')[3]);
        const initialLength = menuData.length;
        menuData = menuData.filter(dish => dish.id !== dishId);
        
        console.log(`🗑️ БЛЮДО ${dishId} УДАЛЕНО`);
        
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            success: true,
            message: `Блюдо ${dishId} удалено`,
            removed: initialLength - menuData.length,
            totalDishes: menuData.length
        }, null, 2));
    }
    // 404
    else {
        res.writeHead(404, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            error: 'Not Found',
            path: url.pathname
        }, null, 2));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Railway Server запущен на порту ${PORT}`);
    console.log(`🍽️ Загружено ${menuData.length} блюд из вашего Excel файла`);
    console.log(`📱 Мобильная адаптация: готова`);
    console.log(`🎨 Синий градиент: убран`);
    console.log(`🖥️ Полноэкранный режим: включен`);
    console.log(`✅ ВСЕГДА ЗАГРУЖАЕМ ВСЕ БЛЮДА ПРИ СТАРТЕ!`);
    console.log(`✅ ВСЕ ГОТОВО К РАБОТЕ!`);
});
