<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['ids']) || !is_array($input['ids'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Необходимо указать массив ID']);
    exit();
}

$ids = $input['ids'];
// Удаляем из файла данных
$menuFile = __DIR__ . '/../../data/menu.json';
$menuData = [];
if (file_exists($menuFile)) {
    $menuData = json_decode(file_get_contents($menuFile), true) ?: [];
}

$initial = count($menuData);
$idSet = array_flip(array_map('intval', $ids));
$menuData = array_values(array_filter($menuData, function($dish) use ($idSet) {
    return !isset($idSet[(int)($dish['id'] ?? -1)]);
}));
$deletedCount = $initial - count($menuData);

file_put_contents($menuFile, json_encode($menuData, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));

echo json_encode([
    'message' => 'Выбранные блюда удалены',
    'deletedCount' => $deletedCount
], JSON_UNESCAPED_UNICODE);
?>