<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $dishId = $_GET['id'] ?? null;
    
    if (!$dishId || !is_numeric($dishId)) {
        throw new Exception('Неверный ID блюда');
    }
    
    $menuFile = __DIR__ . '/../../data/menu.json';
    
    if (!file_exists($menuFile)) {
        throw new Exception('Меню не найдено');
    }
    
    $menuData = json_decode(file_get_contents($menuFile), true) ?: [];
    $initialLength = count($menuData);
    
    // Удаляем блюдо по ID
    $menuData = array_filter($menuData, function($dish) use ($dishId) {
        return $dish['id'] != $dishId;
    });
    
    $menuData = array_values($menuData); // Переиндексируем массив
    $deletedCount = $initialLength - count($menuData);
    
    if ($deletedCount > 0) {
        file_put_contents($menuFile, json_encode($menuData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        
        echo json_encode([
            'success' => true,
            'message' => 'Блюдо успешно удалено',
            'deletedCount' => $deletedCount
        ], JSON_UNESCAPED_UNICODE);
    } else {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Блюдо не найдено'
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    error_log("❌ Ошибка удаления блюда: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>