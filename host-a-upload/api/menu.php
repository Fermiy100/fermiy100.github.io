<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Читаем данные из файла (если существует), иначе используем mock данные
$dataFile = __DIR__ . '/menu_data.json';
$menuItems = [];

if (file_exists($dataFile)) {
    $jsonData = file_get_contents($dataFile);
    $menuItems = json_decode($jsonData, true);
    
    if (!$menuItems || !is_array($menuItems)) {
        $menuItems = [];
    }
} 

// Если файл пустой или нет данных, возвращаем пустой массив
if (empty($menuItems)) {
    $menuItems = [];
}

// Возвращаем прямой массив блюд как ожидает frontend
echo json_encode($menuItems);
?>