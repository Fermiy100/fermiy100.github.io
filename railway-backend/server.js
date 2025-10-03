const http = require('http');

// Супер простой сервер для Railway без зависимостей
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

    // Всегда возвращаем успешный ответ
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
        status: 'OK', 
        message: 'Railway Server is running!', 
        time: new Date().toISOString(),
        path: req.url
    }));
});

const PORT = process.env.PORT || 10000;
server.listen(PORT, () => {
    console.log(`🚀 Railway server запущен на порту ${PORT}`);
    console.log(`📊 Готов к работе!`);
});

// Обработка ошибок
server.on('error', (err) => {
    console.error('Server error:', err);
});

process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    server.close(() => {
        console.log('Process terminated');
    });
});