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
    
    // Получаем данные из запроса
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        throw new Exception('Неверные данные запроса');
    }
    
    // Валидация входных данных
    $name = trim($input['name'] ?? '');
    $email = trim($input['email'] ?? '');
    $password = $input['password'] ?? '';
    
    $nameValidation = SecurityValidator::validateName($name);
    if (!$nameValidation['valid']) {
        throw new Exception($nameValidation['error']);
    }
    
    $emailValidation = SecurityValidator::validateEmail($email);
    if (!$emailValidation['valid']) {
        throw new Exception($emailValidation['error']);
    }
    
    if (!empty($password)) {
        $passwordValidation = SecurityValidator::validatePassword($password);
        if (!$passwordValidation['valid']) {
            throw new Exception($passwordValidation['error']);
        }
    }
    
    // Санитизация данных
    $name = SecurityValidator::sanitizeString($name, 50);
    $email = SecurityValidator::sanitizeString($email, 100);
    
    // Загружаем пользователей
    $usersFile = __DIR__ . '/../../data/users.json';
    
    if (!file_exists($usersFile)) {
        throw new Exception('Файл пользователей не найден');
    }
    
    $users = json_decode(file_get_contents($usersFile), true) ?: [];
    
    // Находим текущего пользователя
    $userIndex = -1;
    foreach ($users as $index => $user) {
        if ($user['email'] === $currentEmail) {
            $userIndex = $index;
            break;
        }
    }
    
    if ($userIndex === -1) {
        throw new Exception('Пользователь не найден');
    }
    
    // Проверяем, не занят ли новый email другим пользователем
    if ($email !== $currentEmail) {
        foreach ($users as $user) {
            if ($user['email'] === $email) {
                throw new Exception('Email уже используется другим пользователем');
            }
        }
    }
    
    // Обновляем данные пользователя
    $users[$userIndex]['name'] = $name;
    $users[$userIndex]['email'] = $email;
    $users[$userIndex]['updated_at'] = date('c');
    
    // Если указан новый пароль, хешируем его
    if (!empty($password)) {
        $users[$userIndex]['password_hash'] = password_hash($password, PASSWORD_DEFAULT);
    }
    
    // Сохраняем обновленных пользователей
    if (!file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
        throw new Exception('Ошибка сохранения данных');
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Профиль успешно обновлен',
        'user' => [
            'id' => $users[$userIndex]['id'],
            'email' => $users[$userIndex]['email'],
            'name' => $users[$userIndex]['name'],
            'role' => $users[$userIndex]['role'],
            'school_id' => $users[$userIndex]['school_id'] ?? 1
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка обновления профиля: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
