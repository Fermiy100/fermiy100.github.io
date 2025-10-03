<?php
header('Content-Type: application/json');

$files_to_check = [
    'api/menu/upload.php',
    'api/menu/upload-simple.php', 
    'api/menu.php',
    'api/auth/login.php',
    'api/auth/me.php'
];

$results = [];
foreach ($files_to_check as $file) {
    $path = __DIR__ . '/' . $file;
    $results[$file] = [
        'exists' => file_exists($path),
        'size' => file_exists($path) ? filesize($path) : 0,
        'modified' => file_exists($path) ? date('Y-m-d H:i:s', filemtime($path)) : null,
        'readable' => file_exists($path) ? is_readable($path) : false
    ];
}

$response = [
    'server_time' => date('Y-m-d H:i:s'),
    'current_dir' => __DIR__,
    'files' => $results,
    'php_version' => phpversion(),
    'upload_max_filesize' => ini_get('upload_max_filesize'),
    'post_max_size' => ini_get('post_max_size')
];

echo json_encode($response, JSON_PRETTY_PRINT);
?>
