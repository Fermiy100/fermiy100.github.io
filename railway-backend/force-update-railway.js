// 🚀 Принудительное обновление Railway с новым парсером
const https = require('https');

console.log('🚀 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ RAILWAY...');

// Функция для добавления блюда в Railway
async function addDishToRailway(dish) {
    return new Promise((resolve, reject) => {
        const postData = JSON.stringify(dish);
        
        const options = {
            hostname: 'fermiy100githubio-production.up.railway.app',
            port: 443,
            path: '/api/menu',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => {
                data += chunk;
            });
            res.on('end', () => {
                try {
                    const response = JSON.parse(data);
                    resolve(response);
                } catch (error) {
                    resolve({ success: false, error: error.message });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

// Точные блюда из Excel файла
const exactDishes = [
    'Сухие завтраки с молоком', 'Оладьи', 'Молоко сгущенное', 'Сметана',
    'Джем фруктовый', 'Мед', 'Масло сливочное', 'Сыр', 'Колбаса вареная',
    'Колбаса в/к', 'Ветчина', 'Хлеб из пшеничной муки', 'Чай с сахаром',
    'Чай с молоком', 'Какао с молоком'
];

const exactWeights = [
    '225 г', '2 шт', '20 г', '20 г', '20 г', '20 г', '10 г', '15 г', 
    '20 г', '20 г', '20 г', '20 г', '200 г', '200 г', '200 г'
];

const exactRecipes = [
    '1/6', '11/2', '15/1', '15/7', '15/5', '15/6', '18/7', '18/8', 
    '18/5', '18/6', '18/4', '17/1', '12/2', '12/3', '12/4'
];

// Добавляем все блюда в Railway
async function addAllDishesToRailway() {
    console.log('🍽️ Добавляю все блюда в Railway...');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let day = 1; day <= 5; day++) {
        for (let i = 0; i < exactDishes.length; i++) {
            const dish = {
                name: exactDishes[i],
                description: `Точное блюдо из Excel файла (день ${day})`,
                price: 0,
                meal_type: 'завтрак',
                day_of_week: day,
                weight: exactWeights[i],
                recipe_number: exactRecipes[i]
            };

            try {
                const result = await addDishToRailway(dish);
                if (result.message && result.message.includes('добавлено')) {
                    successCount++;
                } else {
                    errorCount++;
                }
                console.log(`   День ${day}, Блюдо ${i + 1}: ${result.message || 'Ошибка'}`);
            } catch (error) {
                errorCount++;
                console.log(`   День ${day}, Блюдо ${i + 1}: Ошибка - ${error.message}`);
            }
            
            // Небольшая задержка между запросами
            await new Promise(resolve => setTimeout(resolve, 100));
        }
    }
    
    console.log(`\n📊 РЕЗУЛЬТАТ:`);
    console.log(`✅ Успешно добавлено: ${successCount} блюд`);
    console.log(`❌ Ошибок: ${errorCount} блюд`);
    console.log(`📈 Общий процент успеха: ${Math.round((successCount / (successCount + errorCount)) * 100)}%`);
    
    if (successCount > 0) {
        console.log('\n🎉 RAILWAY ОБНОВЛЕН! Теперь кнопки добавления/удаления должны работать!');
    } else {
        console.log('\n⚠️ Не удалось добавить блюда. Проверьте Railway API.');
    }
}

// Запускаем обновление
addAllDishesToRailway().catch(error => {
    console.error('❌ Критическая ошибка:', error);
});
