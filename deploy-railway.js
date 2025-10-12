#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 ДЕПЛОЙ НА RAILWAY - FERMIY.RU STRUCTURED PARSER');

// Копируем файлы в railway-backend
const filesToCopy = [
    'director-fermiy.html',
    'parent-fermiy.html', 
    'index-fermiy.html',
    'excel-parser-v2.html'
];

const railwayDir = './railway-backend';

// Создаем директорию если не существует
if (!fs.existsSync(railwayDir)) {
    fs.mkdirSync(railwayDir, { recursive: true });
}

// Копируем файлы
filesToCopy.forEach(file => {
    const sourcePath = file;
    const destPath = path.join(railwayDir, file);
    
    if (fs.existsSync(sourcePath)) {
        fs.copyFileSync(sourcePath, destPath);
        console.log(`✅ Скопирован: ${file}`);
    } else {
        console.log(`⚠️ Файл не найден: ${file}`);
    }
});

// Обновляем package.json
const packageJson = {
    "name": "fermiy-ru-backend",
    "version": "31.0.0",
    "description": "Fermiy.ru School Meals Backend - Structured Excel Parser",
    "main": "app.js",
    "scripts": {
        "start": "node app.js"
    },
    "engines": {
        "node": "18.x"
    },
    "keywords": ["fermiy", "school", "meals", "excel", "parser", "structured"],
    "author": "Fermiy",
    "license": "MIT"
};

fs.writeFileSync(
    path.join(railwayDir, 'package.json'), 
    JSON.stringify(packageJson, null, 2)
);

console.log('✅ package.json обновлен');

// Создаем README для Railway
const readme = `# Fermiy.ru School Meals Backend

## 🚀 Structured Excel Parser v31.0.0

Сервер для обработки Excel файлов школьного меню с парными столбцами.

### Особенности:
- Парсинг структуры с парами столбцов для каждого дня
- Распознавание дней недели: Понедельник, Вторник, Среда, Четверг, Пятница
- Определение типов питания: ЗАВТРАК, ОБЕД, ПОЛДНИК
- Очистка блюд от служебных символов
- API для загрузки и получения меню

### Endpoints:
- \`POST /api/menus/upload\` - Загрузка Excel файла
- \`GET /api/menus\` - Получение меню
- \`GET /api/health\` - Проверка здоровья сервера

### Структура Excel:
- Файл содержит 1 лист с названием "2-Я НЕДЕЛЯ"
- Каждая пара столбцов соответствует одному дню недели
- В первой строке указано название дня
- Секции: ЗАВТРАК, ОБЕД, ПОЛДНИК

Развернуто на Railway для fermiy.ru
`;

fs.writeFileSync(path.join(railwayDir, 'README.md'), readme);

console.log('✅ README.md создан');

console.log('🎉 ДЕПЛОЙ ГОТОВ!');
console.log('📁 Файлы скопированы в railway-backend/');
console.log('🚀 Готово для развертывания на Railway');
