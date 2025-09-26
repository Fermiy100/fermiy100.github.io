#!/usr/bin/env node

/**
 * Быстрое развертывание на Railway через API
 * Автоматически создает проект и развертывает backend
 */

import { execSync } from 'child_process';
import fs from 'fs';

console.log('🚀 Быстрое развертывание на Railway...\n');

// Проверяем наличие Railway CLI
try {
  execSync('railway --version', { stdio: 'pipe' });
  console.log('✅ Railway CLI найден\n');
} catch (error) {
  console.log('⚠️  Railway CLI не найден. Устанавливаем...\n');
  
  try {
    // Устанавливаем Railway CLI
    execSync('npm install -g @railway/cli', { stdio: 'inherit' });
    console.log('✅ Railway CLI установлен\n');
  } catch (installError) {
    console.log('❌ Не удалось установить Railway CLI автоматически\n');
    console.log('📋 Установите вручную:');
    console.log('   npm install -g @railway/cli\n');
    console.log('   Или следуйте инструкциям в RAILWAY_DEPLOY.md\n');
    process.exit(1);
  }
}

// Функция для выполнения команд Railway
function runRailwayCommand(command, description) {
  try {
    console.log(`📋 ${description}...`);
    const result = execSync(command, { encoding: 'utf8' });
    console.log(`✅ ${description} завершено\n`);
    return result.trim();
  } catch (error) {
    console.error(`❌ Ошибка при ${description.toLowerCase()}:`, error.message);
    return null;
  }
}

// Основная функция развертывания
async function deployToRailway() {
  console.log('🔧 Начинаем развертывание на Railway...\n');

  // 1. Входим в Railway
  console.log('🔐 Вход в Railway...');
  console.log('   Откроется браузер для авторизации...\n');
  
  const loginResult = runRailwayCommand('railway login', 'Авторизация в Railway');
  if (!loginResult) {
    console.log('❌ Не удалось войти в Railway');
    console.log('📋 Войдите вручную: railway login\n');
    return;
  }

  // 2. Создаем проект
  const projectResult = runRailwayCommand('railway init', 'Создание проекта Railway');
  if (!projectResult) {
    console.log('❌ Не удалось создать проект');
    return;
  }

  // 3. Устанавливаем переменные окружения
  runRailwayCommand('railway variables set JWT_SECRET=your-super-secret-jwt-key-change-in-production', 'Установка JWT_SECRET');
  runRailwayCommand('railway variables set FRONTEND_URL=https://fermiy100.github.io', 'Установка FRONTEND_URL');
  runRailwayCommand('railway variables set NODE_ENV=production', 'Установка NODE_ENV');

  // 4. Развертываем
  const deployResult = runRailwayCommand('railway up', 'Развертывание на Railway');
  if (!deployResult) {
    console.log('❌ Не удалось развернуть проект');
    return;
  }

  // 5. Получаем URL
  const urlResult = runRailwayCommand('railway domain', 'Получение URL проекта');
  
  if (urlResult) {
    console.log('🎉 Backend успешно развернут на Railway!');
    console.log(`🌐 URL: ${urlResult}`);
    console.log(`🔗 API: ${urlResult}/api`);
    console.log(`🏥 Health check: ${urlResult}/api/health\n`);
    
    console.log('📋 Следующие шаги:');
    console.log('1. Обновите API_BASE_URL в frontend/src/utils/api.ts:');
    console.log(`   const API_BASE_URL = '${urlResult}/api';`);
    console.log('2. Загрузите изменения на GitHub');
    console.log('3. Протестируйте приложение на https://fermiy100.github.io\n');
  } else {
    console.log('⚠️  Не удалось получить URL проекта');
    console.log('📋 Проверьте статус в панели Railway: https://railway.app/dashboard\n');
  }
}

// Запускаем развертывание
deployToRailway().catch(console.error);
