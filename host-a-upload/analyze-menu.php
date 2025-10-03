<?php
header('Content-Type: application/json; charset=utf-8');

$dataFile = __DIR__ . '/api/menu_data.json';

if (!file_exists($dataFile)) {
    echo json_encode(['error' => 'Menu data file not found']);
    exit;
}

$jsonData = file_get_contents($dataFile);
$dishes = json_decode($jsonData, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    echo json_encode(['error' => 'JSON decode error: ' . json_last_error_msg()]);
    exit;
}

// Анализ распределения блюд
$analysis = [
    'total_dishes' => count($dishes),
    'by_meal_type' => [],
    'by_day' => [],
    'sample_dishes' => []
];

// Группировка по типам питания
foreach ($dishes as $dish) {
    $mealType = $dish['meal_type'];
    $day = $dish['day_of_week'];
    
    if (!isset($analysis['by_meal_type'][$mealType])) {
        $analysis['by_meal_type'][$mealType] = 0;
    }
    $analysis['by_meal_type'][$mealType]++;
    
    if (!isset($analysis['by_day'][$day])) {
        $analysis['by_day'][$day] = 0;
    }
    $analysis['by_day'][$day]++;
    
    // Сохраняем примеры блюд
    if (count($analysis['sample_dishes']) < 10) {
        $analysis['sample_dishes'][] = [
            'name' => $dish['name'],
            'meal_type' => $dish['meal_type'],
            'day' => $dish['day_of_week'],
            'price' => $dish['price']
        ];
    }
}

echo json_encode($analysis, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
