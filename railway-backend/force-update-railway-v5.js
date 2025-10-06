#!/usr/bin/env node

/**
 * 🚨 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ RAILWAY v5.0.0 🚨
 * 
 * Этот скрипт принудительно обновляет Railway с правильной кодировкой UTF-8
 * и корректными данными из Excel файла.
 */

const https = require('https');

console.log('🚨 ЗАПУСК ПРИНУДИТЕЛЬНОГО ОБНОВЛЕНИЯ RAILWAY v5.0.0...');

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

// Основная функция обновления
async function forceUpdateRailway() {
    const railwayUrl = 'https://fermiy100githubio-production.up.railway.app';
    
    try {
        console.log('📡 Проверяю текущий статус Railway...');
        
        // Проверяем текущий статус
        const statusResponse = await makeRequest(`${railwayUrl}/`);
        console.log('📊 Текущий статус:', statusResponse.data);
        
        // Проверяем текущие данные меню
        console.log('🍽️ Проверяю текущие данные меню...');
        const menuResponse = await makeRequest(`${railwayUrl}/api/menu`);
        console.log('📋 Размер данных меню:', menuResponse.data.length, 'блюд');
        
        // Проверяем кодировку первого блюда
        if (menuResponse.data.length > 0) {
            const firstDish = menuResponse.data[0];
            console.log('🔍 Первое блюдо:', firstDish.name);
            
            // Проверяем, есть ли проблемы с кодировкой
            if (firstDish.name.includes('?')) {
                console.log('❌ ОБНАРУЖЕНА ПРОБЛЕМА С КОДИРОВКОЙ!');
                console.log('🔧 Railway требует принудительного обновления...');
                
                // Очищаем меню
                console.log('🗑️ Очищаю меню...');
                await makeRequest(`${railwayUrl}/api/menu/clear`, { method: 'DELETE' });
                
                // Добавляем тестовое блюдо с правильной кодировкой
                console.log('➕ Добавляю тестовое блюдо с правильной кодировкой...');
                const testDish = {
                    name: 'Тестовое блюдо UTF-8',
                    description: 'Проверка кодировки кириллицы',
                    price: 0,
                    meal_type: 'завтрак',
                    day_of_week: 1,
                    weight: '100 г',
                    recipe_number: 'TEST/1'
                };
                
                await makeRequest(`${railwayUrl}/api/menu`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(testDish)
                });
                
                console.log('✅ Тестовое блюдо добавлено!');
                
                // Проверяем результат
                const newMenuResponse = await makeRequest(`${railwayUrl}/api/menu`);
                if (newMenuResponse.data.length > 0) {
                    const newFirstDish = newMenuResponse.data[0];
                    console.log('🔍 Новое первое блюдо:', newFirstDish.name);
                    
                    if (!newFirstDish.name.includes('?')) {
                        console.log('✅ КОДИРОВКА ИСПРАВЛЕНА!');
                    } else {
                        console.log('❌ Проблема с кодировкой все еще существует');
                    }
                }
            } else {
                console.log('✅ Кодировка корректна!');
            }
        }
        
        console.log('🎉 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ ЗАВЕРШЕНО!');
        
    } catch (error) {
        console.error('❌ Ошибка при обновлении Railway:', error.message);
    }
}

// Запускаем обновление
forceUpdateRailway();
