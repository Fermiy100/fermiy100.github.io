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
    $menuFile = __DIR__ . '/../../data/menu.json';
    
    // Проверяем существование файла
    if (!file_exists($menuFile)) {
        echo json_encode([
            'success' => true,
            'message' => 'Меню уже пустое',
            'deletedCount' => 0
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Читаем текущее меню для подсчета
    $currentMenu = json_decode(file_get_contents($menuFile), true);
    $deletedCount = is_array($currentMenu) ? count($currentMenu) : 0;
    
    // Очищаем файл меню
    file_put_contents($menuFile, json_encode([], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Все блюда удалены из меню',
        'deletedCount' => $deletedCount
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка очистки меню: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
        'success' => true,
        'message' => 'Все блюда удалены из меню',
        'deletedCount' => $deletedCount
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка очистки меню: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>