<?php
header('Content-Type: application/json');

$dataFile = __DIR__ . '/api/menu_data.json';

echo json_encode([
    'file_exists' => file_exists($dataFile),
    'file_readable' => is_readable($dataFile),
    'file_size' => filesize($dataFile),
    'file_path' => $dataFile,
    'current_dir' => __DIR__,
    'sample_data' => file_exists($dataFile) ? json_decode(substr(file_get_contents($dataFile), 0, 500), true) : null
], JSON_PRETTY_PRINT);
?>
