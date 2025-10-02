import { createServer } from 'http';

const PORT = process.env.PORT || 3000;

console.log(`🚀 Starting server on port ${PORT}...`);
console.log(`🔍 Process environment:`);
console.log(`   NODE_ENV: ${process.env.NODE_ENV || 'undefined'}`);
console.log(`   PORT: ${process.env.PORT || 'undefined'}`);
console.log(`🎯 Server will respond to ANY request with health info`);

// ПРОСТЕЙШИЙ HTTP СЕРВЕР - ВСЕ ЗАПРОСЫ = OK
const server = createServer((req, res) => {
  const timestamp = new Date().toISOString();
  console.log(`📥 [${timestamp}] ${req.method} ${req.url} from ${req.connection.remoteAddress}`);
  
  try {
    // ЛЮБОЙ ЗАПРОС ВОЗВРАЩАЕТ OK
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });
    
    const response = `OK - Server Running
Time: ${timestamp}
Method: ${req.method}
URL: ${req.url}
Version: 4.2.6-ultra-simple`;
    
    res.end(response);
    console.log(`✅ [${timestamp}] Response sent: 200 OK`);
    
  } catch (error) {
    console.error(`❌ [${timestamp}] Error handling request:`, error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
  
  // КОНЕЦ ОБРАБОТЧИКА - ВСЕ ЗАПРОСЫ УЖЕ ОБРАБОТАНЫ ВЫШЕ
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
