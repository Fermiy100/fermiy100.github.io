const http = require('http');

console.log('🚀 ЗАПУСК MINIMAL RAILWAY SERVER v27.0.0 - WORKING VERSION!');

// Простые данные меню
let menuData = [
    {
        id: 1,
        name: 'Каша овсяная',
        description: 'Каша овсяная - Понедельник - завтрак',
        price: 0,
        meal_type: 'завтрак',
        day_of_week: 1,
        weight: '200 г',
        recipe_number: '1/1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 2,
        name: 'Суп овощной',
        description: 'Суп овощной - Понедельник - обед',
        price: 0,
        meal_type: 'обед',
        day_of_week: 1,
        weight: '250 г',
        recipe_number: '2/1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: 3,
        name: 'Печенье',
        description: 'Печенье - Понедельник - полдник',
        price: 0,
        meal_type: 'полдник',
        day_of_week: 1,
        weight: '50 г',
        recipe_number: '3/1',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

// Данные пользователей
let usersData = [
    {
        id: 1,
        email: 'director@school.test',
        name: 'Директор школы',
        role: 'director',
        school_id: 1,
        verified: true,
        created_at: '2025-10-07T10:00:00Z'
    }
];

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
            message: 'Railway Server WORKING v27.0.0 - MINIMAL VERSION!',
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
                email: 'director@school.test',
                name: 'Директор школы',
                role: 'DIRECTOR',
                school_id: 1,
                verified: true
            }
        }, null, 2));
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
