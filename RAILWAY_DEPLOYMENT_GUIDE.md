# 🚀 Railway Deployment Guide

## Бесплатное развертывание на Railway

Railway предоставляет **500 бесплатных часов** в месяц для развертывания приложений.

## 📋 Пошаговая инструкция:

### 1. Регистрация на Railway
1. Перейдите на [railway.app](https://railway.app)
2. Нажмите **"Login"**
3. Выберите **"Login with GitHub"**
4. Авторизуйтесь через ваш GitHub аккаунт

### 2. Создание проекта
1. Нажмите **"New Project"**
2. Выберите **"Deploy from GitHub repo"**
3. Найдите репозиторий `fermiy100.github.io`
4. Нажмите **"Deploy Now"**

### 3. Настройка переменных окружения
В настройках проекта добавьте:

```
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-here-12345
DATABASE_URL=postgresql://postgres:password@localhost:5432/schoolmeals
```

### 4. Настройка деплоя
1. В настройках проекта выберите **"Settings"**
2. **Root Directory:** `school-meals-app/backend`
3. **Build Command:** `npm install`
4. **Start Command:** `npm start`

### 5. Получение URL
После развертывания Railway предоставит URL вида:
`https://your-app-name.up.railway.app`

## 🔧 Альтернатива: Vercel

### 1. Регистрация на Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Нажмите **"Sign Up"**
3. Выберите **"Continue with GitHub"**

### 2. Импорт проекта
1. Нажмите **"New Project"**
2. Найдите репозиторий `fermiy100.github.io`
3. **Root Directory:** `school-meals-app/backend`
4. **Framework Preset:** `Other`
5. **Build Command:** `npm install`
6. **Output Directory:** `.`
7. **Install Command:** `npm install`

### 3. Переменные окружения
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-12345
```

## 🎯 Рекомендация

**Используйте Railway** - он лучше подходит для Node.js backend приложений и предоставляет больше возможностей для бесплатного использования.

## 📞 Поддержка

Если возникнут проблемы:
1. Проверьте логи в Railway/Vercel dashboard
2. Убедитесь, что все переменные окружения установлены
3. Проверьте, что порт настроен правильно (Railway автоматически устанавливает PORT)
