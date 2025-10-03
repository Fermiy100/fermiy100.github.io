import http from 'http';

// Простой сервер для Railway
const server = http.createServer((req, res) => {
    // CORS заголовки
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const url = new URL(req.url, `http://${req.headers.host}`);

    if (url.pathname === '/' && req.method === 'GET') {
        // Корневой endpoint для Railway health check
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'OK', 
            message: 'Railway Server is running!', 
            time: new Date().toISOString()
        }));
    } else if (url.pathname === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            status: 'OK', 
            message: 'Health check passed!', 
            time: new Date().toISOString()
        }));
    } else if (url.pathname === '/api/menu' && req.method === 'GET') {
        // Возвращаем тестовые данные
        const menuData = [
            {
                id: 1,
                name: "Сухие завтраки с молоком",
                description: "Блюдо из школьного меню",
                price: 0,
                meal_type: "завтрак",
                day_of_week: 1,
                weight: "225 г",
                recipe_number: "1/6",
                school_id: 1,
                week_start: "2025-10-03",
                created_at: "2025-10-03T08:00:00+00:00"
            },
            {
                id: 2,
                name: "Оладьи",
                description: "Блюдо из школьного меню",
                price: 0,
                meal_type: "завтрак",
                day_of_week: 1,
                weight: "2 шт",
                recipe_number: "11/2",
                school_id: 1,
                week_start: "2025-10-03",
                created_at: "2025-10-03T08:00:00+00:00"
            }
        ];
        
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(menuData));
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Simple Railway server запущен на порту ${PORT}`);
    console.log(`📊 Готов к работе!`);
});
