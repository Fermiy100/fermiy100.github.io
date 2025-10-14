<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name']) || !isset($input['meal_type'])) {
        throw new Exception('Недостаточно данных для создания блюда');
    }
    
    $menuFile = __DIR__ . '/../../data/menu.json';
    $menuData = [];
    
    if (file_exists($menuFile)) {
        $menuData = json_decode(file_get_contents($menuFile), true) ?: [];
    }
    
    // Находим максимальный ID
    $maxId = 0;
    foreach ($menuData as $dish) {
        if (isset($dish['id']) && $dish['id'] > $maxId) {
            $maxId = $dish['id'];
        }
    }
    
    $newDish = [
        'id' => $maxId + 1,
        'name' => $input['name'],
        'description' => $input['description'] ?? $input['name'],
        'price' => $input['price'] ?? 0,
        'meal_type' => $input['meal_type'],
        'day_of_week' => $input['day_of_week'] ?? 1,
        'weight' => $input['weight'] ?? '100г',
        'recipe_number' => $input['recipe_number'] ?? '1/1',
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    $menuData[] = $newDish;
    
    file_put_contents($menuFile, json_encode($menuData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Блюдо успешно добавлено',
        'dish' => $newDish
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка добавления блюда: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>