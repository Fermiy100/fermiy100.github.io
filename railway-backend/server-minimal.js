import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

console.log(`🚀 Starting server on port ${PORT}...`);

// Простейший HTTP сервер без зависимостей
const server = createServer((req, res) => {
  console.log(`📥 ${req.method} ${req.url}`);
  
  // Быстрые заголовки
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  // Простейшая обработка URL
  const path = req.url;
  
  // Health checks - все пути ведут к здоровью!
  if (path === '/' || path === '/health' || path === '/api/health' || path.includes('health')) {
    const response = {
      status: 'OK',
      service: 'School Meals API',
      timestamp: new Date().toISOString(),
      version: '4.2.6-docker',
      port: PORT,
      path: path,
      method: req.method,
      message: 'DOCKER BUILD SUCCESS - HEALTHCHECK WORKING!'
    };
    
    res.writeHead(200);
    res.end(JSON.stringify(response));
    console.log(`✅ Health check successful: ${path}`);
    return;
  }
  
  // Login endpoint
  if (path === '/api/auth/login' && req.method === 'POST') {
    const response = {
      message: 'Login successful',
      token: 'test-token-' + Date.now(),
      user: {
        id: 1,
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        school_id: 1
      }
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
    console.log(`🔑 Login request handled`);
    return;
  }
  
  // Menu endpoint
  if (path === '/api/menu' && req.method === 'GET') {
    const response = {
      menu: [
        {
          id: 1,
          name: 'Каша овсяная молочная',
          meal_type: 'завтрак',
          day_of_week: 1,
          price: 45,
          weight: '200г'
        },
        {
          id: 2,
          name: 'Борщ украинский',
          meal_type: 'обед',
          day_of_week: 1,
          price: 85,
          weight: '300г'
        },
        {
          id: 3,
          name: 'Кефир',
          meal_type: 'полдник',
          day_of_week: 1,
          price: 25,
          weight: '200мл'
        }
      ]
    };
    res.writeHead(200);
    res.end(JSON.stringify(response));
    console.log(`🍽️ Menu request handled`);
    return;
  }
  
  // Default 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Настройки сервера для Railway
server.keepAliveTimeout = 120000; // 2 минуты
server.headersTimeout = 120000;
server.timeout = 120000;

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🎉 ========================================`);
  console.log(`✅ MINIMAL SERVER STARTED SUCCESSFULLY!`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🌍 Host: 0.0.0.0 (Railway compatible)`);
  console.log(`🏥 Health endpoints:`);
  console.log(`   GET / (root)`);
  console.log(`   GET /health (healthcheck)`);  
  console.log(`   GET /api/health (api healthcheck)`);
  console.log(`🔑 Auth: POST /api/auth/login`);
  console.log(`🍽️ Menu: GET /api/menu`);
  console.log(`⏰ Started: ${new Date().toISOString()}`);
  console.log(`💪 Version: 4.2.6-docker-minimal`);
  console.log(`🎯 NO NPM DEPENDENCIES - PURE NODE.JS!`);
  console.log(`========================================`);
  
  // Тестируем healthcheck через 3 секунды
  setTimeout(() => {
    console.log(`🔍 Server is ready for healthcheck requests`);
  }, 3000);
});

server.on('error', (error) => {
  console.error(`❌ CRITICAL SERVER ERROR:`, error);
  if (error.code === 'EADDRINUSE') {
    console.error(`💥 Port ${PORT} is already in use!`);
  }
  process.exit(1);
});

server.on('connection', (socket) => {
  console.log(`🔌 New connection established`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`🛑 SIGTERM received, shutting down gracefully`);
  server.close(() => {
    console.log(`✅ Server closed`);
    process.exit(0);
  });
});
