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
    $menuFile = __DIR__ . '/../../data/menu.json';
    
    if (!file_exists($menuFile)) {
        // Если файл не существует, возвращаем пустой массив
        echo json_encode([], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $menuData = json_decode(file_get_contents($menuFile), true);
    
    if ($menuData === null) {
        throw new Exception('Ошибка чтения данных меню');
    }
    
    // Преобразуем числовые дни недели в строки
    $dayNames = [
        1 => 'ПОНЕДЕЛЬНИК',
        2 => 'ВТОРНИК', 
        3 => 'СРЕДА',
        4 => 'ЧЕТВЕРГ',
        5 => 'ПЯТНИЦА'
    ];
    
    foreach ($menuData as &$item) {
        if (isset($item['day_of_week']) && is_numeric($item['day_of_week'])) {
            $dayNumber = (int)$item['day_of_week'];
            if (isset($dayNames[$dayNumber])) {
                $item['day_of_week'] = $dayNames[$dayNumber];
            }
        }
        
        // Устанавливаем цену по умолчанию, если она 0
        if (!isset($item['price']) || $item['price'] == 0) {
            $item['price'] = 150; // Цена по умолчанию
        }
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
