<?php
header('Content-Type: application/json');

function scan_directory($dir, $base = '') {
    $result = [];
    if (is_dir($dir)) {
        $files = scandir($dir);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                $path = $dir . '/' . $file;
                $relativePath = $base ? $base . '/' . $file : $file;
                if (is_dir($path)) {
                    $result[$file] = scan_directory($path, $relativePath);
                } else {
                    $result[] = $relativePath . ' (' . filesize($path) . ' bytes)';
                }
            }
        }
    }
    return $result;
}

$structure = scan_directory(__DIR__);

echo json_encode([
    'current_dir' => __DIR__,
    'structure' => $structure,
    'api_exists' => is_dir(__DIR__ . '/api'),
    'auth_exists' => is_dir(__DIR__ . '/api/auth'),
    'login_exists' => file_exists(__DIR__ . '/api/auth/login.php'),
    'me_exists' => file_exists(__DIR__ . '/api/auth/me.php'),
    'menu_exists' => file_exists(__DIR__ . '/api/menu.php'),
    'upload_exists' => file_exists(__DIR__ . '/api/menu/upload.php')
], JSON_PRETTY_PRINT);
?>
