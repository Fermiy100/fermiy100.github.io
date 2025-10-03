<?php
header('Content-Type: application/json');
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

if (!$input || !isset($input['targetWeek'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Необходимо указать целевую неделю']);
    exit();
}

// Mock successful duplication
$response = [
    'message' => 'Меню дублировано',
    'targetWeek' => $input['targetWeek'],
    'copiedCount' => 15
];

echo json_encode($response);
?>
