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

// Анализ дней недели
$dayAnalysis = [];
$mealTypeAnalysis = [];

foreach ($dishes as $dish) {
    $day = $dish['day_of_week'];
    $mealType = $dish['meal_type'];
    
    if (!isset($dayAnalysis[$day])) {
        $dayAnalysis[$day] = 0;
    }
    $dayAnalysis[$day]++;
    
    if (!isset($mealTypeAnalysis[$mealType])) {
        $mealTypeAnalysis[$mealType] = [];
    }
    if (!isset($mealTypeAnalysis[$mealType][$day])) {
        $mealTypeAnalysis[$mealType][$day] = 0;
    }
    $mealTypeAnalysis[$mealType][$day]++;
}

$analysis = [
    'total_dishes' => count($dishes),
    'days_analysis' => $dayAnalysis,
    'meal_types_by_day' => $mealTypeAnalysis,
    'sample_data' => array_slice($dishes, 0, 5)
];

echo json_encode($analysis, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
?>
