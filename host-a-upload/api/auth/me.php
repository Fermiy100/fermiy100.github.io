<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Возвращаем информацию о текущем пользователе
$user = [
    'success' => true,
    'user' => [
        'id' => 1,
        'email' => 'director@school.test',
        'name' => 'Директор школы',
        'role' => 'DIRECTOR',
        'school_id' => 1,
        'verified' => true
    ]
];

echo json_encode($user, JSON_UNESCAPED_UNICODE);
?>