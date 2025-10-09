<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Файл для хранения меню
$menuFile = '../data/menu.json';

// Создаем директорию если не существует
if (!file_exists('../data/')) {
    mkdir('../data/', 0777, true);
}

// Загружаем меню
function loadMenu() {
    global $menuFile;
    if (file_exists($menuFile)) {
        $data = json_decode(file_get_contents($menuFile), true);
        return is_array($data) ? $data : [];
    }
    return [];
}

// Инициализируем базовое меню если файл пустой
$menuItems = loadMenu();
if (empty($menuItems)) {
    // Создаем базовое меню
    $dishes = [
        // Завтрак
        ['name' => 'Каша овсяная', 'meal_type' => 'завтрак', 'weight' => '200г', 'recipe' => '1/1'],
        ['name' => 'Бутерброд с маслом', 'meal_type' => 'завтрак', 'weight' => '80г', 'recipe' => '1/2'],
        ['name' => 'Чай с сахаром', 'meal_type' => 'завтрак', 'weight' => '200мл', 'recipe' => '1/3'],
        ['name' => 'Яблоко', 'meal_type' => 'завтрак', 'weight' => '100г', 'recipe' => '1/4'],
        ['name' => 'Хлеб', 'meal_type' => 'завтрак', 'weight' => '50г', 'recipe' => '1/5'],
        
        // Обед
        ['name' => 'Суп овощной', 'meal_type' => 'обед', 'weight' => '250г', 'recipe' => '2/1'],
        ['name' => 'Котлета мясная', 'meal_type' => 'обед', 'weight' => '100г', 'recipe' => '2/2'],
        ['name' => 'Картофельное пюре', 'meal_type' => 'обед', 'weight' => '150г', 'recipe' => '2/3'],
        ['name' => 'Компот из сухофруктов', 'meal_type' => 'обед', 'weight' => '200мл', 'recipe' => '2/4'],
        ['name' => 'Хлеб', 'meal_type' => 'обед', 'weight' => '50г', 'recipe' => '2/5'],
        
        // Полдник
        ['name' => 'Печенье', 'meal_type' => 'полдник', 'weight' => '50г', 'recipe' => '3/1'],
        ['name' => 'Молоко', 'meal_type' => 'полдник', 'weight' => '200мл', 'recipe' => '3/2'],
        ['name' => 'Банан', 'meal_type' => 'полдник', 'weight' => '100г', 'recipe' => '3/3'],
        ['name' => 'Йогурт', 'meal_type' => 'полдник', 'weight' => '125г', 'recipe' => '3/4'],
        ['name' => 'Сок яблочный', 'meal_type' => 'полдник', 'weight' => '200мл', 'recipe' => '3/5']
    ];
    
    // Генерируем блюда для 5 дней недели
    $id = 1;
    for ($day = 1; $day <= 5; $day++) {
        foreach ($dishes as $dish) {
            $menuItems[] = [
                'id' => $id++,
                'name' => $dish['name'],
                'description' => $dish['name'] . ' - День ' . $day . ' - ' . $dish['meal_type'],
                'price' => 0,
                'meal_type' => $dish['meal_type'],
                'day_of_week' => $day,
                'weight' => $dish['weight'],
                'recipe_number' => $dish['recipe'],
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s')
            ];
        }
    }
    
    // Сохраняем базовое меню
    file_put_contents($menuFile, json_encode($menuItems, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// Возвращаем меню
echo json_encode([
    'title' => 'Меню школьной столовой',
    'weekStart' => date('Y-m-d'),
    'items' => $menuItems
], JSON_UNESCAPED_UNICODE);
?>