<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Файл для хранения пользователей
$usersFile = '../data/users.json';

// Создаем директорию если не существует
if (!file_exists('../data/')) {
    mkdir('../data/', 0777, true);
}

// Загружаем пользователей
function loadUsers() {
    global $usersFile;
    if (file_exists($usersFile)) {
        $data = json_decode(file_get_contents($usersFile), true);
        return is_array($data) ? $data : [];
    }
    return [];
}

// Сохраняем пользователей
function saveUsers($users) {
    global $usersFile;
    file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// Инициализируем базовых пользователей если файл пустой
$users = loadUsers();
if (empty($users)) {
    $users = [
        [
            'id' => 1,
            'email' => 'director@school.test',
            'name' => 'Директор школы',
            'role' => 'DIRECTOR',
            'school_id' => 1,
            'verified' => true,
            'created_at' => '2025-01-07T10:00:00Z'
        ]
    ];
    saveUsers($users);
}

// Обрабатываем запросы
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        // Возвращаем всех пользователей
        echo json_encode($users, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'POST':
        // Создаем нового пользователя
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input) {
            http_response_code(400);
            echo json_encode(['error' => 'Неверные данные'], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        // Проверяем обязательные поля
        if (empty($input['email']) || empty($input['name']) || empty($input['school_id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'Не указана школа или другие обязательные поля'], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        // Проверяем, что email уникален
        foreach ($users as $user) {
            if ($user['email'] === $input['email']) {
                http_response_code(400);
                echo json_encode(['error' => 'Пользователь с таким email уже существует'], JSON_UNESCAPED_UNICODE);
                exit();
            }
        }
        
        // Создаем нового пользователя
        $newUser = [
            'id' => max(array_column($users, 'id')) + 1,
            'email' => $input['email'],
            'name' => $input['name'],
            'role' => $input['role'] ?? 'PARENT',
            'school_id' => $input['school_id'],
            'verified' => false,
            'created_at' => date('c')
        ];
        
        $users[] = $newUser;
        saveUsers($users);
        
        echo json_encode($newUser, JSON_UNESCAPED_UNICODE);
        break;
        
    case 'PATCH':
        // Верификация пользователя
        $input = json_decode(file_get_contents('php://input'), true);
        $userId = $input['id'] ?? null;
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(['error' => 'ID пользователя не указан'], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        // Находим и обновляем пользователя
        $found = false;
        foreach ($users as &$user) {
            if ($user['id'] == $userId) {
                $user['verified'] = true;
                $found = true;
                break;
            }
        }
        
        if (!$found) {
            http_response_code(404);
            echo json_encode(['error' => 'Пользователь не найден'], JSON_UNESCAPED_UNICODE);
            exit();
        }
        
        saveUsers($users);
        echo json_encode(['success' => true, 'message' => 'Пользователь верифицирован'], JSON_UNESCAPED_UNICODE);
        break;
        
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Метод не поддерживается'], JSON_UNESCAPED_UNICODE);
        break;
}
?>