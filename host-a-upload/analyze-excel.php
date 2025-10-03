<?php
ini_set('display_errors', 1);
error_reporting(E_ALL);

echo "<h1>🔍 Анализ Excel файла</h1>";

$excelFile = __DIR__ . '/2-Я НЕДЕЛЯ ДЛЯ ЗАКАЗА  22.09-26.09 (копия) — копия.xlsx';

if (!file_exists($excelFile)) {
    echo "<p style='color: red;'>❌ Файл не найден: $excelFile</p>";
    exit;
}

echo "<p>✅ Файл найден: " . basename($excelFile) . "</p>";
echo "<p>📏 Размер: " . number_format(filesize($excelFile)) . " байт</p>";

// Пытаемся прочитать Excel файл простым способом
try {
    // Для CSV
    if (($handle = fopen($excelFile, "r")) !== FALSE) {
        echo "<h2>📋 Попытка чтения как текст:</h2>";
        $content = fread($handle, 1000); // Первые 1000 байт
        echo "<pre>" . htmlspecialchars(substr($content, 0, 500)) . "</pre>";
        fclose($handle);
    }
} catch (Exception $e) {
    echo "<p>⚠️ Не удается прочитать как текст: " . $e->getMessage() . "</p>";
}

// Проверим есть ли ZIP архив внутри (XLSX = ZIP)
try {
    if (class_exists('ZipArchive')) {
        echo "<h2>📦 Анализ как ZIP архив (XLSX):</h2>";
        $zip = new ZipArchive();
        if ($zip->open($excelFile) === TRUE) {
            echo "<p>✅ Успешно открыт как ZIP</p>";
            echo "<p>📁 Количество файлов: " . $zip->numFiles . "</p>";
            
            echo "<h3>📋 Содержимое архива:</h3>";
            for ($i = 0; $i < min($zip->numFiles, 10); $i++) {
                $filename = $zip->getNameIndex($i);
                echo "<li>" . htmlspecialchars($filename) . "</li>";
            }
            
            // Пытаемся прочитать sharedStrings.xml
            $sharedStrings = $zip->getFromName('xl/sharedStrings.xml');
            if ($sharedStrings) {
                echo "<h3>🔤 Общие строки (первые 2000 символов):</h3>";
                echo "<pre>" . htmlspecialchars(substr($sharedStrings, 0, 2000)) . "</pre>";
            }
            
            // Пытаемся прочитать worksheet
            $worksheet = $zip->getFromName('xl/worksheets/sheet1.xml');
            if ($worksheet) {
                echo "<h3>📊 Рабочий лист (первые 2000 символов):</h3>";
                echo "<pre>" . htmlspecialchars(substr($worksheet, 0, 2000)) . "</pre>";
            }
            
            $zip->close();
        } else {
            echo "<p>❌ Не удается открыть как ZIP</p>";
        }
    } else {
        echo "<p>⚠️ ZipArchive класс недоступен</p>";
    }
} catch (Exception $e) {
    echo "<p>❌ Ошибка ZIP: " . $e->getMessage() . "</p>";
}

echo "<h2>💡 Рекомендации:</h2>";
echo "<p>1. Попробуйте конвертировать Excel в CSV</p>";
echo "<p>2. Или используйте библиотеку PhpSpreadsheet</p>";
echo "<p>3. Или создайте простой парсер на основе видимой структуры</p>";
?>
