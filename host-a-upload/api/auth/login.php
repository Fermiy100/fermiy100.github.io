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

if (!$input || !isset($input['email']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Email and password required']);
    exit();
}

// Mock authentication - UPDATED CREDENTIALS
$validUsers = [
    'director@school.test' => [
        'id' => 1,
        'email' => 'director@school.test',
        'name' => 'Директор школы',
        'role' => 'DIRECTOR',
        'school_id' => 1,
        'verified' => true,
        'password' => 'P@ssw0rd1!'
    ],
    'parent@school.test' => [
        'id' => 2,
        'email' => 'parent@school.test',
        'name' => 'Родитель',
        'role' => 'PARENT',
        'school_id' => 1,
        'verified' => true,
        'password' => 'P@ssw0rd1!'
    ]
];

$email = $input['email'];
$password = $input['password'];

if (isset($validUsers[$email]) && $validUsers[$email]['password'] === $password) {
    $user = $validUsers[$email];
    unset($user['password']); // Remove password from response
    
    // Generate simple test token
    $token = $user['role'] === 'DIRECTOR' ? 'test-director-token' : 'test-parent-token';
    
    $response = [
        'token' => $token,
        'user' => $user
    ];
    
    echo json_encode($response);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
?>
