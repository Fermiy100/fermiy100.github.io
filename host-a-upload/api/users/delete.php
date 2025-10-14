<?php
require_once __DIR__ . '/../security/validate.php';

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit();
}

try {
    // Получаем токен из заголовка Authorization
    $headers = getallheaders();
    $authHeader = $headers['Authorization'] ?? '';
    
    if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
        throw new Exception('Не авторизован');
    }
    
    $token = substr($authHeader, 7);
    $decoded = base64_decode($token);
    
    if (!$decoded) {
        throw new Exception('Неверный токен');
    }
    
    $parts = explode(':', $decoded);
    if (count($parts) !== 2) {
        throw new Exception('Неверный формат токена');
    }
    
    $currentEmail = $parts[0];
    
    // Получаем ID пользователя для удаления из URL
    $uri = $_SERVER['REQUEST_URI'] ?? '';
    if (!preg_match('#/api/users/(\d+)/delete#', $uri, $matches)) {
        throw new Exception('Неверный URL');
    }
    
    $userIdToDelete = intval($matches[1]);
    
    // Валидация ID
    $idValidation = SecurityValidator::validateId($userIdToDelete);
    if (!$idValidation['valid']) {
        throw new Exception($idValidation['error']);
    }
    
    // Загружаем пользователей
    $usersFile = __DIR__ . '/../../data/users.json';
    
    if (!file_exists($usersFile)) {
        throw new Exception('Файл пользователей не найден');
    }
    
    $users = json_decode(file_get_contents($usersFile), true) ?: [];
    
    // Находим текущего пользователя (директора)
    $currentUser = null;
    foreach ($users as $user) {
        if ($user['email'] === $currentEmail) {
            $currentUser = $user;
            break;
        }
    }
    
    if (!$currentUser) {
        throw new Exception('Пользователь не найден');
    }
    
    // Проверяем права директора
    $accessCheck = SecurityValidator::checkDirectorAccess($currentUser);
    if (!$accessCheck['valid']) {
        SecurityValidator::logSecurityEvent('unauthorized_delete_attempt', [
            'user_id' => $currentUser['id'],
            'target_user_id' => $userIdToDelete
        ]);
        throw new Exception($accessCheck['error']);
    }
    
    // Находим пользователя для удаления
    $userToDelete = null;
    $userIndex = -1;
    foreach ($users as $index => $user) {
        if ((int)$user['id'] === $userIdToDelete) {
            $userToDelete = $user;
            $userIndex = $index;
            break;
        }
    }
    
    if (!$userToDelete) {
        throw new Exception('Пользователь для удаления не найден');
    }
    
    // Нельзя удалить самого себя
    if ($userToDelete['id'] === $currentUser['id']) {
        throw new Exception('Нельзя удалить самого себя');
    }
    
    // Нельзя удалить другого директора
    if ($userToDelete['role'] === 'DIRECTOR') {
        throw new Exception('Нельзя удалить другого директора');
    }
    
    // Удаляем пользователя из массива
    array_splice($users, $userIndex, 1);
    
    // Сохраняем обновленный список пользователей
    if (!file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT))) {
        throw new Exception('Ошибка сохранения данных');
    }
    
    // Удаляем заказы пользователя (если есть)
    $ordersFile = __DIR__ . '/../../data/orders.json';
    if (file_exists($ordersFile)) {
        $orders = json_decode(file_get_contents($ordersFile), true) ?: [];
        $orders = array_filter($orders, function($order) use ($userIdToDelete) {
            return (int)$order['user_id'] !== $userIdToDelete;
        });
        file_put_contents($ordersFile, json_encode(array_values($orders), JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Пользователь успешно удален',
        'deleted_user' => [
            'id' => $userToDelete['id'],
            'name' => $userToDelete['name'],
            'email' => $userToDelete['email']
        ]
    ], JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    error_log("❌ Ошибка удаления пользователя: " . $e->getMessage());
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
