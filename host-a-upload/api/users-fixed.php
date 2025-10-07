<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Обработка GET запроса для получения списка пользователей
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Mock список пользователей
    $users = [
        [
            'id' => 1,
            'email' => 'director@school.test',
            'name' => 'Директор школы',
            'role' => 'director',
            'school_id' => 1,
            'verified' => true,
            'created_at' => '2025-10-07T10:00:00Z'
        ],
        [
            'id' => 2,
            'email' => 'parent@school.test',
            'name' => 'Родитель',
            'role' => 'parent',
            'school_id' => 1,
            'verified' => true,
            'created_at' => '2025-10-07T10:00:00Z'
        ],
        [
            'id' => 3,
            'email' => 'teacher@school.test',
            'name' => 'Учитель',
            'role' => 'teacher',
            'school_id' => 1,
            'verified' => false,
            'created_at' => '2025-10-07T10:00:00Z'
        ],
        [
            'id' => 4,
            'email' => 'student@school.test',
            'name' => 'Ученик',
            'role' => 'student',
            'school_id' => 1,
            'verified' => true,
            'created_at' => '2025-10-07T10:00:00Z'
        ]
    ];
    
    echo json_encode($users);
    exit();
}

// Обработка POST запроса для создания пользователя
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);

    if (!$input || !isset($input['email']) || !isset($input['name']) || !isset($input['role']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Все поля обязательны']);
        exit();
    }

    // Mock successful user creation
    $newUser = [
        'id' => rand(100, 999),
        'email' => $input['email'],
        'name' => $input['name'],
        'role' => $input['role'],
        'school_id' => 1,
        'verified' => false,
        'created_at' => date('c')
    ];

    echo json_encode($newUser);
    exit();
}

// Если метод не поддерживается
http_response_code(405);
echo json_encode(['error' => 'Method not allowed']);
?>
