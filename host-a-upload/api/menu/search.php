<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$query = isset($_GET['q']) ? $_GET['q'] : '';

if (empty($query)) {
    echo json_encode(['items' => []]);
    exit();
}

// Mock search results
$allItems = [
    [
        'id' => 1,
        'name' => 'Каша овсяная',
        'description' => 'С молоком и маслом',
        'price' => 25,
        'meal_type' => 'завтрак',
        'day_of_week' => 'понедельник'
    ],
    [
        'id' => 2,
        'name' => 'Суп картофельный',
        'description' => 'С мясом',
        'price' => 35,
        'meal_type' => 'обед',
        'day_of_week' => 'вторник'
    ]
];

// Простой поиск по названию
$results = array_filter($allItems, function($item) use ($query) {
    return stripos($item['name'], $query) !== false || 
           stripos($item['description'], $query) !== false;
});

echo json_encode(['items' => array_values($results)]);
?>
