# 🚀 Railway Deployment Instructions

## Настройки в Railway Dashboard:

### 1. Root Directory
```
backend
```

### 2. Environment Variables
Добавьте в Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-12345
PORT=3000
```

### 3. Build Settings
- **Builder:** Dockerfile
- **Dockerfile Path:** Dockerfile

## 🔧 Если основной Dockerfile не работает:

1. Переименуйте `Dockerfile.simple` в `Dockerfile`
2. Удалите старый `Dockerfile`
3. Загрузите изменения на GitHub

## 📋 Troubleshooting:

### Если npm ci не работает:
- Используйте `Dockerfile.simple`
- Или измените команду на `npm install --only=production`

### Если порт не открывается:
- Убедитесь, что PORT=3000 в переменных окружения
- Проверьте, что сервер слушает на process.env.PORT || 3000

### Если база данных не работает:
- SQLite будет создана автоматически
- Для PostgreSQL добавьте DATABASE_URL в переменные
