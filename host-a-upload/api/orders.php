<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$ordersFile = __DIR__ . '/../data/orders.json';

// Функция для чтения заказов
function readOrders() {
    global $ordersFile;
    if (!file_exists($ordersFile)) {
        return [];
    }
    $content = file_get_contents($ordersFile);
    if ($content === false) {
        return [];
    }
    $data = json_decode($content, true);
    return json_last_error() === JSON_ERROR_NONE ? $data : [];
}

// Функция для записи заказов
function writeOrders($orders) {
    global $ordersFile;
    $dataDir = dirname($ordersFile);
    if (!is_dir($dataDir)) {
        mkdir($dataDir, 0755, true);
    }
    $jsonContent = json_encode($orders, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($jsonContent === false) {
        return false;
    }
    return file_put_contents($ordersFile, $jsonContent);
}

try {
    if ($_SERVER['REQUEST_METHOD'] === 'GET') {
        // Получить заказы
        $orders = readOrders();
        echo json_encode($orders, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Создать заказ
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['user_id']) || !isset($input['items'])) {
            throw new Exception('Не указан пользователь или блюда');
        }
        
        $orders = readOrders();
        $newOrder = [
            'id' => count($orders) + 1,
            'user_id' => $input['user_id'],
            'items' => $input['items'],
            'total_price' => $input['total_price'] ?? 0,
            'status' => 'pending',
            'created_at' => date('c'),
            'updated_at' => date('c')
        ];
        
        $orders[] = $newOrder;
        
        if (writeOrders($orders)) {
            echo json_encode([
                'success' => true,
                'message' => 'Заказ создан',
                'order' => $newOrder
            ], JSON_UNESCAPED_UNICODE);
        } else {
            throw new Exception('Ошибка сохранения заказа');
        }
        
    } elseif ($_SERVER['REQUEST_METHOD'] === 'PUT') {
        // Обновить заказ
        $input = json_decode(file_get_contents('php://input'), true);
        
        if (!$input || !isset($input['id'])) {
            throw new Exception('Не указан ID заказа');
        }
        
        $orders = readOrders();
        $orderFound = false;
        
        foreach ($orders as &$order) {
            if ($order['id'] == $input['id']) {
                $order = array_merge($order, $input);
                $order['updated_at'] = date('c');
                $orderFound = true;
                break;
            }
        }
        
        if (!$orderFound) {
            throw new Exception('Заказ не найден');
        }
        
        if (writeOrders($orders)) {
            echo json_encode([
                'success' => true,
                'message' => 'Заказ обновлен'
            ], JSON_UNESCAPED_UNICODE);
        } else {
            throw new Exception('Ошибка обновления заказа');
        }
        
    } else {
        http_response_code(405);
        echo json_encode(['error' => 'Method not allowed']);
    }
    
} catch (Exception $e) {
    error_log("❌ Ошибка работы с заказами: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
