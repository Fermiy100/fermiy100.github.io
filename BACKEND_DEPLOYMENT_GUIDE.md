# 🚀 Полное руководство по развертыванию Backend

## 📋 Содержание
1. [Быстрый старт](#быстрый-старт)
2. [Развертывание на Railway](#развертывание-на-railway)
3. [Развертывание на Render](#развертывание-на-render)
4. [Развертывание на Heroku](#развертывание-на-heroku)
5. [Развертывание с Docker](#развертывание-с-docker)
6. [Production настройки](#production-настройки)
7. [Мониторинг и метрики](#мониторинг-и-метрики)

---

## 🚀 Быстрый старт

### Локальная разработка
```bash
cd backend
npm install
npm run dev
```

### Production запуск
```bash
cd backend
npm install
npm run start:production
```

---

## 🚂 Развертывание на Railway

Railway - самый простой способ для быстрого развертывания.

### Шаг 1: Подготовка
1. Перейдите на [railway.app](https://railway.app)
2. Войдите через GitHub
3. Нажмите "New Project"

### Шаг 2: Подключение репозитория
1. Выберите "Deploy from GitHub repo"
2. Найдите ваш репозиторий: `fermiy100/fermiy100.github.io`
3. Укажите папку: `school-meals-app — копия/backend`

### Шаг 3: Настройка переменных окружения
В настройках проекта добавьте:

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=https://fermiy100.github.io
```

### Шаг 4: Автоматическое развертывание
Railway автоматически:
- Установит зависимости
- Запустит миграции
- Развернет приложение

**URL будет:** `https://your-app-name.railway.app`

---

## 🎨 Развертывание на Render

### Шаг 1: Создание Web Service
1. Перейдите на [render.com](https://render.com)
2. Нажмите "New" → "Web Service"
3. Подключите GitHub репозиторий

### Шаг 2: Настройка
- **Name:** `school-meals-backend`
- **Root Directory:** `school-meals-app — копия/backend`
- **Runtime:** `Node`
- **Build Command:** `npm install`
- **Start Command:** `npm run start:production`

### Шаг 3: Переменные окружения
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
REDIS_URL=redis://host:port
JWT_SECRET=your-super-secret-jwt-key-change-in-production
FRONTEND_URL=https://fermiy100.github.io
```

### Шаг 4: База данных
1. Создайте PostgreSQL сервис в Render
2. Скопируйте DATABASE_URL в переменные окружения

---

## 🟣 Развертывание на Heroku

### Шаг 1: Установка Heroku CLI
```bash
# Windows
winget install Heroku.HerokuCLI

# macOS
brew install heroku/brew/heroku

# Linux
curl https://cli-assets.heroku.com/install.sh | sh
```

### Шаг 2: Создание приложения
```bash
cd backend
heroku login
heroku create your-app-name
```

### Шаг 3: Добавление базы данных
```bash
heroku addons:create heroku-postgresql:mini
heroku addons:create heroku-redis:mini
```

### Шаг 4: Переменные окружения
```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-in-production
heroku config:set FRONTEND_URL=https://fermiy100.github.io
```

### Шаг 5: Развертывание
```bash
git push heroku main
```

---

## 🐳 Развертывание с Docker

### Локальный запуск
```bash
# Клонируйте репозиторий
git clone https://github.com/Fermiy100/fermiy100.github.io.git
cd fermi100.github.io/school-meals-app\ —\ копия

# Создайте .env файл
cp .env.example .env
# Отредактируйте .env файл

# Запустите все сервисы
docker-compose up -d

# Выполните миграции
docker-compose exec backend npm run migrate
```

### Production с Docker
```bash
# Сборка и запуск
docker-compose -f docker-compose.prod.yml up -d

# Проверка статуса
docker-compose ps

# Логи
docker-compose logs -f backend
```

---

## ⚙️ Production настройки

### Переменные окружения
```env
# Основные
NODE_ENV=production
PORT=3000

# База данных
DATABASE_URL=postgresql://user:password@host:port/database

# Кэш
REDIS_URL=redis://host:port

# Безопасность
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Frontend
FRONTEND_URL=https://fermiy100.github.io

# Мониторинг (опционально)
SENTRY_DSN=your-sentry-dsn
NEW_RELIC_LICENSE_KEY=your-newrelic-key
```

### Оптимизация производительности
1. **Кластеризация:** Автоматически включена в production
2. **Кэширование:** Redis для кэширования API ответов
3. **Сжатие:** Gzip сжатие для всех ответов
4. **Rate Limiting:** Защита от DDoS атак

---

## 📊 Мониторинг и метрики

### Health Check
```bash
curl https://your-backend-url.com/api/health
```

### Метрики (требует аутентификации)
```bash
curl https://your-backend-url.com/api/metrics
```

### Доступные метрики:
- **Запросы:** Общее количество, по методам, по статусам
- **Производительность:** Время ответа, использование памяти/CPU
- **Пользователи:** Активные пользователи, по ролям
- **Ошибки:** Количество ошибок, по типам

---

## 🔧 Troubleshooting

### Проблема: База данных не подключается
```bash
# Проверьте DATABASE_URL
echo $DATABASE_URL

# Проверьте доступность
psql $DATABASE_URL -c "SELECT 1;"
```

### Проблема: Redis недоступен
```bash
# Проверьте REDIS_URL
echo $REDIS_URL

# Проверьте подключение
redis-cli -u $REDIS_URL ping
```

### Проблема: Высокое использование памяти
```bash
# Проверьте метрики
curl https://your-backend-url.com/api/metrics

# Перезапустите приложение
heroku restart  # для Heroku
```

---

## 📞 Поддержка

Если возникли проблемы:

1. **Проверьте логи:**
   ```bash
   heroku logs --tail  # Heroku
   docker-compose logs backend  # Docker
   ```

2. **Проверьте health check:**
   ```bash
   curl https://your-backend-url.com/api/health
   ```

3. **Проверьте переменные окружения:**
   ```bash
   heroku config  # Heroku
   ```

---

## 🎯 Рекомендации для масштабирования

### Для 10,000+ пользователей:
1. **Используйте PostgreSQL** вместо SQLite
2. **Добавьте Redis** для кэширования
3. **Настройте CDN** для статических файлов
4. **Используйте Load Balancer** (Nginx)
5. **Настройте мониторинг** (Sentry, New Relic)

### Для 100,000+ пользователей:
1. **Горизонтальное масштабирование** (несколько инстансов)
2. **База данных кластер** (PostgreSQL с репликацией)
3. **Микросервисная архитектура**
4. **Автоматическое масштабирование** (Kubernetes)

---

**🎉 Готово! Ваш backend готов к использованию десятками тысяч пользователей!**
