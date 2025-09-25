# 🚀 Руководство по развертыванию School Meals App

## 📋 Обзор

Это полноценное приложение для управления школьным питанием с:
- **Frontend**: React + TypeScript + Vite
- **Backend**: Node.js + Express + SQLite
- **База данных**: SQLite (разработка) / PostgreSQL (продакшен)
- **Хостинг**: GitHub Pages (frontend) + Heroku (backend)

## 🏗️ Архитектура

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   GitHub Pages  │    │     Heroku      │    │   База данных   │
│   (Frontend)    │◄──►│   (Backend)     │◄──►│   (SQLite/DB)   │
│                 │    │                 │    │                 │
│ • React App     │    │ • Express API   │    │ • Пользователи  │
│ • Статические   │    │ • Аутентификация│    │ • Школы         │
│   файлы         │    │ • Загрузка Excel│    │ • Меню          │
│ • PWA           │    │ • Управление    │    │ • Заказы        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🔧 Развертывание Backend (Heroku)

### 1. Подготовка

```bash
cd backend
npm install
```

### 2. Создание Heroku приложения

```bash
# Установите Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# Войдите в Heroku
heroku login

# Создайте приложение
heroku create school-meals-api

# Добавьте переменные окружения
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-in-production
heroku config:set FRONTEND_URL=https://fermiy100.github.io
heroku config:set NODE_ENV=production
```

### 3. Развертывание

```bash
# Добавьте Heroku remote
git remote add heroku https://git.heroku.com/school-meals-api.git

# Разверните
git push heroku main
```

### 4. Проверка

```bash
# Проверьте логи
heroku logs --tail

# Проверьте health check
curl https://school-meals-api.herokuapp.com/api/health
```

## 🌐 Развертывание Frontend (GitHub Pages)

### 1. Подготовка репозитория

```bash
# В корне проекта
git init
git add .
git commit -m "Initial commit: School Meals App"

# Добавьте remote
git remote add origin https://github.com/Fermiy100/fermiy100.github.io.git
```

### 2. Настройка GitHub Pages

1. Перейдите в настройки репозитория
2. В разделе "Pages" выберите:
   - Source: "GitHub Actions"
   - Branch: "main"

### 3. Автоматическое развертывание

GitHub Actions автоматически:
- Соберет frontend
- Развернет на GitHub Pages
- Настроит CNAME для fermiy100.github.io

### 4. Проверка

После развертывания приложение будет доступно по адресу:
**https://fermiy100.github.io**

## 🗄️ Настройка базы данных

### SQLite (разработка)
```bash
cd backend
node server.js
# База данных создается автоматически в database.sqlite
```

### PostgreSQL (продакшен)
```bash
# Добавьте PostgreSQL addon в Heroku
heroku addons:create heroku-postgresql:hobby-dev

# Получите DATABASE_URL
heroku config:get DATABASE_URL
```

## 🔐 Безопасность

### Переменные окружения

**Backend (.env):**
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=https://fermiy100.github.io
NODE_ENV=production
DATABASE_URL=postgresql://...
```

**Frontend (vite.config.ts):**
```typescript
export default defineConfig({
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify('https://school-meals-api.herokuapp.com/api')
  }
})
```

### Настройки безопасности

- ✅ HTTPS только
- ✅ CORS настроен
- ✅ Rate limiting
- ✅ Helmet.js
- ✅ JWT токены
- ✅ Валидация данных
- ✅ Хеширование паролей

## 📊 Мониторинг

### Health Checks

- **Backend**: `GET /api/health`
- **Frontend**: Автоматическая проверка API

### Логи

```bash
# Heroku логи
heroku logs --tail

# GitHub Actions логи
# Проверьте в разделе Actions репозитория
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
```

## 🧪 Тестирование

### Локальное тестирование

```bash
# Backend
cd backend
npm run dev
# http://localhost:3000/api/health

# Frontend
cd frontend
npm run dev
# http://localhost:5173
```

### Продакшен тестирование

1. **Backend**: https://school-meals-api.herokuapp.com/api/health
2. **Frontend**: https://fermiy100.github.io
3. **Полный цикл**: Вход → Загрузка меню → Выбор блюд → Заказ

## 📱 PWA настройка

Приложение поддерживает PWA:
- Service Worker
- Offline кэширование
- Установка на мобильные устройства
- Push уведомления (опционально)

## 🔧 Обслуживание

### Обновление

```bash
# Backend
git push heroku main

# Frontend
git push origin main
# GitHub Actions автоматически развернет
```

### Резервное копирование

```bash
# База данных
heroku pg:backups:capture
heroku pg:backups:download
```

### Масштабирование

- **Heroku**: Автоматическое масштабирование
- **GitHub Pages**: CDN по умолчанию
- **База данных**: PostgreSQL с репликацией

## 🆘 Устранение неполадок

### Частые проблемы

1. **CORS ошибки**
   - Проверьте FRONTEND_URL в Heroku config
   - Убедитесь в правильности домена

2. **JWT ошибки**
   - Проверьте JWT_SECRET
   - Убедитесь в синхронизации времени

3. **База данных**
   - Проверьте DATABASE_URL
   - Убедитесь в миграциях

4. **Файлы не загружаются**
   - Проверьте размер файлов (лимит 10MB)
   - Убедитесь в формате Excel

### Логи и отладка

```bash
# Heroku
heroku logs --tail --app school-meals-api

# Локально
DEBUG=* npm run dev
```

## 📞 Поддержка

- **Документация**: README.md
- **Issues**: GitHub Issues
- **API**: Swagger/OpenAPI (планируется)
- **Мониторинг**: Heroku Metrics

---

**🎯 Готово к продакшену!**

Приложение полностью настроено для работы в продакшене с автоматическим развертыванием, мониторингом и масштабированием.
