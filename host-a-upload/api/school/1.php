<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Mock school data
$school = [
    'id' => 1,
    'name' => 'Школа №1',
    'address' => 'ул. Школьная, 1',
    'director_id' => 1
];

echo json_encode($school);
?>