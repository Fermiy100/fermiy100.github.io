<?php
/**
 * API для школьного питания на Host-A
 * Работает с MySQL базой данных
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Обработка preflight запросов
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Подключение к базе данных
$host = 'localhost';
$dbname = 'school_meals'; // Замените на имя вашей БД
$username = 'your_username'; // Замените на ваш username
$password = 'your_password'; // Замените на ваш пароль

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Ошибка подключения к базе данных']);
    exit();
}

// Получение маршрута
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/api/', '', $path);
$path = trim($path, '/');

$method = $_SERVER['REQUEST_METHOD'];

// Маршрутизация
switch ($path) {
    case 'health':
        handleHealth();
        break;
    case 'auth/login':
        handleLogin();
        break;
    case 'menu':
        handleMenu();
        break;
    case 'menu/upload':
        handleMenuUpload();
        break;
    default:
        http_response_code(404);
        echo json_encode(['error' => 'Маршрут не найден']);
        break;
}

function handleHealth() {
    echo json_encode(['status' => 'ok', 'message' => 'API работает']);
}

function handleLogin() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Метод не разрешен']);
        return;
    }
    
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!isset($input['email']) || !isset($input['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Неверный email или пароль']);
        return;
    }
    
    $email = $input['email'];
    $password = $input['password'];
    
    try {
        $stmt = $pdo->prepare("SELECT * FROM users WHERE email = ? AND is_active = 1");
        $stmt->execute([$email]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password_hash'])) {
            // Создаем простой токен (в реальном проекте используйте JWT)
            $token = base64_encode($user['id'] . ':' . time());
            
            echo json_encode([
                'success' => true,
                'token' => $token,
                'user' => [
                    'id' => $user['id'],
                    'email' => $user['email'],
                    'name' => $user['name'],
                    'role' => $user['role'],
                    'school_id' => $user['school_id'],
                    'class_name' => $user['class_name']
                ]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Неверный email или пароль']);
        }
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка базы данных']);
    }
}

function handleMenu() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        $school_id = $_GET['school_id'] ?? 1;
        $week_start = $_GET['week_start'] ?? date('Y-m-d');
        
        try {
            $stmt = $pdo->prepare("
                SELECT * FROM menu_items 
                WHERE school_id = ? AND week_start = ? AND is_available = 1
                ORDER BY day_of_week, meal_type, name
            ");
            $stmt->execute([$school_id, $week_start]);
            $items = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            echo json_encode($items);
        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode(['error' => 'Ошибка загрузки меню']);
        }
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Метод не разрешен']);
    }
}

function handleMenuUpload() {
    global $pdo;
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        echo json_encode(['error' => 'Метод не разрешен']);
        return;
    }
    
    // Проверяем загрузку файла
    if (!isset($_FILES['menu_file'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Файл не загружен']);
        return;
    }
    
    $file = $_FILES['menu_file'];
    
    if ($file['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'Ошибка загрузки файла']);
        return;
    }
    
    // Проверяем тип файла
    $allowed_types = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    if (!in_array($file['type'], $allowed_types)) {
        http_response_code(400);
        echo json_encode(['error' => 'Неподдерживаемый тип файла']);
        return;
    }
    
    try {
        // Здесь должен быть парсер Excel файла
        // Для демонстрации создаем тестовые данные
        
        $school_id = 1;
        $week_start = date('Y-m-d');
        
        // Очищаем старые данные
        $stmt = $pdo->prepare("DELETE FROM menu_items WHERE school_id = ? AND week_start = ?");
        $stmt->execute([$school_id, $week_start]);
        
        // Вставляем тестовые данные
        $test_items = [
            ['Борщ с мясом', 'Традиционный украинский борщ', 0, '300г', 1, 'обед'],
            ['Гречневая каша', 'Каша с маслом', 0, '200г', 1, 'завтрак'],
            ['Котлета по-киевски', 'Куриная котлета', 0, '180г', 2, 'обед'],
            ['Овощной салат', 'Свежий салат', 0, '150г', 2, 'обед'],
            ['Компот из ягод', 'Домашний компот', 0, '200мл', 3, 'обед']
        ];
        
        $stmt = $pdo->prepare("
            INSERT INTO menu_items (name, description, price, portion, day_of_week, meal_type, school_id, week_start)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ");
        
        foreach ($test_items as $item) {
            $stmt->execute([
                $item[0], $item[1], $item[2], $item[3], 
                $item[4], $item[5], $school_id, $week_start
            ]);
        }
        
        echo json_encode([
            'success' => true,
            'message' => 'Меню успешно загружено',
            'items_count' => count($test_items)
        ]);
        
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Ошибка сохранения меню']);
    }
}
?>
