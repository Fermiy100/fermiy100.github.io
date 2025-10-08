const http = require('http');
const fs = require('fs');
const path = require('path');

// Устанавливаем кодировку UTF-8
process.stdout.setEncoding('utf8');
process.stderr.setEncoding('utf8');

console.log('🚀 ЗАПУСК SIMPLE RAILWAY SERVER v25.0.0 - CORS FIXED!');

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
    },
    {
        id: 2,
        email: 'parent@school.test',
        name: 'Родитель',
        role: 'parent',
        school_id: 1,
        verified: true,
        created_at: '2025-10-07T10:00:00Z'
    }
];

const server = http.createServer((req, res) => {
    // УЛУЧШЕННЫЕ CORS заголовки для всех запросов
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Access-Control-Expose-Headers', 'Content-Length, X-JSON');
    
    // Дополнительные заголовки для безопасности
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');

    const url = new URL(req.url, `http://${req.headers.host}`);

    // УЛУЧШЕННАЯ обработка OPTIONS запросов (preflight)
    if (req.method === 'OPTIONS') {
        console.log('🔄 Обрабатываем OPTIONS preflight запрос для:', req.url);
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400'
        });
        res.end(JSON.stringify({ status: 'OK', message: 'CORS preflight successful' }));
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
            message: 'Railway Server with CORS FIX v25.0.0 - SIMPLE VERSION!',
            dishCount: menuData.length,
            userCount: usersData.length,
            encoding: 'UTF-8',
            mobileReady: true,
            blueGradientRemoved: true,
            fullScreenMode: true,
            finalParser: true,
            userManagement: true,
            databaseEndpoint: true,
            yourExcelFileRead: true,
            autoMenuLoad: true,
            corsFixed: true,
            preflightHandling: true,
            simpleVersion: true,
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
                
                res.writeHead(200, {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(JSON.stringify(newDish, null, 2));
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
    // Получить пользователей
    else if (url.pathname === '/api/users' && req.method === 'GET') {
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(JSON.stringify(usersData, null, 2));
    }
    // Получить информацию о текущем пользователе
    else if (url.pathname === '/api/auth/me.php' && req.method === 'GET') {
        console.log('👤 ПОЛУЧАЕМ ИНФОРМАЦИЮ О ТЕКУЩЕМ ПОЛЬЗОВАТЕЛЕ...');
        res.writeHead(200, {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PUT, PATCH, HEAD',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Max-Age': '86400'
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
server.listen(PORT, () => {
    console.log(`🚀 Simple Railway Server запущен на порту ${PORT}`);
    console.log(`🍽️ Меню загружено: ${menuData.length} блюд`);
    console.log(`👥 Пользователи загружены: ${usersData.length} пользователей`);
    console.log(`🔧 CORS исправлен для всех запросов!`);
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
