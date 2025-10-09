<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Проверяем, что файл был загружен
if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Файл не был загружен или произошла ошибка']);
    exit();
}

$uploadedFile = $_FILES['file'];

// Проверяем тип файла
$allowedTypes = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
if (!in_array($uploadedFile['type'], $allowedTypes)) {
    http_response_code(400);
    echo json_encode(['error' => 'Неподдерживаемый тип файла. Загрузите Excel файл (.xlsx)']);
    exit();
}

// Читаем файл
$fileContent = file_get_contents($uploadedFile['tmp_name']);

// Создаем простой парсер Excel (базовая версия)
function parseExcelFile($fileContent) {
    // Простая имитация парсинга Excel файла
    // В реальном проекте здесь был бы настоящий парсер
    
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
    $menuItems = [];
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
    
    return $menuItems;
}

try {
    // Парсим Excel файл
    $menuItems = parseExcelFile($fileContent);
    
    // Сохраняем в JSON файл (имитация базы данных)
    $dataFile = '../data/menu.json';
    if (!file_exists('../data/')) {
        mkdir('../data/', 0777, true);
    }
    
    file_put_contents($dataFile, json_encode($menuItems, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    // Возвращаем успешный ответ
    echo json_encode([
        'success' => true,
        'message' => 'Меню успешно загружено',
        'addedCount' => count($menuItems),
        'items' => $menuItems
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка обработки файла: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>