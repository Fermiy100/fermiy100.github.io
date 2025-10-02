FROM node:18-alpine

WORKDIR /app

# Устанавливаем bash для отладки
RUN apk add --no-cache bash

# Копируем файлы
COPY server-minimal.js .
COPY server-debug.js .
COPY start.sh .

# Делаем скрипт исполняемым
RUN chmod +x start.sh

# Показываем что скопировалось
RUN echo "📁 Files copied:" && ls -la

# Порт будет динамический от Railway
EXPOSE $PORT

# Отладочный запуск
CMD ["bash", "start.sh"]