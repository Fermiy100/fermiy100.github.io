<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');

// 🔥 ПРИНУДИТЕЛЬНОЕ ОБНОВЛЕНИЕ МЕНЮ - ТОЛЬКО 15 РЕАЛЬНЫХ БЛЮД! 🔥

$realDishes = [
    [
        'id' => 1,
        'name' => 'Сухие завтраки с молоком',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '225 г',
        'recipe_number' => '1/6',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 2,
        'name' => 'Оладьи',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '2 шт',
        'recipe_number' => '11/2',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 3,
        'name' => 'Молоко сгущенное',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '15/1',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 4,
        'name' => 'Сметана',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '15/7',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 5,
        'name' => 'Джем фруктовый',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '15/5',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 6,
        'name' => 'Мед',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '15/6',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 7,
        'name' => 'Масло сливочное',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '10 г',
        'recipe_number' => '18/7',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 8,
        'name' => 'Сыр',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '15 г',
        'recipe_number' => '18/8',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 9,
        'name' => 'Колбаса вареная',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '18/5',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 10,
        'name' => 'Колбаса в/к',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '18/6',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 11,
        'name' => 'Ветчина',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '18/4',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 12,
        'name' => 'Хлеб из пшеничной муки',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '20 г',
        'recipe_number' => '17/1',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 13,
        'name' => 'Чай с сахаром',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '200 г',
        'recipe_number' => '12/2',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 14,
        'name' => 'Чай с молоком',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '200 г',
        'recipe_number' => '12/3',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ],
    [
        'id' => 15,
        'name' => 'Какао с молоком',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '200 г',
        'recipe_number' => '12/4',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => '2025-10-03T08:00:00+00:00'
    ]
];

// Сохраняем в menu_data.json
$dataFile = __DIR__ . '/api/menu_data.json';
$result = file_put_contents($dataFile, json_encode($realDishes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

if ($result === false) {
    echo json_encode(['error' => 'Не удалось сохранить данные']);
} else {
    echo json_encode([
        'success' => true,
        'message' => "Меню обновлено! Теперь только " . count($realDishes) . " реальных блюд",
        'count' => count($realDishes),
        'dishes' => $realDishes
    ]);
}
?>
