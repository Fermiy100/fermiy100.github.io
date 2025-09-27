# 🚀 Развертывание Backend на Railway

## Быстрое развертывание (5 минут)

### Шаг 1: Подготовка
✅ Все файлы уже готовы:
- `package.json` - зависимости
- `server.js` - основной сервер  
- `railway.json` - конфигурация Railway
- `.env` - переменные окружения

### Шаг 2: Развертывание на Railway

1. **Откройте Railway**: https://railway.app
2. **Войдите через GitHub** (используйте тот же аккаунт, что и для GitHub Pages)
3. **Создайте новый проект**:
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Найдите репозиторий `fermiy100.github.io`
   - Выберите папку `school-meals-app — копия/backend`

4. **Railway автоматически**:
   - Установит зависимости (`npm install`)
   - Запустит сервер (`node server.js`)
   - Назначит URL (например: `https://school-meals-api-production.up.railway.app`)

### Шаг 3: Настройка переменных окружения

В панели Railway добавьте переменные:
- `JWT_SECRET`: `your-super-secret-jwt-key-change-in-production`
- `FRONTEND_URL`: `https://fermiy100.github.io`
- `NODE_ENV`: `production`

### Шаг 4: Обновление Frontend

После получения URL от Railway, обновите `frontend/src/utils/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://your-railway-url.up.railway.app/api'  // Замените на ваш URL
  : 'http://localhost:3000/api';
```

### Шаг 5: Тестирование

1. Откройте https://fermiy100.github.io
2. Войдите с тестовыми аккаунтами
3. Протестируйте загрузку меню и выбор блюд

## Альтернативные платформы

### Render (бесплатно)
1. https://render.com
2. New → Web Service
3. Подключите GitHub репозиторий
4. Укажите папку: `school-meals-app — копия/backend`
5. Команда запуска: `node server.js`

### Vercel (бесплатно)
1. https://vercel.com
2. Import Project
3. Выберите репозиторий
4. Настройте папку backend

## Проверка развертывания

После развертывания проверьте:
- Health check: `https://your-url/api/health`
- Должен вернуть: `{"status":"OK","timestamp":"..."}`

## Готово! 🎉

Ваш backend будет доступен по URL типа:
`https://school-meals-api-production.up.railway.app`

Обновите frontend и приложение будет полностью функциональным!
