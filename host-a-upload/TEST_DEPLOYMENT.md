# 🧪 ИНСТРУКЦИЯ ПО ТЕСТИРОВАНИЮ

## ⚠️ КРИТИЧЕСКАЯ ОШИБКА НА FERMIY.RU

**Проблема**: 500 Internal Server Error  
**Причина**: Нет PHP обработчика или ошибка в коде

## 🔧 РЕШЕНИЕ

### 1. Загрузите `index.php` на хостинг
```
Файл: host-a-upload/index.php
Место: корень сайта (fermiy.ru/)
```

### 2. Проверьте права доступа
```bash
chmod 644 index.php
chmod 755 api/
chmod 600 data/users.json
```

### 3. Проверьте .htaccess
Убедитесь, что .htaccess правильно настроен:
```apache
RewriteEngine On

# БЕЗОПАСНОСТЬ
<FilesMatch "(users|menu|orders)\.json$">
    Require all denied
</FilesMatch>

# API routing
RewriteRule ^api/profile/update$ api/profile/update.php [L]
RewriteRule ^api/users/([0-9]+)/delete$ api/users/delete.php [L]

# Frontend routing
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]
```

### 4. Миграция паролей (ОБЯЗАТЕЛЬНО!)
```bash
php api/auth/migrate-passwords.php
```

## 🧪 ТЕСТИРОВАНИЕ

### Тест 1: Главная страница
```
URL: https://fermiy.ru
Ожидается: Форма входа (не 500 ошибка)
```

### Тест 2: API Users
```
URL: https://fermiy.ru/api/users.php
Ожидается: JSON массив пользователей БЕЗ паролей
```

### Тест 3: Railway Health
```
URL: https://fermiy100githubio-production.up.railway.app/api/health
Ожидается: {"status":"ok","version":"v33.0.0",...}
```

### Тест 4: Вход в систему
```
1. Открыть https://fermiy.ru
2. Ввести: director@school.test / password
3. Нажать "Войти"
Ожидается: Перенаправление на панель директора
```

## 📝 ЧТО ЗАГРУЗИТЬ НА ХОСТИНГ

### Обязательные файлы:
```
✅ index.php (новый!)
✅ .htaccess
✅ api/ (вся папка)
✅ data/ (создать, chmod 755)
   └── users.json (chmod 600)
✅ logs/ (создать, chmod 755)
✅ cache/ (создать, chmod 755)
```

### Структура должна быть:
```
fermiy.ru/
├── index.php                    ← НОВЫЙ ФАЙЛ!
├── .htaccess
├── api/
│   ├── auth/
│   │   ├── login.php
│   │   ├── me.php
│   │   └── migrate-passwords.php
│   ├── security/
│   │   └── validate.php
│   ├── users.php
│   ├── users/
│   │   ├── index.php
│   │   ├── list.php
│   │   └── delete.php
│   ├── profile/
│   │   └── update.php
│   ├── menu.php
│   ├── menu/
│   │   ├── upload.php
│   │   ├── clear.php
│   │   ├── add.php
│   │   ├── delete.php
│   │   └── bulk-delete.php
│   └── orders/
│       └── index.php
├── data/
│   ├── users.json
│   ├── menu.json
│   └── orders.json
├── logs/
│   └── security.log
└── cache/
```

## 🚨 ЧАСТЫЕ ОШИБКИ

### Ошибка: 500 Internal Server Error
**Решение**: 
1. Проверьте права на файлы
2. Проверьте синтаксис PHP: `php -l index.php`
3. Проверьте логи хостинга

### Ошибка: Пароли видны в API
**Решение**: 
1. Запустите миграцию: `php api/auth/migrate-passwords.php`
2. Проверьте `api/users.php` - должен удалять пароли

### Ошибка: CORS
**Решение**: Проверьте headers в PHP файлах:
```php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
```

## ✅ КОНТРОЛЬНЫЙ СПИСОК

Перед запуском проверьте:
- [ ] index.php загружен
- [ ] .htaccess загружен
- [ ] Папка api/ со всеми файлами
- [ ] Папка data/ создана (chmod 755)
- [ ] users.json существует (chmod 600)
- [ ] Миграция паролей выполнена
- [ ] Railway деплой завершен
- [ ] Главная страница открывается
- [ ] API возвращает JSON
- [ ] Вход работает

## 📞 ЕСЛИ ВСЁ ЕЩЁ НЕ РАБОТАЕТ

1. **Проверьте логи хостинга**:
   - cPanel → Errors
   - SSH: `tail -f /var/log/apache2/error.log`

2. **Проверьте PHP**:
   ```bash
   php -v  # Версия должна быть >= 7.4
   php -l index.php  # Проверка синтаксиса
   ```

3. **Проверьте файлы**:
   ```bash
   ls -la  # Проверить права
   cat .htaccess  # Проверить конфиг
   ```

## 🎯 ОЖИДАЕМЫЙ РЕЗУЛЬТАТ

После всех исправлений:
- ✅ fermiy.ru открывается (форма входа)
- ✅ Railway API работает
- ✅ Вход выполняется
- ✅ Пароли в безопасности
- ✅ API возвращает данные БЕЗ паролей

---

**Статус**: 🔴 Требуется загрузка index.php  
**Приоритет**: 🔥 КРИТИЧЕСКИЙ

