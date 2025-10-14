<?php
/**
 * Базовые функции безопасности
 */

class SecurityValidator {
    
    /**
     * Валидация email
     */
    public static function validateEmail($email) {
        if (empty($email)) {
            return ['valid' => false, 'error' => 'Email не может быть пустым'];
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return ['valid' => false, 'error' => 'Неверный формат email'];
        }
        
        if (strlen($email) > 100) {
            return ['valid' => false, 'error' => 'Email слишком длинный'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Валидация имени
     */
    public static function validateName($name) {
        if (empty($name)) {
            return ['valid' => false, 'error' => 'Имя не может быть пустым'];
        }
        
        $name = trim($name);
        
        if (strlen($name) < 2) {
            return ['valid' => false, 'error' => 'Имя должно содержать минимум 2 символа'];
        }
        
        if (strlen($name) > 50) {
            return ['valid' => false, 'error' => 'Имя слишком длинное'];
        }
        
        // Проверяем на недопустимые символы
        if (!preg_match('/^[а-яёА-ЯЁa-zA-Z\s\-\.]+$/u', $name)) {
            return ['valid' => false, 'error' => 'Имя содержит недопустимые символы'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Валидация пароля
     */
    public static function validatePassword($password, $confirmPassword = null) {
        if (empty($password)) {
            return ['valid' => false, 'error' => 'Пароль не может быть пустым'];
        }
        
        if (strlen($password) < 6) {
            return ['valid' => false, 'error' => 'Пароль должен содержать минимум 6 символов'];
        }
        
        if (strlen($password) > 50) {
            return ['valid' => false, 'error' => 'Пароль слишком длинный'];
        }
        
        if ($confirmPassword !== null && $password !== $confirmPassword) {
            return ['valid' => false, 'error' => 'Пароли не совпадают'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Валидация роли
     */
    public static function validateRole($role) {
        $allowedRoles = ['DIRECTOR', 'PARENT', 'STUDENT'];
        
        if (!in_array($role, $allowedRoles)) {
            return ['valid' => false, 'error' => 'Неверная роль пользователя'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Валидация ID
     */
    public static function validateId($id) {
        if (!is_numeric($id) || $id <= 0) {
            return ['valid' => false, 'error' => 'Неверный ID'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Санитизация строки
     */
    public static function sanitizeString($string, $maxLength = 255) {
        $string = trim($string);
        $string = htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
        
        if (strlen($string) > $maxLength) {
            $string = substr($string, 0, $maxLength);
        }
        
        return $string;
    }
    
    /**
     * Проверка размера файла
     */
    public static function validateFileSize($file, $maxSizeMB = 10) {
        if ($file['size'] > $maxSizeMB * 1024 * 1024) {
            return ['valid' => false, 'error' => "Файл слишком большой (максимум {$maxSizeMB} МБ)"];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Проверка типа файла
     */
    public static function validateFileType($file, $allowedTypes = ['xlsx', 'xls']) {
        $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        
        if (!in_array($extension, $allowedTypes)) {
            return ['valid' => false, 'error' => 'Недопустимый тип файла'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Проверка прав доступа
     */
    public static function checkDirectorAccess($user) {
        if (!$user || $user['role'] !== 'DIRECTOR') {
            return ['valid' => false, 'error' => 'Недостаточно прав доступа'];
        }
        
        return ['valid' => true];
    }
    
    /**
     * Логирование подозрительной активности
     */
    public static function logSecurityEvent($event, $details = []) {
        $logEntry = [
            'timestamp' => date('Y-m-d H:i:s'),
            'event' => $event,
            'ip' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown',
            'details' => $details
        ];
        
        $logFile = __DIR__ . '/../../logs/security.log';
        $logDir = dirname($logFile);
        
        if (!is_dir($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        file_put_contents($logFile, json_encode($logEntry, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);
    }
    
    /**
     * Проверка частоты запросов (простая защита от брутфорса)
     */
    public static function checkRateLimit($key, $maxRequests = 10, $timeWindow = 300) {
        $cacheFile = __DIR__ . '/../../cache/rate_limit_' . md5($key) . '.json';
        $cacheDir = dirname($cacheFile);
        
        if (!is_dir($cacheDir)) {
            mkdir($cacheDir, 0755, true);
        }
        
        $now = time();
        $requests = [];
        
        if (file_exists($cacheFile)) {
            $data = json_decode(file_get_contents($cacheFile), true);
            if ($data && isset($data['requests'])) {
                $requests = array_filter($data['requests'], function($timestamp) use ($now, $timeWindow) {
                    return ($now - $timestamp) < $timeWindow;
                });
            }
        }
        
        if (count($requests) >= $maxRequests) {
            self::logSecurityEvent('rate_limit_exceeded', ['key' => $key, 'requests' => count($requests)]);
            return ['valid' => false, 'error' => 'Слишком много запросов. Попробуйте позже.'];
        }
        
        $requests[] = $now;
        file_put_contents($cacheFile, json_encode(['requests' => $requests]), LOCK_EX);
        
        return ['valid' => true];
    }
}
?>
