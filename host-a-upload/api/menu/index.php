<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    $menuFile = __DIR__ . '/../../menu_data.json';
    
    if (!file_exists($menuFile)) {
        // Если файл не существует, возвращаем пустой массив
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $menuData = json_decode(file_get_contents($menuFile), true);
    
    if ($menuData === null) {
        throw new Exception('Ошибка чтения данных меню');
    }
    
    echo json_encode($menuData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    error_log("❌ Ошибка получения меню: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
