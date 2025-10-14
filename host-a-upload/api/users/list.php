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
        throw new Exception('Не авторизован');
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
    
    $currentEmail = $parts[0];
    
    // Загружаем пользователей
    $usersFile = __DIR__ . '/../../data/users.json';
    
    if (!file_exists($usersFile)) {
        throw new Exception('Файл пользователей не найден');
    }
    
    $users = json_decode(file_get_contents($usersFile), true) ?: [];
    
    // Находим текущего пользователя
    $currentUser = null;
    foreach ($users as $user) {
        if ($user['email'] === $currentEmail) {
            $currentUser = $user;
            break;
        }
    }
    
    if (!$currentUser) {
        throw new Exception('Пользователь не найден');
    }
    
    // Проверяем права директора
    if ($currentUser['role'] !== 'DIRECTOR') {
        throw new Exception('Недостаточно прав для просмотра списка пользователей');
    }
    
    // МАСКИРУЕМ ПАРОЛИ - БЕЗОПАСНОСТЬ!
    $safeUsers = array_map(function($user) {
        // УДАЛЯЕМ ВСЕ СЛЕДЫ ПАРОЛЕЙ
        unset($user['password']);
        unset($user['password_hash']);
        
        return [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'school_id' => $user['school_id'] ?? 1,
            'verified' => $user['verified'] ?? false,
            'created_at' => $user['created_at'] ?? null,
            'updated_at' => $user['updated_at'] ?? null
        ];
    }, $users);
    
    echo json_encode([
        'success' => true,
        'users' => $safeUsers
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка получения списка пользователей: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
