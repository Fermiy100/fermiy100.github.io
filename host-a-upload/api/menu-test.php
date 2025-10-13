<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Создаем полные тестовые данные
    $testMenuData = [];
    $id = 1;
    
    // Дни недели
    $days = ['ПОНЕДЕЛЬНИК', 'ВТОРНИК', 'СРЕДА', 'ЧЕТВЕРГ', 'ПЯТНИЦА'];
    
    // Блюда для каждого дня
    $dishes = [
        'завтрак' => [
            'Каша овсяная с молоком',
            'Бутерброд с маслом и сыром',
            'Чай с сахаром',
            'Печенье'
        ],
        'обед' => [
            'Суп овощной',
            'Котлета мясная',
            'Картофельное пюре',
            'Компот из сухофруктов'
        ],
        'полдник' => [
            'Фрукты',
            'Йогурт',
            'Печенье',
            'Сок'
        ]
    ];
    
    // Создаем блюда для каждого дня и типа питания
    foreach ($days as $day) {
        foreach ($dishes as $mealType => $mealDishes) {
            foreach ($mealDishes as $dishName) {
                $testMenuData[] = [
                    'id' => $id++,
                    'name' => $dishName,
                    'description' => $dishName . ' - ' . $day . ' - ' . $mealType,
                    'price' => rand(100, 300),
                    'meal_type' => $mealType,
                    'day_of_week' => $day,
                    'weight' => rand(150, 300) . 'г',
                    'recipe_number' => rand(1, 10) . '/' . rand(1, 5)
                ];
            }
        }
    }
    
    echo json_encode($testMenuData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("❌ Ошибка получения тестового меню: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
