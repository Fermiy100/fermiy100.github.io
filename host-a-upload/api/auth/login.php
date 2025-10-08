<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Получаем данные из POST запроса
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Неверные данные запроса'
    ]);
    exit();
}

$email = $input['email'];
$password = $input['password'];

// Проверяем учетные данные
$validUsers = [
    'director@school.test' => [
        'password' => 'P@ssw0rd1!',
        'role' => 'DIRECTOR',
        'name' => 'Директор школы'
    ],
    'parent@school.test' => [
        'password' => 'P@ssw0rd1!',
        'role' => 'PARENT',
        'name' => 'Родитель/Ученик'
    ]
];

if (isset($validUsers[$email]) && $validUsers[$email]['password'] === $password) {
    $user = $validUsers[$email];
    
    echo json_encode([
        'success' => true,
        'token' => $email, // Используем email как токен
        'user' => [
            'id' => $email === 'director@school.test' ? 1 : 2,
            'email' => $email,
            'name' => $user['name'],
            'role' => $user['role'],
            'school_id' => 1,
            'verified' => true
        ]
    ], JSON_UNESCAPED_UNICODE);
} else {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'error' => 'Неверные учетные данные'
    ], JSON_UNESCAPED_UNICODE);
}
?>