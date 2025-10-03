// Простой тест для проверки работы парсера
import fs from 'fs';
import path from 'path';

console.log('🚀 Тестируем ULTIMATE EXCEL PARSER...');

// Проверяем, есть ли Excel файл
const excelPath = path.join(process.cwd(), 'menu.xlsx');
console.log('📁 Путь к Excel файлу:', excelPath);

if (fs.existsSync(excelPath)) {
    console.log('✅ Excel файл найден!');
    const stats = fs.statSync(excelPath);
    console.log('📊 Размер файла:', stats.size, 'байт');
} else {
    console.log('❌ Excel файл не найден!');
}

// Проверяем, есть ли package.json
const packagePath = path.join(process.cwd(), 'package.json');
if (fs.existsSync(packagePath)) {
    console.log('✅ package.json найден!');
    const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    console.log('📦 Зависимости:', Object.keys(packageData.dependencies || {}));
} else {
    console.log('❌ package.json не найден!');
}

console.log('🎉 Тест завершен!');