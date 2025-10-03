// СУПЕР ПРОСТОЙ СЕРВЕР БЕЗ ЗАВИСИМОСТЕЙ
const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 10000;

// РЕАЛЬНЫЕ БЛЮДА ИЗ ВАШЕГО EXCEL ФАЙЛА
const realMenuData = [
  { id: 1, name: "Сухие завтраки с молоком", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "225 г", recipe_number: "1/6", portion: "225 г" },
  { id: 2, name: "Оладьи", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "2 шт", recipe_number: "11/2", portion: "2 шт" },
  { id: 3, name: "Молоко сгущенное", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "15/1", portion: "20 г" },
  { id: 4, name: "Сметана", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "15/7", portion: "20 г" },
  { id: 5, name: "Джем фруктовый", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "15/5", portion: "20 г" },
  { id: 6, name: "Мед", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "15/6", portion: "20 г" },
  { id: 7, name: "Масло сливочное", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "10 г", recipe_number: "18/7", portion: "10 г" },
  { id: 8, name: "Сыр", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "15 г", recipe_number: "18/8", portion: "15 г" },
  { id: 9, name: "Колбаса вареная", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "18/5", portion: "20 г" },
  { id: 10, name: "Колбаса в/к", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "18/6", portion: "20 г" },
  { id: 11, name: "Ветчина", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "18/4", portion: "20 г" },
  { id: 12, name: "Хлеб из пшеничной муки", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "20 г", recipe_number: "17/1", portion: "20 г" },
  { id: 13, name: "Чай с сахаром", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "200 г", recipe_number: "12/2", portion: "200 г" },
  { id: 14, name: "Чай с молоком", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "200 г", recipe_number: "12/3", portion: "200 г" },
  { id: 15, name: "Какао с молоком", description: "Блюдо из школьного меню Excel файла", price: 0, meal_type: "завтрак", day_of_week: 1, weight: "200 г", recipe_number: "12/4", portion: "200 г" }
];

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (path === '/api/test') {
    const response = {
      message: '🎯 RENDER.COM РАБОТАЕТ! РЕАЛЬНЫЕ ДАННЫЕ ИЗ EXCEL!',
      time: new Date().toISOString(),
      version: '1.0.0 - ТОЛЬКО РЕАЛЬНЫЕ ДАННЫЕ',
      dishes_count: realMenuData.length,
      platform: 'Render.com - WORKING!'
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } else if (path === '/api/menu') {
    console.log('🎯 ВОЗВРАЩАЕМ РЕАЛЬНЫЕ БЛЮДА ИЗ EXCEL!');
    res.writeHead(200);
    res.end(JSON.stringify(realMenuData, null, 2));
  } else if (path === '/health') {
    const response = {
      status: 'OK',
      time: new Date().toISOString(),
      message: 'Render.com работает! Реальные данные загружены!'
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } else if (path === '/') {
    const response = {
      message: 'School Meals Backend API',
      version: '1.0.0',
      platform: 'Render.com - WORKING!',
      endpoints: {
        test: '/api/test',
        menu: '/api/menu',
        health: '/health'
      },
      real_dishes_count: realMenuData.length
    };
    res.writeHead(200);
    res.end(JSON.stringify(response, null, 2));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🎯 RENDER.COM СЕРВЕР ЗАПУЩЕН НА ПОРТУ ${PORT}`);
  console.log('🎉 ВСЕ 15 РЕАЛЬНЫХ БЛЮД ИЗ EXCEL ЗАГРУЖЕНЫ!');
  console.log('🚀 Платформа: Render.com - WORKING!');
});
