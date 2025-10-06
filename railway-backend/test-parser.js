// 🧪 Тест парсера Excel файлов
const FinalExcelParser = require('./final-excel-parser');

console.log('🧪 ЗАПУСК ТЕСТА ПАРСЕРА...');

// Создаем экземпляр парсера
const parser = new FinalExcelParser();

// Тестируем парсер
try {
    const dishes = parser.parse();
    
    console.log('\n📊 РЕЗУЛЬТАТЫ ТЕСТА:');
    console.log(`🍽️ Всего блюд: ${dishes.length}`);
    
    // Группируем по дням недели
    const dishesByDay = {};
    dishes.forEach(dish => {
        if (!dishesByDay[dish.day_of_week]) {
            dishesByDay[dish.day_of_week] = [];
        }
        dishesByDay[dish.day_of_week].push(dish);
    });
    
    console.log('\n📅 Блюда по дням недели:');
    Object.keys(dishesByDay).forEach(day => {
        console.log(`   День ${day}: ${dishesByDay[day].length} блюд`);
    });
    
    // Показываем первые 5 блюд
    console.log('\n🍽️ Первые 5 блюд:');
    dishes.slice(0, 5).forEach((dish, index) => {
        console.log(`   ${index + 1}. ${dish.name} (${dish.weight}) - ${dish.recipe_number}`);
    });
    
    // Проверяем уникальность блюд
    const uniqueDishes = [...new Set(dishes.map(d => d.name))];
    console.log(`\n🔍 Уникальных блюд: ${uniqueDishes.length}`);
    
    // Проверяем веса
    const uniqueWeights = [...new Set(dishes.map(d => d.weight))];
    console.log(`⚖️ Уникальных весов: ${uniqueWeights.length}`);
    
    // Проверяем рецепты
    const uniqueRecipes = [...new Set(dishes.map(d => d.recipe_number))];
    console.log(`📋 Уникальных рецептов: ${uniqueRecipes.length}`);
    
    console.log('\n✅ ТЕСТ ЗАВЕРШЕН УСПЕШНО!');
    
} catch (error) {
    console.error('❌ ОШИБКА В ТЕСТЕ:', error);
}
