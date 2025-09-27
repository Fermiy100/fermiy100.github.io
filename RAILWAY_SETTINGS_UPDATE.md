# 🚀 Обновление настроек Railway

## ❌ Удалите Root Directory в Railway:

1. Перейдите в **Settings** в Railway
2. Найдите поле **"Add Root Directory"**
3. **ОСТАВЬТЕ ЕГО ПУСТЫМ** (не указывайте `backend`)
4. Сохраните изменения

## ✅ Правильные настройки:

- **Root Directory:** (пустое поле)
- **Dockerfile Path:** `Dockerfile` (по умолчанию)
- **Builder:** Dockerfile

## 🔧 Переменные окружения:

Добавьте в Variables:
```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-12345
PORT=3000
```

## 📋 Что изменилось:

- Dockerfile теперь в корне проекта
- Dockerfile копирует файлы из папки `backend/`
- Railway будет искать Dockerfile в корне
