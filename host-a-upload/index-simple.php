<?php
// Самая простая версия без зависимостей
?>
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <title>Школьное питание</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            max-width: 400px;
            width: 100%;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        h1 { margin: 0 0 20px 0; text-align: center; }
        input {
            width: 100%;
            padding: 10px;
            margin: 10px 0;
            border: 1px solid #ddd;
            border-radius: 5px;
            box-sizing: border-box;
        }
        button {
            width: 100%;
            padding: 12px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
        }
        button:hover { background: #5568d3; }
        .msg {
            padding: 10px;
            margin: 10px 0;
            border-radius: 5px;
            display: none;
        }
        .msg.error { background: #fee; color: #c00; border: 1px solid #fcc; }
        .msg.ok { background: #efe; color: #060; border: 1px solid #cfc; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🍽️ Школьное питание</h1>
        <div id="msg" class="msg"></div>
        <form id="form">
            <input type="email" id="email" placeholder="Email" value="director@school.test" required>
            <input type="password" id="password" placeholder="Пароль" value="password" required>
            <button type="submit">Войти</button>
        </form>
        <p style="text-align:center; margin-top:20px; font-size:12px; color:#666;">
            Тест: director@school.test / password
        </p>
    </div>
    <script>
        const form = document.getElementById('form');
        const msg = document.getElementById('msg');
        
        function showMsg(text, type) {
            msg.textContent = text;
            msg.className = 'msg ' + type;
            msg.style.display = 'block';
        }
        
        form.onsubmit = async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            showMsg('Подключение...', 'ok');
            
            try {
                const res = await fetch('https://fermiy100githubio-production.up.railway.app/api/auth/login', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                });
                
                if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('user', JSON.stringify(data.user));
                    showMsg('✅ Успешно! Загрузка...', 'ok');
                    setTimeout(() => {
                        window.location.href = 'director.html';
                    }, 1000);
                } else {
                    const err = await res.json();
                    showMsg('❌ ' + err.error, 'error');
                }
            } catch (e) {
                showMsg('❌ Ошибка: ' + e.message, 'error');
            }
        };
    </script>
</body>
</html>
