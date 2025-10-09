<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    // Очищаем файл меню
    $dataFile = '../data/menu.json';
    
    if (file_exists($dataFile)) {
        // Читаем текущие данные для подсчета
        $currentData = json_decode(file_get_contents($dataFile), true);
        $deletedCount = is_array($currentData) ? count($currentData) : 0;
        
        // Очищаем файл
        file_put_contents($dataFile, json_encode([], JSON_UNESCAPED_UNICODE));
        
        echo json_encode([
            'success' => true,
            'message' => 'Все блюда удалены из меню',
            'deletedCount' => $deletedCount
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => true,
            'message' => 'Меню уже пусто',
            'deletedCount' => 0
        ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка очистки меню: ' . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>