#!/usr/bin/env node

/**
 * 🚨 ТЕСТ КОДИРОВКИ RAILWAY 🚨
 */

const https = require('https');

console.log('🔍 ТЕСТИРУЮ КОДИРОВКУ RAILWAY...');

// Функция для отправки HTTP запроса
function makeRequest(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, (res) => {
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
        req.end();
    });
}

// Основная функция тестирования
async function testRailwayEncoding() {
    const railwayUrl = 'https://fermiy100githubio-production.up.railway.app';
    
    try {
        console.log('📡 Проверяю статус Railway...');
        
        // Проверяем статус
        const statusResponse = await makeRequest(`${railwayUrl}/`);
        console.log('📊 Статус:', statusResponse.data);
        
        // Проверяем данные меню
        console.log('🍽️ Проверяю данные меню...');
        const menuResponse = await makeRequest(`${railwayUrl}/api/menu`);
        console.log('📋 Количество блюд:', menuResponse.data.length);
        
        // Проверяем кодировку первого блюда
        if (menuResponse.data.length > 0) {
            const firstDish = menuResponse.data[0];
            console.log('🔍 Первое блюдо:', firstDish.name);
            
            // Проверяем, есть ли проблемы с кодировкой
            if (firstDish.name.includes('?')) {
                console.log('❌ ПРОБЛЕМА С КОДИРОВКОЙ!');
                console.log('🔧 Railway возвращает некорректные данные');
            } else {
                console.log('✅ Кодировка корректна!');
            }
        }
        
    } catch (error) {
        console.error('❌ Ошибка:', error.message);
    }
}

// Запускаем тест
testRailwayEncoding();
