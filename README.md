# School Meals App

Приложение для управления школьным питанием с возможностью загрузки меню директорами и выбора блюд родителями.

## 🚀 Демо

**Frontend:** https://your-username.github.io/school-meals-app  
**Backend:** https://school-meals-backend.vercel.app

## 📋 Функциональность

- **Для директоров:** загрузка меню из Excel файлов
- **Для родителей:** выбор блюд из меню на неделю
- **Аутентификация** через JWT токены
- **База данных** с пользователями, школами, меню и выборами

## 🔑 Тестовые аккаунты

- **Директор:** `director@school.test` / `P@ssw0rd1!`
- **Родитель:** `parent@school.test` / `P@ssw0rd1!`

## 🛠 Технологии

- **Frontend:** React + TypeScript + Vite
- **Backend:** Node.js + Express + Prisma + SQLite
- **Хостинг:** GitHub Pages (frontend) + Vercel (backend)

## 📁 Структура проекта

```
├── frontend/          # React приложение
├── backend/           # Node.js API
└── dist/             # Собранная версия frontend
```

## 🚀 Развертывание

### Frontend (GitHub Pages)
1. Соберите проект: `npm run build`
2. Загрузите папку `dist/` в GitHub Pages

### Backend (Vercel)
1. Подключите репозиторий к Vercel
2. Настройте переменные окружения
3. Деплой автоматический

## 📝 Лицензия

MIT