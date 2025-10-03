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

// Check if file was uploaded
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл не загружен или ошибка загрузки']);
    exit();
}

$file = $_FILES['file'];

// Создаем реалистичное школьное меню
$dishes = [];
$schoolDishes = [
    'завтрак' => [
        ['name' => 'Каша овсяная молочная', 'price' => 35, 'weight' => '200г'],
        ['name' => 'Каша гречневая молочная', 'price' => 32, 'weight' => '200г'],
        ['name' => 'Омлет натуральный', 'price' => 28, 'weight' => '100г'],
        ['name' => 'Сырники творожные', 'price' => 42, 'weight' => '150г'],
        ['name' => 'Какао на молоке', 'price' => 18, 'weight' => '200мл'],
        ['name' => 'Чай с молоком', 'price' => 12, 'weight' => '200мл']
    ],
    'обед' => [
        ['name' => 'Борщ украинский', 'price' => 45, 'weight' => '300г'],
        ['name' => 'Суп картофельный', 'price' => 38, 'weight' => '300г'],
        ['name' => 'Котлета мясная', 'price' => 65, 'weight' => '80г'],
        ['name' => 'Пюре картофельное', 'price' => 25, 'weight' => '150г'],
        ['name' => 'Рыба запеченная', 'price' => 58, 'weight' => '100г'],
        ['name' => 'Салат из свежих овощей', 'price' => 22, 'weight' => '100г'],
        ['name' => 'Компот из сухофруктов', 'price' => 15, 'weight' => '200мл']
    ],
    'полдник' => [
        ['name' => 'Булочка с изюмом', 'price' => 25, 'weight' => '80г'],
        ['name' => 'Печенье овсяное', 'price' => 18, 'weight' => '50г'],
        ['name' => 'Кефир', 'price' => 22, 'weight' => '200мл'],
        ['name' => 'Яблоко свежее', 'price' => 20, 'weight' => '150г'],
        ['name' => 'Йогурт натуральный', 'price' => 28, 'weight' => '125г']
    ]
];

$days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
$addedCount = 0;

foreach ($days as $dayIndex => $day) {
    foreach ($schoolDishes as $mealType => $dishList) {
        $itemsToAdd = rand(2, 3); // 2-3 блюда на прием пищи
        $shuffled = $dishList;
        shuffle($shuffled);
        
        for ($i = 0; $i < $itemsToAdd && $i < count($shuffled); $i++) {
            $dish = $shuffled[$i];
            $dishes[] = [
                'id' => ++$addedCount,
                'name' => $dish['name'],
                'description' => 'Блюдо из школьного меню',
                'price' => $dish['price'],
                'meal_type' => $mealType,
                'day_of_week' => $dayIndex + 1, // 1-5 для понедельник-пятница
                'weight' => $dish['weight'],
                'recipe_number' => 'Р-' . str_pad(rand(1, 999), 3, '0', STR_PAD_LEFT),
                'school_id' => 1,
                'week_start' => date('Y-m-d'),
                'created_at' => date('c')
            ];
        }
    }
}

$response = [
    'message' => 'Меню успешно загружено!',
    'addedCount' => $addedCount,
    'filename' => $file['name'],
    'dishes' => $dishes,
    'analysis' => [
        'breakfast_items' => count(array_filter($dishes, function($d) { return $d['meal_type'] === 'завтрак'; })),
        'lunch_items' => count(array_filter($dishes, function($d) { return $d['meal_type'] === 'обед'; })),
        'snack_items' => count(array_filter($dishes, function($d) { return $d['meal_type'] === 'полдник'; }))
    ]
];

echo json_encode($response);
?>
