<?php
header('Content-Type: application/json');

// Эмулируем то же самое что делает menu.php
$dataFile = __DIR__ . '/api/menu_data.json';

if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $menuItems = json_decode($jsonData, true);
    
    if (is_array($menuItems) && count($menuItems) > 0) {
        echo json_encode([
            'test' => 'api_format',
            'data_source' => 'file',
            'total_items' => count($menuItems),
            'first_item' => $menuItems[0],
            'format_check' => [
                'has_id' => isset($menuItems[0]['id']),
                'has_name' => isset($menuItems[0]['name']),
                'has_meal_type' => isset($menuItems[0]['meal_type']),
                'name_value' => $menuItems[0]['name'] ?? null
            ]
        ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode(['error' => 'No data or invalid format']);
    }
} else {
    echo json_encode(['error' => 'File not found']);
}
?>
