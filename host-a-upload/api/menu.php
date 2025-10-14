<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    $menuFile = __DIR__ . '/../data/menu.json';
    
    if (!file_exists($menuFile)) {
        // Если файл не существует, создаем полные тестовые данные
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
        exit();
    }
    
    $menuData = json_decode(file_get_contents($menuFile), true);
    
    if ($menuData === null) {
        throw new Exception('Ошибка чтения данных меню');
    }
    
    // Преобразуем числовые дни недели в строки
    $dayNames = [
        1 => 'ПОНЕДЕЛЬНИК',
        2 => 'ВТОРНИК', 
        3 => 'СРЕДА',
        4 => 'ЧЕТВЕРГ',
        5 => 'ПЯТНИЦА'
    ];
    
    foreach ($menuData as &$item) {
        if (isset($item['day_of_week']) && is_numeric($item['day_of_week'])) {
            $dayNumber = (int)$item['day_of_week'];
            if (isset($dayNames[$dayNumber])) {
                $item['day_of_week'] = $dayNames[$dayNumber];
            }
        }
        
        // Устанавливаем цену по умолчанию, если она 0
        if (!isset($item['price']) || $item['price'] == 0) {
            $item['price'] = 150; // Цена по умолчанию
        }

        // Нормализуем строки для стабильного фронтенда
        if (isset($item['weight']) && !is_string($item['weight'])) {
            $item['weight'] = strval($item['weight']);
        }
        if (isset($item['recipe_number']) && !is_string($item['recipe_number'])) {
            $item['recipe_number'] = strval($item['recipe_number']);
        }
    }
    
    echo json_encode($menuData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("❌ Ошибка получения меню: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>