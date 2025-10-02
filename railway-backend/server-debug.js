// СУПЕР ПРОСТОЙ ОТЛАДОЧНЫЙ СЕРВЕР
const http = require('http');

const PORT = process.env.PORT || 3000;

console.log('🔥 ОТЛАДОЧНЫЙ СЕРВЕР ЗАПУСКАЕТСЯ!');
console.log('🌐 PORT:', PORT);
console.log('📍 NODE VERSION:', process.version);
console.log('🕒 TIME:', new Date().toISOString());

const server = http.createServer((req, res) => {
  console.log('📥 REQUEST:', req.method, req.url);
  
  // CORS headers for frontend
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://fermiy.ru',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true'
  };
  
  // Handle OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.writeHead(200, corsHeaders);
    res.end();
    console.log('✅ OPTIONS response sent');
    return;
  }
  
  // LOGIN endpoint - ОБРАБАТЫВАЕМ POST ДАННЫЕ
  if (req.url === '/api/auth/login' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        const { email, password } = JSON.parse(body);
        console.log('📧 Login attempt:', email);
        
        // Проверяем учетные данные - ПОДДЕРЖКА ОБОИХ ПОЛЬЗОВАТЕЛЕЙ
        let user = null;
        
        if (email === 'director@school.test' && password === 'P@ssw0rd1!') {
          user = {
            id: 1,
            email: 'director@school.test',
            name: 'Test Director',
            role: 'DIRECTOR',
            school_id: 1,
            verified: true
          };
        } else if (email === 'parent@school.test' && password === 'P@ssw0rd1!') {
          user = {
            id: 2,
            email: 'parent@school.test',
            name: 'Test Parent',
            role: 'PARENT',
            school_id: 1,
            verified: true
          };
        }
        
        if (user) {
          res.writeHead(200, {
            'Content-Type': 'application/json',
            ...corsHeaders
          });
          
          const loginResponse = JSON.stringify({
            token: 'railway-token-' + Date.now(),
            user: user
          });
          
          res.end(loginResponse);
          console.log('✅ LOGIN SUCCESS for:', email, 'as', user.role);
        } else {
          res.writeHead(401, {
            'Content-Type': 'application/json',
            ...corsHeaders
          });
          res.end(JSON.stringify({ error: 'Invalid credentials' }));
          console.log('❌ LOGIN FAILED for:', email);
        }
      } catch (error) {
        console.error('❌ LOGIN ERROR:', error);
        res.writeHead(400, {
          'Content-Type': 'application/json',
          ...corsHeaders
        });
        res.end(JSON.stringify({ error: 'Invalid request data' }));
      }
    });
    
    return;
  }
  
  // MENU endpoint
  if (req.url === '/api/menu' && req.method === 'GET') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      ...corsHeaders
    });
    
    const menuResponse = JSON.stringify([
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
        name: 'Борщ украинский с говядиной',
        meal_type: 'обед',
        day_of_week: 1,
        price: 85,
        weight: '300г'
      },
      {
        id: 3,
        name: 'Кефир питьевой',
        meal_type: 'полдник',
        day_of_week: 1,
        price: 25,
        weight: '200мл'
      }
    ]);
    
    res.end(menuResponse);
    console.log('✅ MENU response sent');
    return;
  }
  
  // Health check
  res.writeHead(200, { 
    'Content-Type': 'text/plain',
    ...corsHeaders
  });
  res.end('RAILWAY SERVER OK\nTime: ' + new Date().toISOString());
  
  console.log('✅ HEALTH response sent');
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
