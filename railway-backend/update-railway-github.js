// 🚀 Принудительное обновление Railway через GitHub
const https = require('https');

console.log('🚀 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ RAILWAY ЧЕРЕЗ GITHUB...');

// Функция для проверки статуса Railway
function checkRailwayStatus() {
    return new Promise((resolve, reject) => {
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
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    resolve({ error: 'Failed to parse response' });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Функция для проверки меню Railway
function checkRailwayMenu() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'fermiy100githubio-production.up.railway.app',
            port: 443,
            path: '/api/menu',
            method: 'GET',
            headers: {
                'User-Agent': 'Railway-Update-Script'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve(jsonData);
                } catch (error) {
                    resolve({ error: 'Failed to parse menu response' });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

// Основная функция
async function updateRailway() {
    console.log('📡 Проверяю текущий статус Railway...');
    
    try {
        const status = await checkRailwayStatus();
        console.log('📊 Статус Railway:', status);
        
        const menu = await checkRailwayMenu();
        console.log('🍽️ Меню Railway:', Array.isArray(menu) ? `${menu.length} блюд` : menu);
        
        if (Array.isArray(menu) && menu.length === 75) {
            console.log('✅ Railway уже обновлен с 75 блюдами!');
            return;
        }
        
        console.log('⚠️ Railway не обновлен. Нужно принудительное обновление...');
        console.log('🔧 Создаю файл для принудительного обновления...');
        
        // Создаем файл для принудительного обновления
        const fs = require('fs');
        const updateFile = `RAILWAY_FORCE_UPDATE_${Date.now()}.txt`;
        const content = `
RAILWAY FORCE UPDATE
Timestamp: ${new Date().toISOString()}
Status: Railway needs to be updated with Ultimate Parser
Current dishes: ${Array.isArray(menu) ? menu.length : 0}
Required dishes: 75
Action: Force restart Railway with new code
`;
        
        fs.writeFileSync(updateFile, content);
        console.log(`📝 Создан файл: ${updateFile}`);
        
        console.log('🚀 Railway должен быть обновлен вручную через GitHub или Railway Dashboard');
        console.log('📋 Инструкции:');
        console.log('1. Загрузите все файлы из railway-backend/ на GitHub');
        console.log('2. Railway автоматически перезапустится с новым кодом');
        console.log('3. Проверьте статус через https://fermiy100githubio-production.up.railway.app/');
        
    } catch (error) {
        console.error('❌ Ошибка при проверке Railway:', error.message);
    }
}

// Запускаем обновление
updateRailway();
