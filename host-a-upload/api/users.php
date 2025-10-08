<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS, PATCH');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Railway backend URL
$railway_url = 'https://fermiy100githubio-production.up.railway.app';

// Получаем путь запроса
$request_uri = $_SERVER['REQUEST_URI'];
$path = str_replace('/api/users', '', $request_uri);

// Определяем URL для Railway
$railway_endpoint = $railway_url . '/api/users' . $path;

// Подготавливаем данные для отправки
$post_data = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST' || $_SERVER['REQUEST_METHOD'] === 'PATCH') {
    $post_data = file_get_contents('php://input');
}

// Настройки cURL
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $railway_endpoint);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);

// Устанавливаем метод запроса
switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        curl_setopt($ch, CURLOPT_HTTPGET, true);
        break;
    case 'POST':
        curl_setopt($ch, CURLOPT_POST, true);
        if ($post_data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        }
        break;
    case 'PATCH':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST'); // Railway использует POST для верификации
        if ($post_data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data);
        }
        break;
    case 'DELETE':
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        break;
}

// Выполняем запрос
$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

// Обрабатываем ошибки
if ($error) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Curl error: ' . $error
    ]);
    exit();
}

// Устанавливаем HTTP код ответа
http_response_code($http_code);

// Возвращаем ответ от Railway
echo $response;
?>