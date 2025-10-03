<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

// Реальное удаление всех блюд из JSON файла
$dataFile = dirname(dirname(__FILE__)) . '/menu_data.json';
$deletedCount = 0;

if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $menuItems = json_decode($jsonData, true);
    
    if (json_last_error() === JSON_ERROR_NONE && is_array($menuItems)) {
        $deletedCount = count($menuItems);
        
        // Очищаем файл - записываем пустой массив
        $emptyData = json_encode([], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
        file_put_contents($dataFile, $emptyData);
    }
}

$response = [
    'message' => 'Меню успешно очищено',
    'deletedCount' => $deletedCount
];

echo json_encode($response);
?>
