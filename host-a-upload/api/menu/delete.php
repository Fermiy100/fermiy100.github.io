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

// Получаем ID из URL
$uri = $_SERVER['REQUEST_URI'];
$pathParts = explode('/', trim($uri, '/'));
$itemId = end($pathParts);

// Удаляем .php из ID если есть
$itemId = str_replace('.php', '', $itemId);

if (!is_numeric($itemId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Неверный ID блюда']);
    exit();
}

// Mock successful deletion
$response = [
    'message' => 'Блюдо удалено',
    'deletedId' => intval($itemId)
];

echo json_encode($response);
?>
