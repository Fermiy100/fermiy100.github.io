<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/api/menu_data.json';

if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $dishes = json_decode($jsonData, true);
    
    echo json_encode([
        'file_exists' => true,
        'file_size' => filesize($dataFile),
        'dishes_count' => is_array($dishes) ? count($dishes) : 0,
        'json_error' => json_last_error_msg(),
        'sample_names' => is_array($dishes) ? array_slice(array_column($dishes, 'name'), 0, 5) : []
    ], JSON_PRETTY_PRINT);
} else {
    echo json_encode(['file_exists' => false]);
}
?>
