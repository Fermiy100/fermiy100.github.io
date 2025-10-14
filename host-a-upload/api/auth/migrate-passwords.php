<?php
/**
 * УТИЛИТА ДЛЯ МИГРАЦИИ ПАРОЛЕЙ
 * Запустить один раз для конвертации всех паролей в хеши
 */

$usersFile = __DIR__ . '/../../data/users.json';

if (!file_exists($usersFile)) {
    die("Файл users.json не найден\n");
}

$users = json_decode(file_get_contents($usersFile), true) ?: [];
$migrated = 0;

foreach ($users as &$user) {
    // Если есть открытый пароль - хешируем его
    if (isset($user['password']) && !isset($user['password_hash'])) {
        $user['password_hash'] = password_hash($user['password'], PASSWORD_DEFAULT);
        unset($user['password']); // Удаляем открытый пароль
        $migrated++;
        echo "✅ Мигрирован пользователь: {$user['email']}\n";
    }
    // Если есть только хеш - всё ок
    elseif (isset($user['password_hash'])) {
        if (isset($user['password'])) {
            unset($user['password']); // Удаляем открытый пароль
            echo "🔒 Удален открытый пароль для: {$user['email']}\n";
        }
    }
}

if ($migrated > 0 || count($users) > 0) {
    file_put_contents($usersFile, json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
    echo "\n✅ Миграция завершена! Обработано пользователей: $migrated\n";
} else {
    echo "\n✅ Все пароли уже в безопасном формате\n";
}
?>
