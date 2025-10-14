<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$uri = $_SERVER['REQUEST_URI'] ?? '';

// Совместимость: /api/users/{id}/verify
if (preg_match('#/api/users/(\d+)/(verify)(?:\/?$)#', $uri, $m)) {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PATCH') {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
        exit();
    }

    $userId = intval($m[1]);
    $usersFile = __DIR__ . '/../../data/users.json';

    if (!file_exists($usersFile)) {
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => 'Файл пользователей не найден'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    $users = json_decode(file_get_contents($usersFile), true) ?: [];
    $found = false;
    foreach ($users as &$u) {
        if ((int)$u['id'] === $userId) {
            $u['verified'] = true;
            $found = true;
            break;
        }
    }
    if (!$found) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Пользователь не найден'], JSON_UNESCAPED_UNICODE);
        exit();
    }

    file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo json_encode(['success' => true, 'message' => 'Пользователь верифицирован', 'userId' => $userId], JSON_UNESCAPED_UNICODE);
    exit();
}

http_response_code(404);
echo json_encode(['error' => 'Not Found']);
?>


