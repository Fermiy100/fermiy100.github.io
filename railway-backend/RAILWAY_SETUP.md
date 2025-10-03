# 🚀 Railway Setup Instructions

## Проблема
Railway возвращает "Application not found" - это означает, что нужно создать новое приложение на Railway.

## Решение

### 1. Создать новое приложение на Railway
1. Зайти на [railway.app](https://railway.app)
2. Нажать "New Project"
3. Выбрать "Deploy from GitHub repo"
4. Выбрать репозиторий `fermiy100/fermiy100.github.io`
5. Выбрать папку `railway-backend`

### 2. Настройки приложения
- **Root Directory**: `railway-backend`
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Health Check Path**: `/`

### 3. Переменные окружения
Добавить переменную:
- `PORT`: `10000`

### 4. Проверка
После деплоя проверить:
- `https://your-app-name.up.railway.app/` - должен вернуть JSON с status: "OK"
- `https://your-app-name.up.railway.app/api/menu` - должен вернуть массив блюд

## Текущий статус
✅ Код готов для деплоя
✅ Сервер протестирован локально
❌ Railway приложение не создано

## Следующие шаги
1. Создать новое Railway приложение
2. Подключить к GitHub репозиторию
3. Настроить деплой из папки `railway-backend`
4. Проверить работу API
