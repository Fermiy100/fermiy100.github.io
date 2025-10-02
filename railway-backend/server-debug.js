// СУПЕР ПРОСТОЙ ОТЛАДОЧНЫЙ СЕРВЕР
const http = require('http');

const PORT = process.env.PORT || 3000;

console.log('🔥 ОТЛАДОЧНЫЙ СЕРВЕР ЗАПУСКАЕТСЯ!');
console.log('🌐 PORT:', PORT);
console.log('📍 NODE VERSION:', process.version);
console.log('🕒 TIME:', new Date().toISOString());

const server = http.createServer((req, res) => {
  console.log('📥 REQUEST:', req.method, req.url);
  
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    'Access-Control-Allow-Origin': '*'
  });
  res.end('RAILWAY DEBUG SERVER OK\nTime: ' + new Date().toISOString());
  
  console.log('✅ RESPONSE: 200 OK sent');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log('🎉 SERVER STARTED ON 0.0.0.0:' + PORT);
  console.log('🏥 HEALTHCHECK: GET / or GET /health');
  console.log('⚡ READY FOR RAILWAY!');
});

server.on('error', (err) => {
  console.error('💥 SERVER ERROR:', err);
});

// Тестируем через 5 секунд
setTimeout(() => {
  console.log('🔍 Server running for 5 seconds, should be ready');
}, 5000);
