// Скрипт для принудительного обновления Railway
// Запустить: node update-railway.js

const https = require('https');

console.log('🚀 Принудительное обновление Railway...');

// Создаем простой HTTP запрос для проверки Railway
const options = {
    hostname: 'fermiy100githubio-production.up.railway.app',
    port: 443,
    path: '/',
    method: 'GET',
    headers: {
        'User-Agent': 'Railway-Update-Script'
    }
};

const req = https.request(options, (res) => {
    console.log(`📡 Статус Railway: ${res.statusCode}`);
    
    let data = '';
    res.on('data', (chunk) => {
        data += chunk;
    });
    
    res.on('end', () => {
        try {
            const jsonData = JSON.parse(data);
            console.log('✅ Railway API работает:');
            console.log(`   - Статус: ${jsonData.status}`);
            console.log(`   - Сообщение: ${jsonData.message}`);
            console.log(`   - Количество блюд: ${jsonData.dishCount}`);
            console.log(`   - Время: ${jsonData.time}`);
            
            if (jsonData.dishCount === 0) {
                console.log('⚠️  ПРОБЛЕМА: Railway возвращает 0 блюд!');
                console.log('   Нужно перезапустить Railway сервер');
            } else {
                console.log('✅ Railway работает корректно!');
            }
        } catch (error) {
            console.log('❌ Ошибка парсинга ответа Railway:', error.message);
        }
    });
});

req.on('error', (error) => {
    console.log('❌ Ошибка подключения к Railway:', error.message);
});

req.end();

// Проверяем меню
setTimeout(() => {
    console.log('\n🍽️ Проверяю меню Railway...');
    
    const menuOptions = {
        hostname: 'fermiy100githubio-production.up.railway.app',
        port: 443,
        path: '/api/menu',
        method: 'GET',
        headers: {
            'User-Agent': 'Railway-Update-Script'
        }
    };
    
    const menuReq = https.request(menuOptions, (res) => {
        console.log(`📡 Статус меню: ${res.statusCode}`);
        
        let data = '';
        res.on('data', (chunk) => {
            data += chunk;
        });
        
        res.on('end', () => {
            try {
                const menuData = JSON.parse(data);
                console.log(`✅ Меню Railway: ${menuData.length} блюд`);
                
                if (menuData.length === 0) {
                    console.log('⚠️  ПРОБЛЕМА: Меню пустое!');
                    console.log('   Нужно перезапустить Railway сервер');
                } else {
                    console.log('✅ Меню загружено корректно!');
                    console.log(`   Первое блюдо: ${menuData[0]?.name || 'N/A'}`);
                }
            } catch (error) {
                console.log('❌ Ошибка парсинга меню:', error.message);
            }
        });
    });
    
    menuReq.on('error', (error) => {
        console.log('❌ Ошибка подключения к меню Railway:', error.message);
    });
    
    menuReq.end();
}, 1000);
