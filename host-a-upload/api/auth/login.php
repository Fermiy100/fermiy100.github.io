<?php
require_once __DIR__ . '/../security/validate.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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
    
    if (!$input || !isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Не указаны email или пароль');
    }
    
    $email = $input['email'];
    $password = $input['password'];
    
    // RATE LIMITING - защита от брутфорса
    $rateLimitKey = 'login_' . $_SERVER['REMOTE_ADDR'];
    $rateCheck = SecurityValidator::checkRateLimit($rateLimitKey, 5, 300); // 5 попыток за 5 минут
    if (!$rateCheck['valid']) {
        http_response_code(429);
        echo json_encode([
            'success' => false,
            'error' => $rateCheck['error']
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Проверяем пользователей
    $usersFile = __DIR__ . '/../../data/users.json';
    $users = [];
    
    if (file_exists($usersFile)) {
        $users = json_decode(file_get_contents($usersFile), true) ?: [];
    }
    
    // Ищем пользователя
    $user = null;
    foreach ($users as $u) {
        if ($u['email'] === $email) {
            // ПРОВЕРЯЕМ ХЕШИРОВАННЫЙ ПАРОЛЬ
            if (isset($u['password_hash']) && password_verify($password, $u['password_hash'])) {
                $user = $u;
                break;
            }
            // Временная совместимость со старыми паролями
            elseif (isset($u['password']) && $u['password'] === $password) {
                $user = $u;
                break;
            }
        }
    }
    
    if (!$user) {
        SecurityValidator::logSecurityEvent('failed_login', [
            'email' => $email,
            'ip' => $_SERVER['REMOTE_ADDR']
        ]);
        
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Неверный email или пароль'
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
    
    // Создаем токен (простой)
    $token = base64_encode($user['email'] . ':' . time());
    
    SecurityValidator::logSecurityEvent('successful_login', [
        'user_id' => $user['id'],
        'email' => $user['email']
    ]);
    
    echo json_encode([
        'success' => true,
        'message' => 'Вход выполнен успешно',
        'user' => [
            'id' => $user['id'],
            'email' => $user['email'],
            'name' => $user['name'],
            'role' => $user['role'],
            'school_id' => $user['school_id'] ?? 1,
            'verified' => $user['verified'] ?? false
        ],
        'token' => $token
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка входа: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>