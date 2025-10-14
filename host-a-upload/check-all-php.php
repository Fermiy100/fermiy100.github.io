<?php
/**
 * ПРОВЕРКА ВСЕХ PHP ФАЙЛОВ
 * Запустите: php check-all-php.php
 */

echo "═══════════════════════════════════════\n";
echo "   ПРОВЕРКА PHP ФАЙЛОВ\n";
echo "═══════════════════════════════════════\n\n";

$errors = [];
$warnings = [];
$success = [];

// Рекурсивная проверка PHP файлов
function checkPHPFiles($dir) {
    global $errors, $warnings, $success;
    
    $files = glob($dir . '/*.php');
    foreach ($files as $file) {
        echo "Проверяю: $file... ";
        
        // Проверка синтаксиса
        exec("php -l " . escapeshellarg($file) . " 2>&1", $output, $returnCode);
        
        if ($returnCode !== 0) {
            $errors[] = [
                'file' => $file,
                'error' => implode("\n", $output)
            ];
            echo "❌ ОШИБКА\n";
        } else {
            $success[] = $file;
            echo "✅ OK\n";
        }
        
        // Проверяем потенциальные проблемы
        $content = file_get_contents($file);
        
        // 1. Открытые пароли
        if (preg_match('/[\'"]password[\'"]\s*=>/i', $content) && !preg_match('/password_hash/', $content)) {
            $warnings[] = [
                'file' => $file,
                'warning' => 'Возможно хранение паролей в открытом виде'
            ];
        }
        
        // 2. Отсутствие CORS headers
        if (strpos($content, '<?php') !== false && strpos($content, 'Access-Control-Allow-Origin') === false) {
            $warnings[] = [
                'file' => $file,
                'warning' => 'Отсутствуют CORS headers'
            ];
        }
        
        // 3. SQL инъекции (если есть)
        if (preg_match('/\$_(GET|POST|REQUEST)\[.*?\].*?mysql_query/i', $content)) {
            $warnings[] = [
                'file' => $file,
                'warning' => 'Возможна SQL инъекция'
            ];
        }
    }
    
    // Проверка поддиректорий
    $subdirs = glob($dir . '/*', GLOB_ONLYDIR);
    foreach ($subdirs as $subdir) {
        checkPHPFiles($subdir);
    }
}

// Начинаем проверку
checkPHPFiles(__DIR__ . '/api');

echo "\n";
echo "═══════════════════════════════════════\n";
echo "   РЕЗУЛЬТАТЫ\n";
echo "═══════════════════════════════════════\n\n";

echo "✅ Успешно проверено: " . count($success) . " файлов\n";
echo "⚠️  Предупреждений: " . count($warnings) . "\n";
echo "❌ Ошибок: " . count($errors) . "\n\n";

if (count($errors) > 0) {
    echo "═══════════════════════════════════════\n";
    echo "   ОШИБКИ:\n";
    echo "═══════════════════════════════════════\n";
    foreach ($errors as $error) {
        echo "\n❌ " . $error['file'] . "\n";
        echo $error['error'] . "\n";
    }
}

if (count($warnings) > 0) {
    echo "\n═══════════════════════════════════════\n";
    echo "   ПРЕДУПРЕЖДЕНИЯ:\n";
    echo "═══════════════════════════════════════\n";
    foreach ($warnings as $warning) {
        echo "\n⚠️  " . $warning['file'] . "\n";
        echo "   " . $warning['warning'] . "\n";
    }
}

echo "\n═══════════════════════════════════════\n";

if (count($errors) === 0) {
    echo "✅ ВСЕ ФАЙЛЫ В ПОРЯДКЕ!\n";
} else {
    echo "❌ НАЙДЕНЫ ОШИБКИ! НЕОБХОДИМО ИСПРАВИТЬ!\n";
}

echo "═══════════════════════════════════════\n";

exit(count($errors) > 0 ? 1 : 0);
?>
