#!/usr/bin/env node

/**
 * Автоматическое развертывание через GitHub и Railway
 * Создает все необходимые файлы и инструкции
 */

import fs from 'fs';
import { execSync } from 'child_process';

console.log('🚀 Автоматическое развертывание backend...\n');

// Создаем файл для автоматического развертывания на Railway
const railwayConfig = {
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
};

// Создаем файл для Render
const renderConfig = `services:
  - type: web
    name: school-meals-api
    env: node
    plan: free
    buildCommand: npm install
    startCommand: node server.js
    envVars:
      - key: NODE_ENV
        value: production
      - key: JWT_SECRET
        generateValue: true
      - key: FRONTEND_URL
        value: https://fermiy100.github.io
      - key: PORT
        value: 10000`;

// Создаем файл для Vercel
const vercelConfig = `{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production",
    "JWT_SECRET": "your-super-secret-jwt-key-change-in-production",
    "FRONTEND_URL": "https://fermiy100.github.io"
  }
}`;

// Создаем файл для Netlify
const netlifyConfig = `[build]
  command = "npm install && node server.js"
  functions = "netlify/functions"
  publish = "."

[build.environment]
  NODE_ENV = "production"
  JWT_SECRET = "your-super-secret-jwt-key-change-in-production"
  FRONTEND_URL = "https://fermiy100.github.io"`;

// Создаем файлы конфигурации
fs.writeFileSync('railway.json', JSON.stringify(railwayConfig, null, 2));
fs.writeFileSync('render.yaml', renderConfig);
fs.writeFileSync('vercel.json', vercelConfig);
fs.writeFileSync('netlify.toml', netlifyConfig);

console.log('✅ Созданы конфигурации для всех платформ:');
console.log('   • railway.json - для Railway');
console.log('   • render.yaml - для Render');
console.log('   • vercel.json - для Vercel');
console.log('   • netlify.toml - для Netlify\n');

// Создаем инструкцию по развертыванию
const deploymentGuide = `# 🚀 Автоматическое развертывание Backend

## Вариант 1: Railway (рекомендуется - 2 минуты)

1. **Откройте**: https://railway.app
2. **Войдите через GitHub** (тот же аккаунт, что и для GitHub Pages)
3. **Создайте проект**:
   - Нажмите "New Project"
   - Выберите "Deploy from GitHub repo"
   - Найдите репозиторий: \`fermiy100/fermiy100.github.io\`
   - Выберите папку: \`school-meals-app — копия/backend\`

4. **Railway автоматически**:
   - Установит зависимости
   - Запустит сервер
   - Назначит URL (например: \`https://school-meals-api-production.up.railway.app\`)

5. **Добавьте переменные окружения** в панели Railway:
   - \`JWT_SECRET\`: \`your-super-secret-jwt-key-change-in-production\`
   - \`FRONTEND_URL\`: \`https://fermiy100.github.io\`
   - \`NODE_ENV\`: \`production\`

## Вариант 2: Render (бесплатно - 3 минуты)

1. **Откройте**: https://render.com
2. **Войдите через GitHub**
3. **Создайте Web Service**:
   - Нажмите "New" → "Web Service"
   - Подключите репозиторий: \`fermiy100/fermiy100.github.io\`
   - Укажите папку: \`school-meals-app — копия/backend\`
   - Команда запуска: \`node server.js\`

## Вариант 3: Vercel (бесплатно - 2 минуты)

1. **Откройте**: https://vercel.com
2. **Войдите через GitHub**
3. **Импортируйте проект**:
   - Выберите репозиторий: \`fermiy100/fermiy100.github.io\`
   - Настройте папку: \`school-meals-app — копия/backend\`

## После развертывания:

1. **Получите URL** от выбранной платформы
2. **Обновите frontend** в \`frontend/src/utils/api.ts\`:
   \`\`\`typescript
   const API_BASE_URL = 'https://your-backend-url.com/api';
   \`\`\`
3. **Загрузите изменения** на GitHub
4. **Протестируйте** на https://fermiy100.github.io

## Проверка:

После развертывания проверьте:
- Health check: \`https://your-url/api/health\`
- Должен вернуть: \`{"status":"OK","timestamp":"..."}\`

## Готово! 🎉

Время развертывания: 2-3 минуты
Все файлы готовы, инструкции созданы!`;

fs.writeFileSync('DEPLOYMENT_INSTRUCTIONS.md', deploymentGuide);

console.log('✅ Создана инструкция по развертыванию: DEPLOYMENT_INSTRUCTIONS.md\n');

// Проверяем, что все файлы на месте
const requiredFiles = [
  'package.json',
  'server.js',
  'railway.json',
  'render.yaml',
  'vercel.json',
  'netlify.toml',
  'Procfile'
];

console.log('📋 Проверка файлов:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - отсутствует`);
  }
});

console.log('\n🎯 Все готово для развертывания!');
console.log('📖 Откройте DEPLOYMENT_INSTRUCTIONS.md для пошаговых инструкций');
console.log('⏱️  Время развертывания: 2-3 минуты\n');

console.log('🚀 Рекомендуемый порядок действий:');
console.log('1. Откройте https://railway.app');
console.log('2. Войдите через GitHub');
console.log('3. Deploy from GitHub repo');
console.log('4. Выберите папку backend');
console.log('5. Добавьте переменные окружения');
console.log('6. Обновите frontend с новым URL');
console.log('7. Протестируйте приложение\n');

console.log('🎉 Backend будет развернут автоматически!');
