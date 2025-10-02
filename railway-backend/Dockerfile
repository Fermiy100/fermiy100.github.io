FROM node:18-alpine

WORKDIR /app

# Копируем только сервер - НЕТ package.json!
COPY server-minimal.js .

# НЕТ npm install - НЕТ зависимостей!
RUN echo "NO NPM INSTALL NEEDED - PURE NODE.JS"

EXPOSE 3000

# Запускаем напрямую
CMD ["node", "server-minimal.js"]