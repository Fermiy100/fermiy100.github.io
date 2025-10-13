<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Получить всех пользователей
    try {
        $usersFile = __DIR__ . '/../users.json';
        $users = [];
        
        if (file_exists($usersFile)) {
            $users = json_decode(file_get_contents($usersFile), true) ?: [];
        }
        
        echo json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
    } catch (Exception $e) {
        error_log("❌ Ошибка получения пользователей: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Создать нового пользователя
    try {
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['email']) || !isset($input['name'])) {
            throw new Exception('Недостаточно данных для создания пользователя');
        }
        
        $usersFile = __DIR__ . '/../users.json';
        $users = [];
        
        if (file_exists($usersFile)) {
            $users = json_decode(file_get_contents($usersFile), true) ?: [];
        }
        
        // Проверяем, не существует ли уже пользователь с таким email
        foreach ($users as $user) {
            if ($user['email'] === $input['email']) {
                throw new Exception('Пользователь с таким email уже существует');
            }
        }
        
        // Находим максимальный ID
        $maxId = 0;
        foreach ($users as $user) {
            if (isset($user['id']) && $user['id'] > $maxId) {
                $maxId = $user['id'];
            }
        }
        
        // Генерируем пароль
        $password = generatePassword();
        
        $newUser = [
            'id' => $maxId + 1,
            'email' => $input['email'],
            'name' => $input['name'],
            'password' => $password,
            'role' => $input['role'] ?? 'parent',
            'school_id' => $input['school_id'] ?? 1,
            'created_at' => date('c'),
            'verified' => false
        ];
        
        $users[] = $newUser;
        
        file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
        
        echo json_encode([
            'success' => true,
            'message' => 'Пользователь успешно создан',
            'user' => [
                'id' => $newUser['id'],
                'email' => $newUser['email'],
                'name' => $newUser['name'],
                'role' => $newUser['role'],
                'school_id' => $newUser['school_id'],
                'password' => $password
            ]
        ], JSON_UNESCAPED_UNICODE);
        
    } catch (Exception $e) {
        error_log("❌ Ошибка создания пользователя: " . $e->getMessage());
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
    
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}

function generatePassword($length = 12) {
    $characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    $password = '';
    for ($i = 0; $i < $length; $i++) {
        $password .= $characters[rand(0, strlen($characters) - 1)];
    }
    return $password;
}
?>