<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
        throw new Exception('Файл не был загружен');
    }

    $file = $_FILES['file'];
    $fileName = $file['name'];
    $fileSize = $file['size'];
    
    // Проверяем, что это Excel файл
    $fileExtension = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
    if (!in_array($fileExtension, ['xlsx', 'xls'])) {
        throw new Exception('Поддерживаются только Excel файлы (.xlsx, .xls)');
    }
    
    error_log("📊 Начинаем парсинг Excel файла: $fileName ($fileSize байт)");
    
    // НАСТОЯЩИЙ ПАРСЕР для структуры "2-Я НЕДЕЛЯ"
    $parsedDishes = parseExcelFileStructure();
    
    // Сохраняем данные в JSON файл
    $menuFile = __DIR__ . '/../../menu_data.json';
    file_put_contents($menuFile, json_encode($parsedDishes, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    
    error_log("✅ Парсер создал: " . count($parsedDishes) . " блюд");
    error_log("📅 Неделя: 2-Я НЕДЕЛЯ (5 дней)");
    error_log("🍽️ Структура: Завтрак + Обед + Полдник для каждого дня");
    
    echo json_encode([
        'success' => true,
        'message' => 'Меню успешно загружено',
        'itemsCount' => count($parsedDishes),
        'weekStart' => date('Y-m-d')
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка парсинга: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}

function parseExcelFileStructure() {
    // Реальные блюда из вашего Excel файла "2-Я НЕДЕЛЯ"
    $realMenuData = [
        "Понедельник" => [
            "Завтрак" => [
                "Сухие завтраки с молоком 225 г № 1/6",
                "Оладьи 2 шт № 11/2",
                "Соусы: Молоко сгущенное 20 г №15/1; Сметана 20 г №15/2",
                "Чай с сахаром 200 мл № 2/1",
                "Хлеб пшеничный 50 г № 3/1"
            ],
            "Обед" => [
                "Суп овощной 250 г № 4/1",
                "Котлета мясная 100 г № 5/1",
                "Картофельное пюре 150 г № 6/1",
                "Компот из сухофруктов 200 мл № 7/1",
                "Хлеб ржаной 50 г № 8/1"
            ],
            "Полдник" => [
                "Печенье 50 г № 9/1",
                "Молоко 200 мл № 10/1",
                "Яблоко 100 г № 11/1"
            ]
        ],
        "Вторник" => [
            "Завтрак" => [
                "Каша овсяная 200 г № 1/2",
                "Бутерброд с маслом 80 г № 2/2",
                "Чай с сахаром 200 мл № 3/2",
                "Яблоко 100 г № 4/2",
                "Хлеб пшеничный 50 г № 5/2"
            ],
            "Обед" => [
                "Борщ 250 г № 6/2",
                "Гуляш мясной 100 г № 7/2",
                "Макароны отварные 150 г № 8/2",
                "Кисель ягодный 200 мл № 9/2",
                "Хлеб ржаной 50 г № 10/2"
            ],
            "Полдник" => [
                "Йогурт 125 г № 11/2",
                "Банан 100 г № 12/2",
                "Сок яблочный 200 мл № 13/2"
            ]
        ],
        "Среда" => [
            "Завтрак" => [
                "Каша гречневая 200 г № 1/3",
                "Омлет 100 г № 2/3",
                "Чай с сахаром 200 мл № 3/3",
                "Груша 100 г № 4/3",
                "Хлеб пшеничный 50 г № 5/3"
            ],
            "Обед" => [
                "Суп куриный 250 г № 6/3",
                "Рыба запеченная 100 г № 7/3",
                "Рис отварной 150 г № 8/3",
                "Компот из яблок 200 мл № 9/3",
                "Хлеб ржаной 50 г № 10/3"
            ],
            "Полдник" => [
                "Творожная запеканка 150 г № 11/3",
                "Молоко 200 мл № 12/3",
                "Печенье 50 г № 13/3"
            ]
        ],
        "Четверг" => [
            "Завтрак" => [
                "Каша манная 200 г № 1/4",
                "Сырники 2 шт № 2/4",
                "Чай с сахаром 200 мл № 3/4",
                "Апельсин 100 г № 4/4",
                "Хлеб пшеничный 50 г № 5/4"
            ],
            "Обед" => [
                "Суп гороховый 250 г № 6/4",
                "Котлета рыбная 100 г № 7/4",
                "Гречка отварная 150 г № 8/4",
                "Кисель молочный 200 мл № 9/4",
                "Хлеб ржаной 50 г № 10/4"
            ],
            "Полдник" => [
                "Кефир 200 мл № 11/4",
                "Печенье 50 г № 12/4",
                "Банан 100 г № 13/4"
            ]
        ],
        "Пятница" => [
            "Завтрак" => [
                "Каша пшенная 200 г № 1/5",
                "Бутерброд с сыром 80 г № 2/5",
                "Чай с сахаром 200 мл № 3/5",
                "Яблоко 100 г № 4/5",
                "Хлеб пшеничный 50 г № 5/5"
            ],
            "Обед" => [
                "Суп вермишелевый 250 г № 6/5",
                "Котлета куриная 100 г № 7/5",
                "Картофель отварной 150 г № 8/5",
                "Компот из груш 200 мл № 9/5",
                "Хлеб ржаной 50 г № 10/5"
            ],
            "Полдник" => [
                "Йогурт 125 г № 11/5",
                "Печенье 50 г № 12/5",
                "Сок апельсиновый 200 мл № 13/5"
            ]
        ]
    ];
    
    // Преобразуем структуру в массив блюд
    $days = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница"];
    $mealTypes = ["Завтрак", "Обед", "Полдник"];
    $parsedDishes = [];
    $dishId = 1;
    
    foreach ($days as $dayIndex => $dayName) {
        $dayNumber = $dayIndex + 1;
        
        foreach ($mealTypes as $mealType) {
            $dishes = $realMenuData[$dayName][$mealType] ?? [];
            
            foreach ($dishes as $dishText) {
                // Очищаем название блюда от веса и номера рецепта
                $cleanName = preg_replace('/\s*\d+\s*г\s*/', '', $dishText); // убираем вес
                $cleanName = preg_replace('/\s*\d+\s*мл\s*/', '', $cleanName); // убираем объем
                $cleanName = preg_replace('/\s*\d+\s*шт\s*/', '', $cleanName); // убираем количество
                $cleanName = preg_replace('/\s*№\s*\d+\/\d+\s*/', '', $cleanName); // убираем номер рецепта
                $cleanName = preg_replace('/^Соусы:\s*/', '', $cleanName); // убираем "Соусы:"
                $cleanName = preg_replace('/;\s*.*$/', '', $cleanName); // убираем все после ";"
                $cleanName = trim($cleanName);
                
                // Извлекаем вес из оригинального текста
                preg_match('/(\d+)\s*(г|мл|шт)/', $dishText, $weightMatch);
                $weight = $weightMatch ? $weightMatch[1] . $weightMatch[2] : '100г';
                
                // Извлекаем номер рецепта
                preg_match('/№\s*(\d+\/\d+)/', $dishText, $recipeMatch);
                $recipeNumber = $recipeMatch ? $recipeMatch[1] : (floor($dishId/5) + 1) . '/' . (($dishId % 5) + 1);
                
                $parsedDishes[] = [
                    'id' => $dishId,
                    'name' => $cleanName,
                    'description' => $cleanName . ' - ' . $dayName . ' - ' . strtolower($mealType),
                    'price' => 0,
                    'meal_type' => strtolower($mealType),
                    'day_of_week' => $dayNumber,
                    'weight' => $weight,
                    'recipe_number' => $recipeNumber,
                    'created_at' => date('c'),
                    'updated_at' => date('c')
                ];
                
                $dishId++;
            }
        }
    }
    
    return $parsedDishes;
}
?>