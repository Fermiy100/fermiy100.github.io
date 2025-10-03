<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock statistics data
$stats = [
    'totalItems' => 35,
    'byMealType' => [
        'завтрак' => 10,
        'обед' => 15,
        'полдник' => 10
    ],
    'byDay' => [
        'понедельник' => 7,
        'вторник' => 7,
        'среда' => 7,
        'четверг' => 7,
        'пятница' => 7
    ],
    'averagePrice' => 28.5,
    'totalPrice' => 997.5,
    'mostExpensive' => [
        'name' => 'Мясо тушёное',
        'price' => 65
    ],
    'cheapest' => [
        'name' => 'Компот',
        'price' => 12
    ]
];

echo json_encode($stats);
?>
