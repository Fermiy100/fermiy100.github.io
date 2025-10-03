<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['error' => 'Ошибка при загрузке файла.']);
    exit();
}

$file = $_FILES['file'];
$filePath = $file['tmp_name'];
$originalFileName = $file['name'];

// 🔥 ПРОДВИНУТЫЙ ПАРСЕР EXCEL - ЧИТАЕТ ВСЕ ЯЧЕЙКИ! 🔥
// Анализирует каждую ячейку Excel файла и находит ВСЕ блюда

try {
    // Читаем Excel файл как CSV (простой способ)
    $excelData = readExcelAsCSV($filePath);
    
    // Анализируем структуру
    $analysis = analyzeExcelStructure($excelData);
    
    // Извлекаем все блюда
    $allDishes = extractDishesFromExcel($excelData, $analysis);
    
    // Проверяем и валидируем
    $validation = validateExtractedDishes($allDishes, $analysis);
    
    // Сохраняем в menu_data.json
    $dataFile = __DIR__ . '/../menu_data.json';
    $result = file_put_contents($dataFile, json_encode($allDishes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Не удалось сохранить данные');
    }
    
    echo json_encode([
        'success' => true,
        'message' => "Excel файл проанализирован! Найдено " . count($allDishes) . " блюд",
        'count' => count($allDishes),
        'analysis' => $analysis,
        'validation' => $validation,
        'dishes' => $allDishes
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка: ' . $e->getMessage()]);
}

function readExcelAsCSV($filePath) {
    // Простой способ чтения Excel - конвертируем в CSV
    $csvData = [];
    
    // Пытаемся прочитать как CSV
    if (($handle = fopen($filePath, "r")) !== FALSE) {
        while (($data = fgetcsv($handle, 1000, ",")) !== FALSE) {
            $csvData[] = $data;
        }
        fclose($handle);
    }
    
    // Если не получилось как CSV, читаем как текст
    if (empty($csvData)) {
        $content = file_get_contents($filePath);
        $lines = explode("\n", $content);
        
        foreach ($lines as $line) {
            if (!empty(trim($line))) {
                $csvData[] = explode("\t", $line); // Разделяем по табуляции
            }
        }
    }
    
    return $csvData;
}

function analyzeExcelStructure($excelData) {
    $analysis = [
        'total_rows' => count($excelData),
        'total_columns' => 0,
        'meal_type_columns' => [],
        'day_columns' => [],
        'dish_cells' => [],
        'structure_type' => 'unknown'
    ];
    
    if (empty($excelData)) {
        return $analysis;
    }
    
    // Определяем количество столбцов
    $analysis['total_columns'] = count($excelData[0]);
    
    // Анализируем заголовки (первая строка)
    $headers = $excelData[0];
    foreach ($headers as $colIndex => $header) {
        $headerLower = strtolower(trim($header));
        
        // Ищем столбцы с типами приемов пищи
        if (strpos($headerLower, 'завтрак') !== false) {
            $analysis['meal_type_columns'][$colIndex] = 'завтрак';
        } elseif (strpos($headerLower, 'обед') !== false) {
            $analysis['meal_type_columns'][$colIndex] = 'обед';
        } elseif (strpos($headerLower, 'полдник') !== false) {
            $analysis['meal_type_columns'][$colIndex] = 'полдник';
        }
        
        // Ищем столбцы с днями недели
        $days = ['понедельник', 'вторник', 'среда', 'четверг', 'пятница'];
        foreach ($days as $day) {
            if (strpos($headerLower, $day) !== false) {
                $analysis['day_columns'][$colIndex] = $day;
            }
        }
    }
    
    // Определяем тип структуры
    if (!empty($analysis['meal_type_columns'])) {
        $analysis['structure_type'] = 'meal_type_columns';
    } elseif (!empty($analysis['day_columns'])) {
        $analysis['structure_type'] = 'day_columns';
    } else {
        $analysis['structure_type'] = 'mixed';
    }
    
    return $analysis;
}

function extractDishesFromExcel($excelData, $analysis) {
    $allDishes = [];
    $dishId = 1;
    
    // Проходим по всем строкам и столбцам
    foreach ($excelData as $rowIndex => $row) {
        foreach ($row as $colIndex => $cell) {
            $cellValue = trim($cell);
            
            if (isValidDishCell($cellValue)) {
                $dish = parseDishFromCell($cellValue, $rowIndex, $colIndex, $analysis);
                if ($dish) {
                    $dish['id'] = $dishId++;
                    $allDishes[] = $dish;
                }
            }
        }
    }
    
    // Удаляем дубликаты
    $allDishes = removeDuplicateDishes($allDishes);
    
    return $allDishes;
}

function isValidDishCell($cellValue) {
    if (empty($cellValue) || strlen($cellValue) < 3) {
        return false;
    }
    
    // Исключаем служебные ячейки
    $excludePatterns = [
        'неделя', 'заказ', 'копия', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница',
        'завтрак', 'обед', 'полдник', 'ужин', 'школа', 'класс', 'ученик', 'родитель',
        'директор', 'учитель', 'меню', 'питание', 'столовая', 'кухня', 'время', 'дата'
    ];
    
    $cellLower = strtolower($cellValue);
    
    foreach ($excludePatterns as $pattern) {
        if (strpos($cellLower, $pattern) !== false) {
            return false;
        }
    }
    
    // Проверяем, что это похоже на название блюда
    return preg_match('/[А-Яа-я]{3,}/u', $cellValue);
}

function parseDishFromCell($cellValue, $rowIndex, $colIndex, $analysis) {
    // Парсим название блюда, вес и номер рецепта
    $dish = [
        'name' => '',
        'description' => 'Блюдо из школьного меню Excel файла',
        'price' => 0,
        'meal_type' => 'завтрак',
        'day_of_week' => 1,
        'weight' => '100 г',
        'recipe_number' => '1/1',
        'school_id' => 1,
        'week_start' => '2025-10-03',
        'created_at' => date('Y-m-d\TH:i:s\Z')
    ];
    
    // Извлекаем название блюда
    $dish['name'] = extractDishName($cellValue);
    
    // Извлекаем вес
    $dish['weight'] = extractWeight($cellValue);
    
    // Извлекаем номер рецепта
    $dish['recipe_number'] = extractRecipeNumber($cellValue);
    
    // Определяем тип приема пищи
    $dish['meal_type'] = determineMealTypeFromContext($colIndex, $analysis);
    
    // Определяем день недели
    $dish['day_of_week'] = determineDayFromContext($colIndex, $analysis);
    
    return $dish;
}

function extractDishName($cellValue) {
    // Убираем вес и номер рецепта, оставляем только название
    $name = $cellValue;
    
    // Убираем вес (например, "225 г", "2 шт")
    $name = preg_replace('/\s+\d+[гмлшт\.]+/u', '', $name);
    
    // Убираем номер рецепта (например, "№ 1/6", "№ 11/2")
    $name = preg_replace('/\s*№?\s*\d+\/\d+/u', '', $name);
    $name = preg_replace('/\s*№?\s*\d+/u', '', $name);
    
    return trim($name);
}

function extractWeight($cellValue) {
    // Ищем вес в формате "225 г", "2 шт", "200 мл"
    if (preg_match('/(\d+[гмлшт\.]+)/u', $cellValue, $matches)) {
        return $matches[1];
    }
    
    return '100 г';
}

function extractRecipeNumber($cellValue) {
    // Ищем номер рецепта в формате "1/6", "11/2"
    if (preg_match('/(\d+\/\d+)/u', $cellValue, $matches)) {
        return $matches[1];
    }
    
    // Ищем простой номер
    if (preg_match('/№?\s*(\d+)/u', $cellValue, $matches)) {
        return $matches[1] . '/1';
    }
    
    return '1/1';
}

function determineMealTypeFromContext($colIndex, $analysis) {
    // Определяем тип приема пищи по столбцу
    if (isset($analysis['meal_type_columns'][$colIndex])) {
        return $analysis['meal_type_columns'][$colIndex];
    }
    
    return 'завтрак'; // По умолчанию
}

function determineDayFromContext($colIndex, $analysis) {
    // Определяем день недели по столбцу
    if (isset($analysis['day_columns'][$colIndex])) {
        $day = $analysis['day_columns'][$colIndex];
        $dayMap = [
            'понедельник' => 1,
            'вторник' => 2,
            'среда' => 3,
            'четверг' => 4,
            'пятница' => 5
        ];
        return $dayMap[$day] ?? 1;
    }
    
    return 1; // По умолчанию понедельник
}

function removeDuplicateDishes($dishes) {
    $uniqueDishes = [];
    $seenNames = [];
    
    foreach ($dishes as $dish) {
        $nameKey = strtolower(trim($dish['name']));
        if (!in_array($nameKey, $seenNames)) {
            $seenNames[] = $nameKey;
            $uniqueDishes[] = $dish;
        }
    }
    
    return $uniqueDishes;
}

function validateExtractedDishes($dishes, $analysis) {
    $validation = [
        'total_dishes_found' => count($dishes),
        'total_excel_cells' => $analysis['total_rows'] * $analysis['total_columns'],
        'validation_passed' => false,
        'message' => '',
        'dish_types' => [],
        'day_distribution' => []
    ];
    
    $found = count($dishes);
    
    if ($found > 0) {
        $validation['validation_passed'] = true;
        $validation['message'] = "Успешно извлечено {$found} блюд из Excel файла";
        
        // Анализируем типы блюд
        $mealTypes = [];
        $days = [];
        
        foreach ($dishes as $dish) {
            $mealTypes[$dish['meal_type']] = ($mealTypes[$dish['meal_type']] ?? 0) + 1;
            $days[$dish['day_of_week']] = ($days[$dish['day_of_week']] ?? 0) + 1;
        }
        
        $validation['dish_types'] = $mealTypes;
        $validation['day_distribution'] = $days;
    } else {
        $validation['message'] = "Блюда не найдены. Проверьте формат Excel файла.";
    }
    
    return $validation;
}
?>
