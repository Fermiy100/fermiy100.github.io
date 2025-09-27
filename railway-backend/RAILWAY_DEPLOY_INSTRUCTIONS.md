# 🚀 Развертывание Backend на Railway

## 📋 Что нужно сделать

### 1. Создание аккаунта на Railway
1. **Перейдите на** https://railway.app
2. **Нажмите "Login"** → **"GitHub"**
3. **Авторизуйтесь** через GitHub

### 2. Создание проекта
1. **Нажмите "New Project"**
2. **Выберите "Deploy from GitHub repo"**
3. **Выберите репозиторий** `fermiy100/fermiy100.github.io`
4. **Нажмите "Deploy Now"**

### 3. Настройка проекта
1. **В настройках проекта** найдите "Root Directory"
2. **Установите** `railway-backend`
3. **Сохраните** настройки

### 4. Настройка переменных окружения
В разделе "Variables" добавьте:
```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this
CORS_ORIGIN=https://fermiy.ru
```

### 5. Получение URL
1. **После развертывания** Railway даст вам URL
2. **Скопируйте URL** (например: `https://your-app.railway.app`)
3. **Добавьте `/api`** в конец URL

## 🔧 Обновление Frontend

После получения URL от Railway:

1. **Обновите файл** `frontend/src/utils/api.ts`
2. **Замените URL** на полученный от Railway
3. **Пересоберите frontend:**
   ```bash
   cd frontend
   npm run build
   ```
4. **Загрузите обновленные файлы** на Host-A

## 🎯 Итоговая схема

```
fermiy.ru (Host-A) → API запросы → Railway Backend
     ↓                    ↓              ↓
  Frontend            HTTPS/JSON      Node.js API
  (React)             Requests        (Express)
```

## 📞 Поддержка

Если что-то не работает:
1. **Проверьте логи** в Railway Dashboard
2. **Убедитесь в переменных окружения**
3. **Проверьте Root Directory** в настройках
4. **Обратитесь в поддержку Railway**

## 💰 Стоимость

- **Railway:** Бесплатно (до 500 часов/мес)
- **Host-A:** 298₽/мес
- **Итого:** 298₽/мес

**Экономия:** 1482₽/мес! 🎉