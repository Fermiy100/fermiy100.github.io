<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
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
    // Получаем токен из заголовка Authorization
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        // Возвращаем тестового пользователя для демо
        echo json_encode([
            'success' => true,
            'user' => [
                'id' => 1,
                'email' => 'director@school.test',
                'name' => 'Директор школы',
                'role' => 'director',
                'school_id' => 1
            ]
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    $token = substr($authHeader, 7);
    $decoded = base64_decode($token);
    
    if (!$decoded) {
        throw new Exception('Неверный токен');
    }
    
    $parts = explode(':', $decoded);
    if (count($parts) !== 2) {
        throw new Exception('Неверный формат токена');
    }
    
    $email = $parts[0];
    
    // Ищем пользователя
    $usersFile = __DIR__ . '/../../users.json';
    $users = [];
    
    if (file_exists($usersFile)) {
        $users = json_decode(file_get_contents($usersFile), true) ?: [];
    }
    
    $user = null;
    foreach ($users as $u) {
        if ($u['email'] === $email) {
            $user = $u;
            break;
        }
    }
    
    if (!$user) {
        throw new Exception('Пользователь не найден');
    }
    
    echo json_encode([
        'success' => true,
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'school_id' => $user['school_id'] ?? 1
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка получения пользователя: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>