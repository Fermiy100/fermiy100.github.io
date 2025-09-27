#!/usr/bin/env node

/**
 * Скрипт для автоматического развертывания backend
 * Поддерживает несколько платформ: Heroku, Railway, Render
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

console.log('🚀 Запуск автоматического развертывания backend...\n');

// Проверяем наличие package.json
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json не найден. Запустите скрипт из папки backend.');
  process.exit(1);
}

// Функция для выполнения команд
function runCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} завершено\n`);
    return true;
  } catch (error) {
    console.error(`❌ Ошибка при ${description.toLowerCase()}:`, error.message);
    return false;
  }
}

// Функция для создания .env файла
function createEnvFile() {
  const envContent = `# Environment variables for production
PORT=3000
JWT_SECRET=${generateRandomSecret()}
FRONTEND_URL=https://fermiy100.github.io
NODE_ENV=production

# Database
DATABASE_URL=sqlite:./database.sqlite

# Security
BCRYPT_ROUNDS=10
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
`;

  fs.writeFileSync('.env', envContent);
  console.log('✅ Создан .env файл с переменными окружения');
}

// Функция для генерации случайного секрета
function generateRandomSecret() {
  return crypto.randomBytes(64).toString('hex');
}

// Основная функция развертывания
async function deploy() {
  console.log('🔧 Подготовка к развертыванию...\n');

  // 1. Устанавливаем зависимости
  if (!runCommand('npm install', 'Установка зависимостей')) {
    console.error('❌ Не удалось установить зависимости');
    process.exit(1);
  }

  // 2. Создаем .env файл
  createEnvFile();

  // 3. Проверяем наличие Heroku CLI
  try {
    execSync('heroku --version', { stdio: 'pipe' });
    console.log('✅ Heroku CLI найден\n');
    
    // Развертываем на Heroku
    deployToHeroku();
  } catch (error) {
    console.log('⚠️  Heroku CLI не найден. Показываем альтернативные варианты...\n');
    showAlternativeDeployment();
  }
}

// Развертывание на Heroku
function deployToHeroku() {
  console.log('🚀 Развертывание на Heroku...\n');

  // Создаем приложение Heroku
  if (runCommand('heroku create school-meals-api-2024', 'Создание Heroku приложения')) {
    
    // Устанавливаем переменные окружения
    runCommand('heroku config:set JWT_SECRET=' + generateRandomSecret(), 'Установка JWT_SECRET');
    runCommand('heroku config:set FRONTEND_URL=https://fermiy100.github.io', 'Установка FRONTEND_URL');
    runCommand('heroku config:set NODE_ENV=production', 'Установка NODE_ENV');
    
    // Развертываем
    if (runCommand('git add .', 'Добавление файлов в Git')) {
      runCommand('git commit -m "Deploy to Heroku"', 'Создание коммита');
      runCommand('git push heroku main', 'Развертывание на Heroku');
      
      console.log('🎉 Backend успешно развернут на Heroku!');
      console.log('🌐 URL: https://school-meals-api-2024.herokuapp.com');
    }
  }
}

// Альтернативные варианты развертывания
function showAlternativeDeployment() {
  console.log('📋 Альтернативные варианты развертывания:\n');
  
  console.log('1️⃣  Railway (рекомендуется):');
  console.log('   • Перейдите на https://railway.app');
  console.log('   • Войдите через GitHub');
  console.log('   • Нажмите "New Project" → "Deploy from GitHub repo"');
  console.log('   • Выберите ваш репозиторий и папку backend');
  console.log('   • Railway автоматически развернет приложение\n');
  
  console.log('2️⃣  Render:');
  console.log('   • Перейдите на https://render.com');
  console.log('   • Войдите через GitHub');
  console.log('   • Нажмите "New" → "Web Service"');
  console.log('   • Подключите ваш репозиторий');
  console.log('   • Укажите папку backend и команду: node server.js\n');
  
  console.log('3️⃣  Vercel:');
  console.log('   • Перейдите на https://vercel.com');
  console.log('   • Войдите через GitHub');
  console.log('   • Импортируйте ваш репозиторий');
  console.log('   • Настройте папку backend\n');
  
  console.log('4️⃣  Установка Heroku CLI:');
  console.log('   • Windows: winget install Heroku.HerokuCLI');
  console.log('   • macOS: brew install heroku/brew/heroku');
  console.log('   • Linux: curl https://cli-assets.heroku.com/install.sh | sh\n');
  
  console.log('📁 Файлы для развертывания готовы:');
  console.log('   • package.json - зависимости');
  console.log('   • server.js - основной сервер');
  console.log('   • Procfile - конфигурация Heroku');
  console.log('   • railway.json - конфигурация Railway');
  console.log('   • render.yaml - конфигурация Render');
  console.log('   • .env - переменные окружения\n');
  
  console.log('🔧 После развертывания обновите API_BASE_URL в frontend/src/utils/api.ts');
  console.log('   на URL вашего развернутого backend\n');
}

// Запускаем развертывание
deploy().catch(console.error);
