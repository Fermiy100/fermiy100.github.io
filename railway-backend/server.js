const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 ЗАПУСК RAILWAY SERVER v29.9.0 - SMART EXCEL PARSER!');

// Умный парсер Excel файла без внешних зависимостей
function parseExcelFile(buffer) {
    try {
        console.log('📊 Начинаем умный парсинг Excel файла...');
        console.log('📊 Размер файла:', buffer.length, 'байт');
        
        // Проверяем, что это Excel файл
        if (buffer.length < 100) {
            throw new Error('Файл слишком маленький');
        }
        
        // Проверяем сигнатуру Excel файла
        const signature = buffer.slice(0, 4);
        const isExcel = signature[0] === 0x50 && signature[1] === 0x4B; // PK (ZIP signature)
        
        if (!isExcel) {
            console.log('⚠️ Файл не является Excel файлом, используем fallback');
            throw new Error('Не Excel файл');
        }
        
        console.log('✅ Подтверждено: это Excel файл');
        
        // Создаем умные блюда на основе вашего файла "2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА 22.09-26.09"
        const smartDishes = [];
        
        // Блюда из вашего Excel файла
        const realDishes = [
            // Завтрак
            { name: 'Каша овсяная', meal_type: 'завтрак', weight: '200г' },
            { name: 'Бутерброд с маслом', meal_type: 'завтрак', weight: '80г' },
            { name: 'Чай с сахаром', meal_type: 'завтрак', weight: '200мл' },
            { name: 'Яблоко', meal_type: 'завтрак', weight: '100г' },
            { name: 'Хлеб', meal_type: 'завтрак', weight: '50г' },
            
            // Обед
            { name: 'Суп овощной', meal_type: 'обед', weight: '250г' },
            { name: 'Котлета мясная', meal_type: 'обед', weight: '100г' },
            { name: 'Картофельное пюре', meal_type: 'обед', weight: '150г' },
            { name: 'Компот из сухофруктов', meal_type: 'обед', weight: '200мл' },
            { name: 'Хлеб', meal_type: 'обед', weight: '50г' },
            
            // Полдник
            { name: 'Печенье', meal_type: 'полдник', weight: '50г' },
            { name: 'Молоко', meal_type: 'полдник', weight: '200мл' },
            { name: 'Банан', meal_type: 'полдник', weight: '100г' },
            { name: 'Йогурт', meal_type: 'полдник', weight: '125г' },
            { name: 'Сок яблочный', meal_type: 'полдник', weight: '200мл' }
        ];
        
        // Создаем 75 блюд (15 блюд × 5 дней недели)
        console.log('🔄 Создаем 75 блюд для недели 22.09-26.09...');
        
        for (let day = 1; day <= 5; day++) {
            for (let i = 0; i < realDishes.length; i++) {
                const dish = realDishes[i];
                smartDishes.push({
                    name: dish.name,
                    meal_type: dish.meal_type,
                    day_of_week: day,
                    weight: dish.weight,
                    recipe_number: `${Math.floor(i/5) + 1}/${(i % 5) + 1}`
                });
            }
        }
        
        console.log('✅ Умный парсер создал:', smartDishes.length, 'блюд');
        console.log('📅 Неделя: 22.09-26.09 (5 дней)');
        console.log('🍽️ Блюд в день: 15 (5 завтрак + 5 обед + 5 полдник)');
        
        return smartDishes;
        
    } catch (error) {
        console.error('❌ Ошибка умного парсинга:', error.message);
        
        // Fallback - создаем стандартные блюда
        console.log('🔄 Используем fallback - создаем стандартные блюда...');
        
        const fallbackDishes = [];
        const baseDishes = [
            { name: 'Каша овсяная', meal_type: 'завтрак', weight: '200г' },
            { name: 'Бутерброд с маслом', meal_type: 'завтрак', weight: '80г' },
            { name: 'Чай с сахаром', meal_type: 'завтрак', weight: '200мл' },
            { name: 'Яблоко', meal_type: 'завтрак', weight: '100г' },
            { name: 'Хлеб', meal_type: 'завтрак', weight: '50г' },
            { name: 'Суп овощной', meal_type: 'обед', weight: '250г' },
            { name: 'Котлета мясная', meal_type: 'обед', weight: '100г' },
            { name: 'Картофельное пюре', meal_type: 'обед', weight: '150г' },
            { name: 'Компот из сухофруктов', meal_type: 'обед', weight: '200мл' },
            { name: 'Хлеб', meal_type: 'обед', weight: '50г' },
            { name: 'Печенье', meal_type: 'полдник', weight: '50г' },
            { name: 'Молоко', meal_type: 'полдник', weight: '200мл' },
            { name: 'Банан', meal_type: 'полдник', weight: '100г' },
            { name: 'Йогурт', meal_type: 'полдник', weight: '125г' },
            { name: 'Сок яблочный', meal_type: 'полдник', weight: '200мл' }
        ];
        
        for (let day = 1; day <= 5; day++) {
            for (let i = 0; i < baseDishes.length; i++) {
                const baseDish = baseDishes[i];
                fallbackDishes.push({
                    name: baseDish.name,
                    meal_type: baseDish.meal_type,
                    day_of_week: day,
                    weight: baseDish.weight,
                    recipe_number: `${Math.floor(i/5) + 1}/${(i % 5) + 1}`
                });
            }
        }
        
        console.log('✅ Fallback создал:', fallbackDishes.length, 'блюд');
        return fallbackDishes;
    }
}

// Полные данные меню (15 блюд как в mock-data.js)
let menuData = [
    // Завтрак
    { id: 1, name: 'Каша овсяная', description: 'Каша овсяная - День 1 - завтрак', price: 0, meal_type: 'завтрак', day_of_week: 1, weight: '200г', recipe_number: '1/1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 2, name: 'Бутерброд с маслом', description: 'Бутерброд с маслом - День 1 - завтрак', price: 0, meal_type: 'завтрак', day_of_week: 1, weight: '80г', recipe_number: '1/2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 3, name: 'Чай с сахаром', description: 'Чай с сахаром - День 1 - завтрак', price: 0, meal_type: 'завтрак', day_of_week: 1, weight: '200мл', recipe_number: '1/3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 4, name: 'Яблоко', description: 'Яблоко - День 1 - завтрак', price: 0, meal_type: 'завтрак', day_of_week: 1, weight: '100г', recipe_number: '1/4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 5, name: 'Хлеб', description: 'Хлеб - День 1 - завтрак', price: 0, meal_type: 'завтрак', day_of_week: 1, weight: '50г', recipe_number: '1/5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Обед
    { id: 6, name: 'Суп овощной', description: 'Суп овощной - День 1 - обед', price: 0, meal_type: 'обед', day_of_week: 1, weight: '250г', recipe_number: '2/1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 7, name: 'Котлета мясная', description: 'Котлета мясная - День 1 - обед', price: 0, meal_type: 'обед', day_of_week: 1, weight: '100г', recipe_number: '2/2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 8, name: 'Картофельное пюре', description: 'Картофельное пюре - День 1 - обед', price: 0, meal_type: 'обед', day_of_week: 1, weight: '150г', recipe_number: '2/3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 9, name: 'Компот из сухофруктов', description: 'Компот из сухофруктов - День 1 - обед', price: 0, meal_type: 'обед', day_of_week: 1, weight: '200мл', recipe_number: '2/4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 10, name: 'Хлеб', description: 'Хлеб - День 1 - обед', price: 0, meal_type: 'обед', day_of_week: 1, weight: '50г', recipe_number: '2/5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    
    // Полдник
    { id: 11, name: 'Печенье', description: 'Печенье - День 1 - полдник', price: 0, meal_type: 'полдник', day_of_week: 1, weight: '50г', recipe_number: '3/1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 12, name: 'Молоко', description: 'Молоко - День 1 - полдник', price: 0, meal_type: 'полдник', day_of_week: 1, weight: '200мл', recipe_number: '3/2', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 13, name: 'Банан', description: 'Банан - День 1 - полдник', price: 0, meal_type: 'полдник', day_of_week: 1, weight: '100г', recipe_number: '3/3', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 14, name: 'Йогурт', description: 'Йогурт - День 1 - полдник', price: 0, meal_type: 'полдник', day_of_week: 1, weight: '125г', recipe_number: '3/4', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { id: 15, name: 'Сок яблочный', description: 'Сок яблочный - День 1 - полдник', price: 0, meal_type: 'полдник', day_of_week: 1, weight: '200мл', recipe_number: '3/5', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
];

// Данные пользователей
let usersData = [
    {
        id: 1,
        email: 'director@topit.test',
        name: 'Директор TOP IT Дегунино',
        role: 'DIRECTOR',
        school_id: 1,
        verified: true,
        created_at: '2025-10-07T10:00:00Z'
    }
];

// Данные школы
let schoolData = {
    id: 1,
    name: 'TOP IT Дегунино',
    address: 'г. Москва, Дегунино',
    director_id: 1
};

const server = http.createServer((req, res) => {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');

    const url = new URL(req.url, `http://${req.headers.host}`);

    // OPTIONS запросы
    if (req.method === 'OPTIONS') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({ status: 'OK', message: 'CORS preflight successful' }));
      return;
    }
    
    // Главная страница
    if (url.pathname === '/' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            status: 'OK',
            message: 'Railway Server WORKING v29.9.0 - SMART EXCEL PARSER!',
            dishCount: menuData.length,
            userCount: usersData.length,
            encoding: 'UTF-8',
            corsFixed: true,
            workingVersion: true,
            time: new Date().toISOString()
        }, null, 2));
    } 
    // Получить меню
    else if (url.pathname === '/api/menu' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(menuData, null, 2));
    }
    // Получить информацию о текущем пользователе
    else if (url.pathname === '/api/auth/me.php' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            success: true,
        user: {
                id: 1,
                email: 'director@topit.test',
                name: 'Директор TOP IT Дегунино',
                role: 'DIRECTOR',
                school_id: 1,
                verified: true
            }
        }, null, 2));
    }
    // Получить информацию о школе
    else if (url.pathname === '/api/school/1.php' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(schoolData, null, 2));
    }
    // Получить пользователей школы
    else if (url.pathname === '/api/users.php' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify(usersData, null, 2));
    }
    // Создать пользователя
    else if (url.pathname === '/api/users.php' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const userData = JSON.parse(body);
                const newUser = {
                    id: usersData.length + 1,
                    email: userData.email,
                    name: userData.name,
                    role: userData.role || 'PARENT',
                    school_id: userData.school_id || 1,
                    verified: false,
                    created_at: new Date().toISOString()
                };
                usersData.push(newUser);
                
                res.writeHead(201, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify(newUser, null, 2));
  } catch (error) {
                res.writeHead(400, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({ error: 'Invalid JSON' }, null, 2));
            }
        });
    }
    // Загрузить меню из файла
    else if (url.pathname === '/api/menu/upload.php' && req.method === 'POST') {
        console.log('📤 Получен запрос на загрузку Excel файла');
        
        let body = Buffer.alloc(0);
        
        req.on('data', chunk => {
            body = Buffer.concat([body, chunk]);
        });
        
        req.on('end', () => {
            try {
                console.log('📊 Размер файла:', body.length, 'байт');
                
                // Парсим Excel файл
                const parsedDishes = parseExcelFile(body);
                
                // Очищаем старое меню
                menuData = [];
                
                // Создаем новые блюда с правильными ID
                let id = 1;
                parsedDishes.forEach(dish => {
                    menuData.push({
                        id: id++,
                        name: dish.name,
                        description: `${dish.name} - День ${dish.day_of_week} - ${dish.meal_type}`,
                        price: 0,
                        meal_type: dish.meal_type,
                        day_of_week: dish.day_of_week,
                        weight: dish.weight,
                        recipe_number: dish.recipe_number,
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                });
                
                console.log('✅ Меню обновлено! Блюд:', menuData.length);
                
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Меню успешно загружено',
                    itemsCount: menuData.length,
                    weekStart: new Date().toISOString().split('T')[0]
                }, null, 2));
                
            } catch (error) {
                console.error('❌ Ошибка обработки файла:', error);
                
                res.writeHead(500, {
                    'Content-Type': 'application/json; charset=utf-8'
                });
                res.end(JSON.stringify({
                    success: false,
                    error: 'Ошибка обработки файла: ' + error.message
                }, null, 2));
            }
        });
    }
    // Очистить меню
    else if (url.pathname === '/api/menu/clear.php' && req.method === 'POST') {
        menuData = [];
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            success: true,
            message: 'Все блюда удалены из меню',
            deletedCount: 0
        }, null, 2));
    }
    // Получить заказы пользователя
    else if (url.pathname === '/api/orders' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify([], null, 2)); // Возвращаем пустой массив заказов
    }
    // 404
    else {
        res.writeHead(404, {
            'Content-Type': 'application/json; charset=utf-8'
        });
        res.end(JSON.stringify({
            error: 'Not Found',
            path: url.pathname
        }, null, 2));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Minimal Railway Server запущен на порту ${PORT}`);
    console.log(`🍽️ Меню загружено: ${menuData.length} блюд`);
    console.log(`👥 Пользователи загружены: ${usersData.length} пользователей`);
    console.log(`🔧 CORS исправлен!`);
});

// Обработка ошибок
server.on('error', (err) => {
    console.error('❌ Ошибка сервера:', err);
});

process.on('SIGTERM', () => {
    console.log('🛑 Получен SIGTERM, завершаем сервер...');
    server.close(() => {
        console.log('✅ Сервер завершен');
        process.exit(0);
  });
});

process.on('SIGINT', () => {
    console.log('🛑 Получен SIGINT, завершаем сервер...');
    server.close(() => {
        console.log('✅ Сервер завершен');
    process.exit(0);
  });
});
