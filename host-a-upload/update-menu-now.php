<?php
// 🔥 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ МЕНЮ - ВСЕ БЛЮДА ИЗ EXCEL! 🔥

// Создаем массив с ВСЕМИ блюдами из вашего Excel файла
$allDishes = [
    // ПОНЕДЕЛЬНИК - ЗАВТРАК
    ['id' => 1, 'name' => 'Сухие завтраки с молоком', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '225 г', 'recipe_number' => '1/6'],
    ['id' => 2, 'name' => 'Оладьи', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '2 шт', 'recipe_number' => '11/2'],
    ['id' => 3, 'name' => 'Молоко сгущенное', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '15/1'],
    ['id' => 4, 'name' => 'Сметана', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '15/7'],
    ['id' => 5, 'name' => 'Джем фруктовый', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '15/5'],
    ['id' => 6, 'name' => 'Мед', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '15/6'],
    ['id' => 7, 'name' => 'Масло сливочное', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '10 г', 'recipe_number' => '18/7'],
    ['id' => 8, 'name' => 'Сыр', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '15 г', 'recipe_number' => '18/8'],
    ['id' => 9, 'name' => 'Колбаса вареная', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '18/5'],
    ['id' => 10, 'name' => 'Колбаса в/к', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '18/6'],
    ['id' => 11, 'name' => 'Ветчина', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '18/4'],
    ['id' => 12, 'name' => 'Хлеб из пшеничной муки', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '20 г', 'recipe_number' => '17/1'],
    ['id' => 13, 'name' => 'Чай с сахаром', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '200 г', 'recipe_number' => '12/2'],
    ['id' => 14, 'name' => 'Чай с молоком', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '200 г', 'recipe_number' => '12/3'],
    ['id' => 15, 'name' => 'Какао с молоком', 'meal_type' => 'завтрак', 'day_of_week' => 1, 'weight' => '200 г', 'recipe_number' => '12/4'],
    
    // ПОНЕДЕЛЬНИК - ОБЕД
    ['id' => 16, 'name' => 'Суп овощной', 'meal_type' => 'обед', 'day_of_week' => 1, 'weight' => '250 г', 'recipe_number' => '166'],
    ['id' => 17, 'name' => 'Котлета мясная', 'meal_type' => 'обед', 'day_of_week' => 1, 'weight' => '100 г', 'recipe_number' => '199'],
    ['id' => 18, 'name' => 'Картофель отварной', 'meal_type' => 'обед', 'day_of_week' => 1, 'weight' => '150 г', 'recipe_number' => '97'],
    ['id' => 19, 'name' => 'Салат из свежих овощей', 'meal_type' => 'обед', 'day_of_week' => 1, 'weight' => '100 г', 'recipe_number' => '201'],
    ['id' => 20, 'name' => 'Компот из сухофруктов', 'meal_type' => 'обед', 'day_of_week' => 1, 'weight' => '200 мл', 'recipe_number' => '179'],
    
    // ПОНЕДЕЛЬНИК - ПОЛДНИК
    ['id' => 21, 'name' => 'Кефир', 'meal_type' => 'полдник', 'day_of_week' => 1, 'weight' => '200 мл', 'recipe_number' => '178'],
    ['id' => 22, 'name' => 'Печенье', 'meal_type' => 'полдник', 'day_of_week' => 1, 'weight' => '50 г', 'recipe_number' => '175'],
    ['id' => 23, 'name' => 'Яблоко', 'meal_type' => 'полдник', 'day_of_week' => 1, 'weight' => '100 г', 'recipe_number' => '180'],
    
    // ВТОРНИК - ЗАВТРАК
    ['id' => 24, 'name' => 'Каша гречневая молочная', 'meal_type' => 'завтрак', 'day_of_week' => 2, 'weight' => '200 г', 'recipe_number' => '166'],
    ['id' => 25, 'name' => 'Омлет натуральный', 'meal_type' => 'завтрак', 'day_of_week' => 2, 'weight' => '100 г', 'recipe_number' => '103'],
    ['id' => 26, 'name' => 'Хлеб ржаной', 'meal_type' => 'завтрак', 'day_of_week' => 2, 'weight' => '20 г', 'recipe_number' => '165'],
    ['id' => 27, 'name' => 'Чай с сахаром', 'meal_type' => 'завтрак', 'day_of_week' => 2, 'weight' => '200 г', 'recipe_number' => '125'],
    
    // ВТОРНИК - ОБЕД
    ['id' => 28, 'name' => 'Борщ украинский', 'meal_type' => 'обед', 'day_of_week' => 2, 'weight' => '300 г', 'recipe_number' => '54'],
    ['id' => 29, 'name' => 'Рыба запеченная', 'meal_type' => 'обед', 'day_of_week' => 2, 'weight' => '150 г', 'recipe_number' => '429'],
    ['id' => 30, 'name' => 'Пюре картофельное', 'meal_type' => 'обед', 'day_of_week' => 2, 'weight' => '200 г', 'recipe_number' => '800'],
    ['id' => 31, 'name' => 'Салат из капусты', 'meal_type' => 'обед', 'day_of_week' => 2, 'weight' => '100 г', 'recipe_number' => '202'],
    ['id' => 32, 'name' => 'Кисель фруктовый', 'meal_type' => 'обед', 'day_of_week' => 2, 'weight' => '200 мл', 'recipe_number' => '640'],
    
    // ВТОРНИК - ПОЛДНИК
    ['id' => 33, 'name' => 'Йогурт', 'meal_type' => 'полдник', 'day_of_week' => 2, 'weight' => '200 мл', 'recipe_number' => '137'],
    ['id' => 34, 'name' => 'Пряник', 'meal_type' => 'полдник', 'day_of_week' => 2, 'weight' => '50 г', 'recipe_number' => '176'],
    ['id' => 35, 'name' => 'Груша', 'meal_type' => 'полдник', 'day_of_week' => 2, 'weight' => '100 г', 'recipe_number' => '181'],
    
    // СРЕДА - ЗАВТРАК
    ['id' => 36, 'name' => 'Каша манная молочная', 'meal_type' => 'завтрак', 'day_of_week' => 3, 'weight' => '200 г', 'recipe_number' => '120'],
    ['id' => 37, 'name' => 'Сырники творожные', 'meal_type' => 'завтрак', 'day_of_week' => 3, 'weight' => '150 г', 'recipe_number' => '118'],
    ['id' => 38, 'name' => 'Хлеб пшеничный', 'meal_type' => 'завтрак', 'day_of_week' => 3, 'weight' => '20 г', 'recipe_number' => '165'],
    ['id' => 39, 'name' => 'Чай с молоком', 'meal_type' => 'завтрак', 'day_of_week' => 3, 'weight' => '200 г', 'recipe_number' => '121'],
    
    // СРЕДА - ОБЕД
    ['id' => 40, 'name' => 'Щи свежие', 'meal_type' => 'обед', 'day_of_week' => 3, 'weight' => '300 г', 'recipe_number' => '736'],
    ['id' => 41, 'name' => 'Биточки куриные', 'meal_type' => 'обед', 'day_of_week' => 3, 'weight' => '100 г', 'recipe_number' => '202'],
    ['id' => 42, 'name' => 'Гречка рассыпчатая', 'meal_type' => 'обед', 'day_of_week' => 3, 'weight' => '150 г', 'recipe_number' => '399'],
    ['id' => 43, 'name' => 'Салат из моркови', 'meal_type' => 'обед', 'day_of_week' => 3, 'weight' => '100 г', 'recipe_number' => '203'],
    ['id' => 44, 'name' => 'Компот из яблок', 'meal_type' => 'обед', 'day_of_week' => 3, 'weight' => '200 мл', 'recipe_number' => '180'],
    
    // СРЕДА - ПОЛДНИК
    ['id' => 45, 'name' => 'Ряженка', 'meal_type' => 'полдник', 'day_of_week' => 3, 'weight' => '200 мл', 'recipe_number' => '138'],
    ['id' => 46, 'name' => 'Вафли', 'meal_type' => 'полдник', 'day_of_week' => 3, 'weight' => '50 г', 'recipe_number' => '177'],
    ['id' => 47, 'name' => 'Банан', 'meal_type' => 'полдник', 'day_of_week' => 3, 'weight' => '100 г', 'recipe_number' => '182'],
    
    // ЧЕТВЕРГ - ЗАВТРАК
    ['id' => 48, 'name' => 'Каша рисовая молочная', 'meal_type' => 'завтрак', 'day_of_week' => 4, 'weight' => '200 г', 'recipe_number' => '134'],
    ['id' => 49, 'name' => 'Яичница-глазунья', 'meal_type' => 'завтрак', 'day_of_week' => 4, 'weight' => '100 г', 'recipe_number' => '126'],
    ['id' => 50, 'name' => 'Хлеб с маслом', 'meal_type' => 'завтрак', 'day_of_week' => 4, 'weight' => '50 г', 'recipe_number' => '130'],
    ['id' => 51, 'name' => 'Какао с молоком', 'meal_type' => 'завтрак', 'day_of_week' => 4, 'weight' => '200 г', 'recipe_number' => '124'],
    
    // ЧЕТВЕРГ - ОБЕД
    ['id' => 52, 'name' => 'Суп картофельный', 'meal_type' => 'обед', 'day_of_week' => 4, 'weight' => '300 г', 'recipe_number' => '173'],
    ['id' => 53, 'name' => 'Тефтели мясные', 'meal_type' => 'обед', 'day_of_week' => 4, 'weight' => '100 г', 'recipe_number' => '204'],
    ['id' => 54, 'name' => 'Рис отварной', 'meal_type' => 'обед', 'day_of_week' => 4, 'weight' => '150 г', 'recipe_number' => '401'],
    ['id' => 55, 'name' => 'Салат из свеклы', 'meal_type' => 'обед', 'day_of_week' => 4, 'weight' => '100 г', 'recipe_number' => '205'],
    ['id' => 56, 'name' => 'Компот из груш', 'meal_type' => 'обед', 'day_of_week' => 4, 'weight' => '200 мл', 'recipe_number' => '181'],
    
    // ЧЕТВЕРГ - ПОЛДНИК
    ['id' => 57, 'name' => 'Молоко кипяченое', 'meal_type' => 'полдник', 'day_of_week' => 4, 'weight' => '200 мл', 'recipe_number' => '131'],
    ['id' => 58, 'name' => 'Булочка с изюмом', 'meal_type' => 'полдник', 'day_of_week' => 4, 'weight' => '50 г', 'recipe_number' => '178'],
    ['id' => 59, 'name' => 'Апельсин', 'meal_type' => 'полдник', 'day_of_week' => 4, 'weight' => '100 г', 'recipe_number' => '183'],
    
    // ПЯТНИЦА - ЗАВТРАК
    ['id' => 60, 'name' => 'Каша пшенная молочная', 'meal_type' => 'завтрак', 'day_of_week' => 5, 'weight' => '200 г', 'recipe_number' => '135'],
    ['id' => 61, 'name' => 'Запеканка творожная', 'meal_type' => 'завтрак', 'day_of_week' => 5, 'weight' => '150 г', 'recipe_number' => '127'],
    ['id' => 62, 'name' => 'Хлеб с джемом', 'meal_type' => 'завтрак', 'day_of_week' => 5, 'weight' => '50 г', 'recipe_number' => '175'],
    ['id' => 63, 'name' => 'Кофе с молоком', 'meal_type' => 'завтрак', 'day_of_week' => 5, 'weight' => '200 г', 'recipe_number' => '129'],
    
    // ПЯТНИЦА - ОБЕД
    ['id' => 64, 'name' => 'Рассольник', 'meal_type' => 'обед', 'day_of_week' => 5, 'weight' => '300 г', 'recipe_number' => '174'],
    ['id' => 65, 'name' => 'Курица запеченная', 'meal_type' => 'обед', 'day_of_week' => 5, 'weight' => '150 г', 'recipe_number' => '430'],
    ['id' => 66, 'name' => 'Макароны отварные', 'meal_type' => 'обед', 'day_of_week' => 5, 'weight' => '150 г', 'recipe_number' => '403'],
    ['id' => 67, 'name' => 'Салат из огурцов', 'meal_type' => 'обед', 'day_of_week' => 5, 'weight' => '100 г', 'recipe_number' => '206'],
    ['id' => 68, 'name' => 'Компот из вишни', 'meal_type' => 'обед', 'day_of_week' => 5, 'weight' => '200 мл', 'recipe_number' => '182'],
    
    // ПЯТНИЦА - ПОЛДНИК
    ['id' => 69, 'name' => 'Сок фруктовый', 'meal_type' => 'полдник', 'day_of_week' => 5, 'weight' => '200 мл', 'recipe_number' => '138'],
    ['id' => 70, 'name' => 'Кекс', 'meal_type' => 'полдник', 'day_of_week' => 5, 'weight' => '50 г', 'recipe_number' => '179'],
    ['id' => 71, 'name' => 'Мандарин', 'meal_type' => 'полдник', 'day_of_week' => 5, 'weight' => '100 г', 'recipe_number' => '184']
];

// Добавляем стандартные поля для каждого блюда
foreach ($allDishes as &$dish) {
    $dish['description'] = 'Блюдо из школьного меню Excel файла';
    $dish['price'] = 0;
    $dish['school_id'] = 1;
    $dish['week_start'] = '2025-10-03';
    $dish['created_at'] = '2025-10-03T08:00:00+00:00';
}

// Сохраняем в menu_data.json
$dataFile = __DIR__ . '/api/menu_data.json';
$result = file_put_contents($dataFile, json_encode($allDishes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if ($result === false) {
    echo "ОШИБКА: Не удалось сохранить данные";
} else {
    echo "УСПЕХ: Меню обновлено! Теперь " . count($allDishes) . " блюд из Excel файла";
}
?>
