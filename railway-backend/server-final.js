const http = require('http');
const fs = require('fs');
const path = require('path');

console.log('🚀 ЗАПУСК RAILWAY SERVER v33.0.0 - SECURITY & FULL FEATURES!');

// ===== БЕЗОПАСНОСТЬ =====
const bcrypt = require('bcrypt'); // Для хеширования паролей

// База данных в памяти
let menuData = [];
let userData = [];
let ordersData = [];

// Инициализация пользователей с хешированными паролями
async function initializeUsers() {
    const defaultPassword = await bcrypt.hash('password', 10);
    userData = [
        {
            id: 1,
            email: 'director@school.test',
            name: 'Директор школы',
            password_hash: defaultPassword,
            role: 'DIRECTOR',
            school_id: 1,
            verified: true,
            created_at: new Date().toISOString()
        }
    ];
    console.log('✅ Пользователи инициализированы с безопасными паролями');
}

// Rate limiting
const rateLimitMap = new Map();
function checkRateLimit(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const requests = rateLimitMap.get(key) || [];
    const validRequests = requests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
        return false;
    }
    
    validRequests.push(now);
    rateLimitMap.set(key, validRequests);
    return true;
}

// CORS headers
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

// Валидация данных
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email) && email.length <= 100;
}

function validateName(name) {
    return name && name.length >= 2 && name.length <= 50;
}

function sanitizeString(str, maxLength = 255) {
    if (!str) return '';
    return str.toString().trim().slice(0, maxLength);
}

// Парсер Excel (упрощенный, генерирует тестовые данные)
function parseExcelFile(buffer) {
    console.log('📊 Парсим Excel файл...');
    
    const dishes = [];
    const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница'];
    const mealTypes = ['Завтрак', 'Обед', 'Полдник'];
    
    const breakfastItems = [
        'Каша овсяная 200 г № 1/1',
        'Бутерброд с маслом 80 г № 2/1',
        'Чай с сахаром 200 мл № 3/1',
        'Яблоко 100 г № 4/1'
    ];
    
    const lunchItems = [
        'Суп овощной 250 г № 5/1',
        'Котлета мясная 100 г № 6/1',
        'Картофельное пюре 150 г № 7/1',
        'Компот 200 мл № 8/1'
    ];
    
    const snackItems = [
        'Печенье 50 г № 9/1',
        'Молоко 200 мл № 10/1',
        'Банан 100 г № 11/1'
    ];
    
    let id = 1;
    days.forEach((day, dayIndex) => {
        // Завтрак
        breakfastItems.forEach(item => {
            const match = item.match(/^(.+?)\s+(\d+\s+(?:г|мл))\s+(№\s*[\d/]+)$/);
            dishes.push({
                id: id++,
                name: match ? match[1] : item,
                weight: match ? match[2] : '',
                recipe_number: match ? match[3] : '',
                meal_type: 'Завтрак',
                day_of_week: day,
                day_num: dayIndex + 1,
                price: 150,
                school_id: 1,
                week_start: new Date().toISOString().split('T')[0]
            });
        });
        
        // Обед
        lunchItems.forEach(item => {
            const match = item.match(/^(.+?)\s+(\d+\s+(?:г|мл))\s+(№\s*[\d/]+)$/);
            dishes.push({
                id: id++,
                name: match ? match[1] : item,
                weight: match ? match[2] : '',
                recipe_number: match ? match[3] : '',
                meal_type: 'Обед',
                day_of_week: day,
                day_num: dayIndex + 1,
                price: 200,
                school_id: 1,
                week_start: new Date().toISOString().split('T')[0]
            });
        });
        
        // Полдник
        snackItems.forEach(item => {
            const match = item.match(/^(.+?)\s+(\d+\s+(?:г|мл))\s+(№\s*[\d/]+)$/);
            dishes.push({
                id: id++,
                name: match ? match[1] : item,
                weight: match ? match[2] : '',
                recipe_number: match ? match[3] : '',
                meal_type: 'Полдник',
                day_of_week: day,
                day_num: dayIndex + 1,
                price: 100,
                school_id: 1,
                week_start: new Date().toISOString().split('T')[0]
            });
        });
    });
    
    console.log(`✅ Создано ${dishes.length} блюд`);
    return dishes;
}

// HTTP сервер
const server = http.createServer(async (req, res) => {
    setCorsHeaders(res);
    
    // OPTIONS запросы
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }
    
    const url = req.url;
    const method = req.method;
    
    console.log(`${method} ${url}`);
    
    // Health check
    if (url === '/api/health' || url === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'ok',
            version: 'v33.0.0',
            timestamp: new Date().toISOString(),
            dishCount: menuData.length,
            userCount: userData.length
        }));
        return;
    }
    
    // ===== AUTH API =====
    
    // Login
    if (url === '/api/auth/login' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { email, password } = JSON.parse(body);
                
                // Rate limiting
                if (!checkRateLimit(req.socket.remoteAddress, 5, 300000)) {
                    res.writeHead(429, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Слишком много попыток входа' }));
                    return;
                }
                
                const user = userData.find(u => u.email === email);
                if (!user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Неверный email или пароль' }));
                    return;
                }
                
                const validPassword = await bcrypt.compare(password, user.password_hash);
                if (!validPassword) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Неверный email или пароль' }));
                    return;
                }
                
                const token = Buffer.from(`${email}:${Date.now()}`).toString('base64');
                
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        role: user.role,
                        school_id: user.school_id,
                        verified: user.verified
                    },
                    token
                }));
            } catch (error) {
                console.error('❌ Login error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Ошибка сервера' }));
            }
        });
        return;
    }
    
    // Get current user
    if (url === '/api/auth/me' && method === 'GET') {
        const authHeader = req.headers.authorization || '';
        const token = authHeader.replace('Bearer ', '');
        
        if (!token) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Не авторизован' }));
            return;
        }
        
        try {
            const decoded = Buffer.from(token, 'base64').toString();
            const email = decoded.split(':')[0];
            const user = userData.find(u => u.email === email);
            
            if (!user) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Пользователь не найден' }));
                return;
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify({
                success: true,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    school_id: user.school_id,
                    verified: user.verified
                }
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Ошибка сервера' }));
        }
        return;
    }
    
    // ===== USERS API =====
    
    // Get users (БЕЗ ПАРОЛЕЙ!)
    if (url === '/api/users' && method === 'GET') {
        const safeUsers = userData.map(u => ({
            id: u.id,
            email: u.email,
            name: u.name,
            role: u.role,
            school_id: u.school_id,
            verified: u.verified,
            created_at: u.created_at
        }));
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(safeUsers));
        return;
    }
    
    // Create user
    if (url === '/api/users' && method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const data = JSON.parse(body);
                
                // Валидация
                if (!validateEmail(data.email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Неверный email' }));
                    return;
                }
                
                if (!validateName(data.name)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Неверное имя' }));
                    return;
                }
                
                // Проверка дубликатов
                if (userData.find(u => u.email === data.email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email уже используется' }));
                    return;
                }
                
                // Генерация пароля
                const password = Math.random().toString(36).slice(-12);
                const password_hash = await bcrypt.hash(password, 10);
                
                const newUser = {
                    id: Math.max(0, ...userData.map(u => u.id)) + 1,
                    email: sanitizeString(data.email, 100),
                    name: sanitizeString(data.name, 50),
                    password_hash,
                    role: data.role || 'PARENT',
                    school_id: data.school_id || 1,
                    verified: false,
                    created_at: new Date().toISOString()
                };
                
                userData.push(newUser);
                
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    user: {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        role: newUser.role,
                        school_id: newUser.school_id
                    },
                    password // Показываем только при создании!
                }));
            } catch (error) {
                console.error('❌ Create user error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Ошибка сервера' }));
            }
        });
        return;
    }
    
    // Delete user
    if (url.match(/^\/api\/users\/(\d+)\/delete$/) && method === 'DELETE') {
        const userId = parseInt(url.match(/\/api\/users\/(\d+)\/delete/)[1]);
        const index = userData.findIndex(u => u.id === userId);
        
        if (index === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Пользователь не найден' }));
            return;
        }
        
        const deletedUser = userData[index];
        userData.splice(index, 1);
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            success: true,
            message: 'Пользователь удален',
            deleted_user: { id: deletedUser.id, name: deletedUser.name }
        }));
        return;
    }
    
    // Verify user
    if (url.match(/^\/api\/users\/(\d+)\/verify$/) && method === 'POST') {
        const userId = parseInt(url.match(/\/api\/users\/(\d+)\/verify/)[1]);
        const user = userData.find(u => u.id === userId);
        
        if (!user) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Пользователь не найден' }));
            return;
        }
        
        user.verified = true;
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ success: true, message: 'Пользователь верифицирован' }));
        return;
    }
    
    // ===== MENU API =====
    
    // Get menu
    if (url === '/api/menu' && method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify(menuData));
        return;
    }
    
    // Upload menu
    if (url === '/api/menu' && method === 'POST') {
        let body = Buffer.alloc(0);
        req.on('data', chunk => {
            body = Buffer.concat([body, chunk]);
        });
        req.on('end', () => {
            try {
                const dishes = parseExcelFile(body);
                menuData = dishes;
                
                res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Меню загружено',
                    addedCount: dishes.length,
                    dishes
                }));
            } catch (error) {
                console.error('❌ Upload error:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Ошибка парсинга файла' }));
            }
        });
        return;
    }
    
    // Clear menu
    if (url === '/api/menu/clear' && method === 'DELETE') {
        const count = menuData.length;
        menuData = [];
        
        res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({
            success: true,
            deletedCount: count
        }));
        return;
    }
    
    // Delete menu item
    if (url.match(/^\/api\/menu\/delete/) && method === 'DELETE') {
        const params = new URLSearchParams(url.split('?')[1]);
        const id = parseInt(params.get('id'));
        
        const index = menuData.findIndex(item => item.id === id);
        if (index !== -1) {
            menuData.splice(index, 1);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true, message: 'Блюдо удалено' }));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Блюдо не найдено' }));
        }
        return;
    }
    
    // ===== ORDERS API =====
    
    // Get/Create orders
    if (url === '/api/orders' && (method === 'GET' || method === 'POST')) {
        if (method === 'GET') {
            res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
            res.end(JSON.stringify(ordersData));
        } else {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const orderData = JSON.parse(body);
                    const newOrder = {
                        id: ordersData.length + 1,
                        ...orderData,
                        created_at: new Date().toISOString()
                    };
                    ordersData.push(newOrder);
                    
                    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
                    res.end(JSON.stringify({ success: true, order: newOrder }));
                } catch (error) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Ошибка создания заказа' }));
                }
            });
        }
        return;
    }
    
    // ===== DEFAULT =====
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
});

// Запуск сервера
const PORT = process.env.PORT || 3000;

(async () => {
    await initializeUsers();
    
    server.listen(PORT, () => {
        console.log(`✅ Server running on port ${PORT}`);
        console.log(`🔒 Security: bcrypt password hashing enabled`);
        console.log(`🛡️ Security: rate limiting enabled`);
        console.log(`✅ Users initialized: ${userData.length}`);
        console.log(`📊 Menu items: ${menuData.length}`);
    });
})();
