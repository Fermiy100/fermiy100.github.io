# 🚀 RAILWAY DEPLOYMENT GUIDE

## Полное развертывание системы школьного питания на Railway

### ✅ **ЧТО ВКЛЮЧЕНО:**

1. **Backend API** - Express.js сервер с полным функционалом
2. **Frontend** - React приложение с мобильной оптимизацией
3. **Database** - JSON файлы для хранения данных
4. **Authentication** - JWT токены и bcrypt хеширование
5. **File Upload** - Загрузка Excel файлов с меню
6. **Security** - Rate limiting, CORS, Helmet
7. **Monitoring** - Health checks и логирование

---

## 🚀 **БЫСТРОЕ РАЗВЕРТЫВАНИЕ**

### **Вариант 1: Через Railway CLI**

```bash
# 1. Установите Railway CLI
npm install -g @railway/cli

# 2. Войдите в аккаунт
railway login

# 3. Создайте проект
railway project create school-meals-app

# 4. Установите переменные окружения
railway variables set NODE_ENV=production
railway variables set JWT_SECRET=$(openssl rand -base64 32)
railway variables set FRONTEND_URL=https://your-app.railway.app

# 5. Разверните приложение
railway up
```

### **Вариант 2: Через Railway Dashboard**

1. **Перейдите на [railway.app](https://railway.app)**
2. **Нажмите "New Project"**
3. **Выберите "Deploy from GitHub repo"**
4. **Подключите ваш репозиторий**
5. **Railway автоматически определит настройки**

---

## ⚙️ **КОНФИГУРАЦИЯ**

### **Переменные окружения:**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=https://your-app.railway.app
```

### **Структура проекта:**

```
school-meals-app/
├── railway-backend/          # Backend API
│   ├── server.js            # Express сервер
│   ├── package.json         # Backend зависимости
│   └── env.example         # Пример переменных
├── dist/                    # Собранный фронтенд
├── components/              # React компоненты
├── railway.json            # Railway конфигурация
├── Dockerfile              # Docker конфигурация
├── docker-compose.yml      # Docker Compose
└── deploy-railway.sh       # Скрипт развертывания
```

---

## 🔧 **ФУНКЦИОНАЛЬНОСТЬ**

### **API Endpoints:**

- `GET /api/health` - Проверка состояния
- `POST /api/auth/login` - Авторизация
- `GET /api/users` - Список пользователей
- `POST /api/users` - Создание пользователя
- `GET /api/menu` - Получение меню
- `POST /api/menu` - Добавление блюда
- `POST /api/menu/upload` - Загрузка Excel
- `POST /api/menu/clear` - Очистка меню
- `GET /api/orders` - Список заказов
- `POST /api/orders` - Создание заказа

### **Безопасность:**

- ✅ **JWT Authentication** - Безопасные токены
- ✅ **bcrypt Hashing** - Хеширование паролей
- ✅ **Rate Limiting** - Защита от спама
- ✅ **CORS Protection** - Настройка доступа
- ✅ **Helmet Security** - HTTP заголовки
- ✅ **Input Validation** - Валидация данных

---

## 📊 **МОНИТОРИНГ**

### **Health Check:**
```bash
curl https://your-app.railway.app/api/health
```

### **Логи:**
```bash
railway logs
```

### **Метрики:**
- CPU Usage
- Memory Usage
- Request Count
- Response Time

---

## 🚀 **АВТОМАТИЧЕСКОЕ РАЗВЕРТЫВАНИЕ**

### **GitHub Actions:**

```yaml
name: Deploy to Railway
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: railway-app/railway-deploy@v1
        with:
          railway-token: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 🔄 **ОБНОВЛЕНИЕ**

### **Автоматическое обновление:**
```bash
# При push в main ветку Railway автоматически пересоберет и развернет
git push origin main
```

### **Ручное обновление:**
```bash
railway redeploy
```

---

## 🛠️ **ЛОКАЛЬНАЯ РАЗРАБОТКА**

### **Запуск локально:**
```bash
# Установка зависимостей
npm install
cd railway-backend && npm install

# Сборка фронтенда
npm run build

# Запуск бэкенда
cd railway-backend && npm start
```

### **Docker:**
```bash
# Сборка образа
docker build -t school-meals-app .

# Запуск контейнера
docker run -p 3000:3000 school-meals-app
```

---

## 📱 **МОБИЛЬНАЯ ОПТИМИЗАЦИЯ**

### **Включено:**
- ✅ **Responsive Design** - Адаптивная верстка
- ✅ **Touch Optimization** - Оптимизация для касаний
- ✅ **PWA Ready** - Готовность к PWA
- ✅ **Fast Loading** - Быстрая загрузка
- ✅ **Offline Support** - Поддержка офлайн

---

## 🎯 **РЕЗУЛЬТАТ**

### **После развертывания вы получите:**

1. **🌐 Полнофункциональное веб-приложение**
2. **📱 Мобильную версию**
3. **🔐 Безопасную авторизацию**
4. **📊 Админ панель**
5. **🍽️ Систему заказа питания**
6. **📈 Статистику и аналитику**
7. **⚡ Высокую производительность**

### **URL вашего приложения:**
```
https://your-app-name.railway.app
```

---

## 🆘 **ПОДДЕРЖКА**

### **Проблемы с развертыванием:**
1. Проверьте логи: `railway logs`
2. Проверьте переменные: `railway variables`
3. Проверьте health check: `/api/health`

### **Полезные команды:**
```bash
railway status          # Статус приложения
railway logs            # Просмотр логов
railway variables       # Переменные окружения
railway redeploy        # Переразвертывание
```

---

## 🎉 **ГОТОВО!**

**Ваше приложение полностью развернуто на Railway и готово к использованию!**

**Все функции работают:**
- ✅ Авторизация пользователей
- ✅ Управление меню
- ✅ Система заказов
- ✅ Мобильная версия
- ✅ Админ панель
- ✅ Статистика
