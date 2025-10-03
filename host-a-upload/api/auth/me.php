<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Упрощенная аутентификация для тестирования
$headers = getallheaders();
$authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

// Проверяем наличие токена
if (!$authHeader || strpos($authHeader, 'Bearer ') !== 0) {
    // Возвращаем директора по умолчанию для тестирования
    echo json_encode([
        'id' => 1,
        'email' => 'director@school.test',
        'name' => 'Директор Школы',
        'role' => 'DIRECTOR',
        'school_id' => 1,
        'verified' => true
    ]);
    exit();
}

$token = substr($authHeader, 7); // Remove 'Bearer ' prefix

// Простая проверка токена
if ($token === 'test-director-token') {
    echo json_encode([
        'id' => 1,
        'email' => 'director@school.test',
        'name' => 'Директор Школы',
        'role' => 'DIRECTOR',
        'school_id' => 1,
        'verified' => true
    ]);
    exit();
} else if ($token === 'test-parent-token') {
    echo json_encode([
        'id' => 2,
        'email' => 'parent@school.test',
        'name' => 'Родитель',
        'role' => 'PARENT',
        'school_id' => 1,
        'verified' => true
    ]);
    exit();
}

try {
    // Fallback: попытка декодировать JWT
    $decoded = json_decode(base64_decode($token), true);
    
    if ($decoded && isset($decoded['user_id'])) {
        $userId = $decoded['user_id'];
    } else {
        // Если токен не декодируется, используем директора по умолчанию
        $userId = 1;
    }
    
    // Mock user data - UPDATED EMAILS
    $users = [
        1 => [
            'id' => 1,
            'email' => 'director@school.test',
            'name' => 'Директор Школы',
            'role' => 'DIRECTOR',
            'school_id' => 1,
            'verified' => true
        ],
        2 => [
            'id' => 2,
            'email' => 'parent@school.test',
            'name' => 'Родитель',
            'role' => 'PARENT',
            'school_id' => 1,
            'verified' => true
        ]
    ];
    
    $userId = $decoded['user_id'];
    
    if (!isset($users[$userId])) {
        throw new Exception('User not found');
    }
    
    echo json_encode($users[$userId]);
    
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
}
?>