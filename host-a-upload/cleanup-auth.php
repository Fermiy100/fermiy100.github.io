<?php
header('Content-Type: application/json');

$auth_dir = __DIR__ . '/api/auth/';
$files_to_remove = [];
$errors = [];

if (is_dir($auth_dir)) {
    $files = scandir($auth_dir);
    foreach ($files as $file) {
        if ($file != '.' && $file != '..' && $file != 'login.php' && $file != 'me.php') {
            $file_path = $auth_dir . $file;
            if (is_file($file_path)) {
                if (unlink($file_path)) {
                    $files_to_remove[] = $file . ' - removed';
                } else {
                    $errors[] = 'Failed to remove: ' . $file;
                }
            }
        }
    }
} else {
    $errors[] = 'Auth directory does not exist';
}

echo json_encode([
    'message' => 'Cleanup completed',
    'removed_files' => $files_to_remove,
    'errors' => $errors,
    'auth_dir_exists' => is_dir($auth_dir),
    'remaining_files' => is_dir($auth_dir) ? array_diff(scandir($auth_dir), ['.', '..']) : []
], JSON_PRETTY_PRINT);
?>
