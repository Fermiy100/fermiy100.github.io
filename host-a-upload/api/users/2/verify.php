<?php
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
    $userId = 2; // ID пользователя из URL
    
    $usersFile = __DIR__ . '/../../../users.json';
    
    if (!file_exists($usersFile)) {
        throw new Exception('Файл пользователей не найден');
    }
    
    $users = json_decode(file_get_contents($usersFile), true);
    
    if ($users === null) {
        throw new Exception('Ошибка чтения данных пользователей');
    }
    
    // Находим пользователя по ID
    $userFound = false;
    foreach ($users as &$user) {
        if ($user['id'] == $userId) {
            $user['verified'] = true;
            $userFound = true;
            break;
        }
    }
    
    if (!$userFound) {
        throw new Exception('Пользователь не найден');
    }
    
    // Сохраняем обновленные данные
    file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    echo json_encode([
        'success' => true,
        'message' => 'Пользователь успешно верифицирован',
        'userId' => $userId
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка верификации пользователя: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
