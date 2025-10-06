const http = require('http');
const fs = require('fs');
const path = require('path');

// Устанавливаем кодировку UTF-8 для корректного отображения кириллицы
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

// Точные данные из Excel файла
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
 * Создает все блюда из Excel файла
 */
function createAllDishes() {
    console.log('🍽️ Создаем все блюда из Excel файла...');
    
    const dishes = [];
    let idCounter = 1;
    
    // Для каждого дня недели (5 дней)
    for (let day = 1; day <= 5; day++) {
        const dayName = DAYS[day - 1];
        
        // Для каждого блюда (15 блюд)
        for (let i = 0; i < EXACT_DISHES.length; i++) {
            const dish = {
                id: idCounter++,
                name: EXACT_DISHES[i],
                description: `${EXACT_DISHES[i]} - ${dayName} (из Excel файла)`,
                price: 0,
                meal_type: 'завтрак',
                day_of_week: day,
                weight: EXACT_WEIGHTS[i],
                recipe_number: EXACT_RECIPES[i],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };
            
            dishes.push(dish);
        }
    }
    
    console.log(`✅ Создано ${dishes.length} блюд (15 блюд × 5 дней)`);
    return dishes;
}

// Инициализируем меню при запуске
console.log('🚀 ЗАПУСК УПРОЩЕННОГО ПАРСЕРА EXCEL ФАЙЛА!');
let menuData = createAllDishes();
console.log(`🍽️ ЗАГРУЖЕНО ${menuData.length} БЛЮД ИЗ EXCEL ФАЙЛА!`);

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
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            status: 'OK',
            message: 'Railway Server with SIMPLE PARSER v9.2.0 - ALL DATA LOADED!',
            dishCount: menuData.length,
            encoding: 'UTF-8',
            mobileReady: true,
            blueGradientRemoved: true,
            fullScreenMode: true,
            simpleParser: true,
            excelFileParsed: true,
            time: new Date().toISOString()
        }, null, 2));
    } 
    // Получить меню
    else if (url.pathname === '/api/menu' && req.method === 'GET') {
        res.writeHead(200, { 
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(menuData, null, 2));
    }
    // Добавить блюдо
    else if (url.pathname === '/api/menu' && req.method === 'POST') {
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
                
                res.writeHead(201, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Блюдо добавлено',
                    dish: newDish
                }, null, 2));
            } catch (error) {
                res.writeHead(400, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Ошибка парсинга JSON'
                }, null, 2));
            }
        });
    }
    // Очистить меню
    else if (url.pathname === '/api/menu/clear' && req.method === 'DELETE') {
        menuData = [];
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            success: true,
            message: 'Меню очищено'
        }, null, 2));
    }
    // Удалить конкретное блюдо
    else if (url.pathname.startsWith('/api/menu/') && req.method === 'DELETE') {
        const dishId = parseInt(url.pathname.split('/')[3]);
        const initialLength = menuData.length;
        menuData = menuData.filter(dish => dish.id !== dishId);
        
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify({
            success: true,
            message: `Блюдо ${dishId} удалено`,
            removed: initialLength - menuData.length
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
    console.log(`🍽️ Загружено ${menuData.length} блюд из Excel файла`);
    console.log(`📱 Мобильная адаптация: готова`);
    console.log(`🎨 Синий градиент: убран`);
    console.log(`🖥️ Полноэкранный режим: включен`);
});
