<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
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
?>
