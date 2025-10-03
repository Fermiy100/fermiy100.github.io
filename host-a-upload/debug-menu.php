<?php
header('Content-Type: application/json');

// Точно такой же код как в menu.php
$dataFile = __DIR__ . '/api/menu_data.json';
$menuItems = [];

echo json_encode([
    'step1_file_path' => $dataFile,
    'step2_file_exists' => file_exists($dataFile),
    'step3_file_readable' => is_readable($dataFile),
    'step4_file_size' => file_exists($dataFile) ? filesize($dataFile) : 0,
    'step5_raw_data_first_100' => file_exists($dataFile) ? substr(file_get_contents($dataFile), 0, 100) : null,
    'step6_json_decode_test' => file_exists($dataFile) ? json_decode(substr(file_get_contents($dataFile), 0, 500), true) : null,
    'step7_json_error' => json_last_error_msg()
], JSON_PRETTY_PRINT);
?>
