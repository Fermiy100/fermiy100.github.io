<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['name']) || !isset($input['meal_type']) || !isset($input['day_of_week'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Все поля обязательны']);
    exit();
}

// Создаем новое блюдо
$newItem = [
    'id' => rand(1000, 9999),
    'name' => $input['name'],
    'description' => isset($input['description']) ? $input['description'] : '',
    'price' => isset($input['price']) ? floatval($input['price']) : 0,
    'meal_type' => $input['meal_type'],
    'day_of_week' => $input['day_of_week'],
    'weight' => isset($input['weight']) ? $input['weight'] : '',
    'recipe_number' => isset($input['recipe_number']) ? $input['recipe_number'] : '',
    'school_id' => 1,
    'week_start' => date('Y-m-d'),
    'created_at' => date('c')
];

echo json_encode($newItem);
?>
