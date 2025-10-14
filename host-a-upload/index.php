<?php
// Простая проверка - если это API запрос, перенаправляем
$uri = $_SERVER['REQUEST_URI'] ?? '';

if (strpos($uri, '/api/') === 0) {
    // API запросы обрабатываются через .htaccess
    http_response_code(404);
    echo json_encode(['error' => 'API endpoint not found']);
    exit();
}

// Для всех остальных запросов показываем HTML
?>
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>🍽️ Школьное питание - Вход в систему</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      
      .container {
        background: white;
        border-radius: 20px;
        padding: 40px;
        max-width: 400px;
        width: 100%;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      }
      
      h1 {
        text-align: center;
        color: #333;
        margin-bottom: 10px;
        font-size: 28px;
      }
      
      .subtitle {
        text-align: center;
        color: #666;
        margin-bottom: 30px;
        font-size: 14px;
      }
      
      .form-group {
        margin-bottom: 20px;
      }
      
      label {
        display: block;
        margin-bottom: 8px;
        color: #333;
        font-weight: 600;
        font-size: 14px;
      }
      
      input {
        width: 100%;
        padding: 12px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 8px;
        font-size: 16px;
        transition: border-color 0.3s;
      }
      
      input:focus {
        outline: none;
        border-color: #667eea;
      }
      
      button {
        width: 100%;
        padding: 14px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        border-radius: 8px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: transform 0.2s;
      }
      
      button:hover {
        transform: translateY(-2px);
      }
      
      button:active {
        transform: translateY(0);
      }
      
      .message {
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 20px;
        display: none;
      }
      
      .message.error {
        background: #fee;
        color: #c33;
        border: 1px solid #fcc;
      }
      
      .message.success {
        background: #efe;
        color: #363;
        border: 1px solid #cfc;
      }
      
      .info {
        margin-top: 20px;
        padding: 16px;
        background: #f8f9fa;
        border-radius: 8px;
        font-size: 13px;
        color: #666;
      }
      
      .info strong {
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🍽️ Школьное питание</h1>
      <p class="subtitle">Система управления питанием</p>
      
      <div id="message" class="message"></div>
      
      <form id="loginForm">
        <div class="form-group">
          <label for="email">Email</label>
          <input type="email" id="email" name="email" required value="director@school.test">
        </div>
        
        <div class="form-group">
          <label for="password">Пароль</label>
          <input type="password" id="password" name="password" required value="password">
        </div>
        
        <button type="submit">Войти в систему</button>
      </form>
      
      <div class="info">
        <strong>🔒 Безопасность:</strong><br>
        • Пароли хешируются bcrypt<br>
        • Rate limiting: 5 попыток/5 мин<br>
        • API защищен валидацией<br><br>
        <strong>📊 Статус системы:</strong><br>
        • Backend: Railway v33.0.0<br>
        • Security: Enabled ✅<br>
        • API: Active ✅
      </div>
    </div>
    
    <script>
      const form = document.getElementById('loginForm');
      const messageDiv = document.getElementById('message');
      
      function showMessage(text, type = 'error') {
        messageDiv.textContent = text;
        messageDiv.className = 'message ' + type;
        messageDiv.style.display = 'block';
      }
      
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        showMessage('⏳ Вход в систему...', 'success');
        
        try {
          // Пробуем Railway API
          const response = await fetch('https://fermiy100githubio-production.up.railway.app/api/auth/login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          if (response.ok) {
            const data = await response.json();
            
            // Сохраняем токен
            localStorage.setItem('auth_token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            showMessage('✅ Вход выполнен! Перенаправление...', 'success');
            
            // Перенаправляем в зависимости от роли
            setTimeout(() => {
              if (data.user.role === 'DIRECTOR') {
                window.location.href = '/director.html';
              } else {
                window.location.href = '/parent.html';
              }
            }, 1000);
          } else {
            const error = await response.json();
            showMessage('❌ ' + (error.error || 'Ошибка входа'), 'error');
          }
        } catch (error) {
          console.error('Login error:', error);
          showMessage('❌ Ошибка соединения с сервером. Проверьте Railway deployment.', 'error');
        }
      });
      
      // Проверяем, если уже залогинен
      const token = localStorage.getItem('auth_token');
      if (token) {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.role === 'DIRECTOR') {
          window.location.href = '/director.html';
        } else if (user.role === 'PARENT') {
          window.location.href = '/parent.html';
        }
      }
    </script>
  </body>
</html>
