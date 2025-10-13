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
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['name']) || !isset($input['email']) || !isset($input['password'])) {
        throw new Exception('Не указаны обязательные поля');
    }
    
    $name = trim($input['name']);
    $email = trim($input['email']);
    $password = trim($input['password']);
    $role = $input['role'] ?? 'PARENT';
    
    // Валидация
    if (empty($name) || empty($email) || empty($password)) {
        throw new Exception('Все поля обязательны для заполнения');
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        throw new Exception('Некорректный email');
    }
    
    if (strlen($password) < 6) {
        throw new Exception('Пароль должен содержать минимум 6 символов');
    }
    
    // Читаем существующих пользователей
    $usersFile = __DIR__ . '/../../users.json';
    $users = [];
    
    if (file_exists($usersFile)) {
        $users = json_decode(file_get_contents($usersFile), true) ?: [];
    }
    
    // Проверяем, не существует ли уже пользователь с таким email
    foreach ($users as $user) {
        if ($user['email'] === $email) {
            throw new Exception('Пользователь с таким email уже существует');
        }
    }
    
    // Создаем нового пользователя
    $newUser = [
        'id' => count($users) + 1,
        'name' => $name,
        'email' => $email,
        'password' => $password, // В реальном приложении нужно хешировать
        'role' => $role,
        'school_id' => 1, // По умолчанию школа TOP IT Дегунино
        'verified' => true, // Автоматически верифицируем
        'created_at' => date('c'),
        'updated_at' => date('c')
    ];
    
    $users[] = $newUser;
    
    // Сохраняем пользователей
    $result = file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Ошибка сохранения пользователя');
    }
    
    // Возвращаем пользователя без пароля
    unset($newUser['password']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Пользователь успешно создан',
        'user' => $newUser
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка создания пользователя: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
