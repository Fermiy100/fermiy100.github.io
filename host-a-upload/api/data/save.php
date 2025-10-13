<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
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
    
    if (!$input || !isset($input['type']) || !isset($input['data'])) {
        throw new Exception('Не указан тип данных или данные');
    }
    
    $type = $input['type'];
    $data = $input['data'];
    
    // Определяем файл для сохранения
    $dataDir = __DIR__ . '/../../data/';
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    
    $filename = '';
    switch ($type) {
        case 'menu':
            $filename = $dataDir . 'menu.json';
            break;
        case 'users':
            $filename = $dataDir . 'users.json';
            break;
        case 'orders':
            $filename = $dataDir . 'orders.json';
            break;
        case 'settings':
            $filename = $dataDir . 'settings.json';
            break;
        default:
            throw new Exception('Неизвестный тип данных');
    }
    
    // Сохраняем данные
    $result = file_put_contents($filename, json_encode($data, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Ошибка сохранения данных');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Данные успешно сохранены',
        'type' => $type,
        'filename' => basename($filename)
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка сохранения данных: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
