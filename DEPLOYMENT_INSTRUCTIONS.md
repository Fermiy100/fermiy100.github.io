# 🚀 Автоматическое развертывание Backend

## Вариант 1: Railway (рекомендуется - 2 минуты)

1. **Откройте**: https://railway.app
2. **Войдите через GitHub** (тот же аккаунт, что и для GitHub Pages)
3. **Создайте проект**:
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Найдите репозиторий: `fermiy100/fermiy100.github.io`
   - Выберите папку: `school-meals-app — копия/backend`

4. **Railway автоматически**:
   - Установит зависимости
   - Запустит сервер
   - Назначит URL (например: `https://school-meals-api-production.up.railway.app`)

5. **Добавьте переменные окружения** в панели Railway:
   - `JWT_SECRET`: `your-super-secret-jwt-key-change-in-production`
   - `FRONTEND_URL`: `https://fermiy100.github.io`
   - `NODE_ENV`: `production`

## Вариант 2: Render (бесплатно - 3 минуты)

1. **Откройте**: https://render.com
2. **Войдите через GitHub**
3. **Создайте Web Service**:
   - Нажмите "New" → "Web Service"
   - Подключите репозиторий: `fermiy100/fermiy100.github.io`
   - Укажите папку: `school-meals-app — копия/backend`
   - Команда запуска: `node server.js`

## Вариант 3: Vercel (бесплатно - 2 минуты)

1. **Откройте**: https://vercel.com
2. **Войдите через GitHub**
3. **Импортируйте проект**:
   - Выберите репозиторий: `fermiy100/fermiy100.github.io`
   - Настройте папку: `school-meals-app — копия/backend`

## После развертывания:

1. **Получите URL** от выбранной платформы
2. **Обновите frontend** в `frontend/src/utils/api.ts`:
   ```typescript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   ```
3. **Загрузите изменения** на GitHub
4. **Протестируйте** на https://fermiy100.github.io

## Проверка:

После развертывания проверьте:
- Health check: `https://your-url/api/health`
- Должен вернуть: `{"status":"OK","timestamp":"..."}`

## Готово! 🎉

Время развертывания: 2-3 минуты
Все файлы готовы, инструкции созданы!