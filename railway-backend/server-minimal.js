import { createServer } from 'http';
import { readFileSync } from 'fs';
import { URL } from 'url';

const PORT = process.env.PORT || 3000;

// Простейший HTTP сервер без зависимостей
const server = createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  // Health checks
  if (url.pathname === '/' || url.pathname === '/health' || url.pathname === '/api/health') {
    res.writeHead(200);
    res.end(JSON.stringify({
      status: 'OK',
      service: 'School Meals API',
      timestamp: new Date().toISOString(),
      version: '4.2.5-minimal',
      message: 'Railway build fixed - minimal server running!'
    }));
    return;
  }
  
  // Login endpoint
  if (url.pathname === '/api/auth/login' && req.method === 'POST') {
    res.writeHead(200);
    res.end(JSON.stringify({
      message: 'Login successful',
      token: 'test-token-' + Date.now(),
      user: {
        id: 1,
        email: 'admin@test.com',
        name: 'Test Admin',
        role: 'admin',
        school_id: 1
      }
    }));
    return;
  }
  
  // Menu endpoint
  if (url.pathname === '/api/menu' && req.method === 'GET') {
    res.writeHead(200);
    res.end(JSON.stringify({
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
    }));
    return;
  }
  
  // Default 404
  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ MINIMAL SERVER STARTED SUCCESSFULLY!`);
  console.log(`🚀 Port: ${PORT}`);
  console.log(`🌍 Host: 0.0.0.0`);
  console.log(`🏥 Health: /, /health, /api/health`);
  console.log(`🔑 Login: /api/auth/login`);
  console.log(`🍽️ Menu: /api/menu`);
  console.log(`⏰ Time: ${new Date().toISOString()}`);
  console.log(`💪 NO DEPENDENCIES - RAILWAY READY!`);
});

server.on('error', (error) => {
  console.error('❌ Server error:', error);
  process.exit(1);
});
