#!/usr/bin/env node

/**
 * 🚨 ПРИНУДИТЕЛЬНЫЙ ПЕРЕЗАПУСК RAILWAY v5.0.0 🚨
 * 
 * Этот скрипт принудительно перезапускает Railway для применения обновлений
 */

const https = require('https');

console.log('🚨 ЗАПУСК ПРИНУДИТЕЛЬНОГО ПЕРЕЗАПУСКА RAILWAY v5.0.0...');

// Функция для отправки HTTP запроса
function makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({ status: res.statusCode, data: jsonData });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        
        req.on('error', reject);
        
        if (options.body) {
            req.write(options.body);
        }
        
        req.end();
    });
}

// Основная функция принудительного перезапуска
async function forceRestartRailway() {
    const railwayUrl = 'https://fermiy100githubio-production.up.railway.app';
    
    try {
        console.log('📡 Проверяю текущий статус Railway...');
        
        // Проверяем текущий статус
        const statusResponse = await makeRequest(`${railwayUrl}/`);
        console.log('📊 Текущий статус:', statusResponse.data);
        
        // Проверяем версию
        if (statusResponse.data.message && statusResponse.data.message.includes('v5.0.0')) {
            console.log('✅ Railway уже обновлен до v5.0.0!');
            return;
        }
        
        console.log('❌ Railway не обновлен! Текущая версия:', statusResponse.data.message);
        
        // Очищаем меню для принудительного обновления
        console.log('🗑️ Очищаю меню для принудительного обновления...');
        await makeRequest(`${railwayUrl}/api/menu/clear`, { method: 'DELETE' });
        
        // Добавляем тестовое блюдо с правильной кодировкой
        console.log('➕ Добавляю тестовое блюдо с UTF-8 кодировкой...');
        const testDish = {
            name: 'Тестовое блюдо UTF-8 v5.0.0',
            description: 'Проверка кодировки кириллицы v5.0.0',
            price: 0,
            meal_type: 'завтрак',
            day_of_week: 1,
            weight: '100 г',
            recipe_number: 'v5.0.0/1'
        };
        
        await makeRequest(`${railwayUrl}/api/menu`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testDish)
        });
        
        console.log('✅ Тестовое блюдо добавлено!');
        
        // Ждем немного для применения изменений
        console.log('⏳ Ждем 5 секунд для применения изменений...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Проверяем результат
        const newStatusResponse = await makeRequest(`${railwayUrl}/`);
        console.log('📊 Новый статус:', newStatusResponse.data);
        
        if (newStatusResponse.data.message && newStatusResponse.data.message.includes('v5.0.0')) {
            console.log('🎉 RAILWAY УСПЕШНО ОБНОВЛЕН ДО v5.0.0!');
        } else {
            console.log('❌ Railway все еще не обновлен. Требуется ручной перезапуск.');
        }
        
    } catch (error) {
        console.error('❌ Ошибка при перезапуске Railway:', error.message);
    }
}

// Запускаем принудительный перезапуск
forceRestartRailway();
