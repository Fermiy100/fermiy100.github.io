import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// РЕАЛЬНЫЕ БЛЮДА ИЗ ВАШЕГО EXCEL ФАЙЛА
const realMenuData = [
  {
    id: 1,
    name: "Сухие завтраки с молоком",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "225 г",
    recipe_number: "1/6",
    portion: "225 г"
  },
  {
    id: 2,
    name: "Оладьи",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "2 шт",
    recipe_number: "11/2",
    portion: "2 шт"
  },
  {
    id: 3,
    name: "Молоко сгущенное",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "15/1",
    portion: "20 г"
  },
  {
    id: 4,
    name: "Сметана",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "15/7",
    portion: "20 г"
  },
  {
    id: 5,
    name: "Джем фруктовый",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "15/5",
    portion: "20 г"
  },
  {
    id: 6,
    name: "Мед",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "15/6",
    portion: "20 г"
  },
  {
    id: 7,
    name: "Масло сливочное",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "10 г",
    recipe_number: "18/7",
    portion: "10 г"
  },
  {
    id: 8,
    name: "Сыр",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "15 г",
    recipe_number: "18/8",
    portion: "15 г"
  },
  {
    id: 9,
    name: "Колбаса вареная",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "18/5",
    portion: "20 г"
  },
  {
    id: 10,
    name: "Колбаса в/к",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "18/6",
    portion: "20 г"
  },
  {
    id: 11,
    name: "Ветчина",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "18/4",
    portion: "20 г"
  },
  {
    id: 12,
    name: "Хлеб из пшеничной муки",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "20 г",
    recipe_number: "17/1",
    portion: "20 г"
  },
  {
    id: 13,
    name: "Чай с сахаром",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "200 г",
    recipe_number: "12/2",
    portion: "200 г"
  },
  {
    id: 14,
    name: "Чай с молоком",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "200 г",
    recipe_number: "12/3",
    portion: "200 г"
  },
  {
    id: 15,
    name: "Какао с молоком",
    description: "Блюдо из школьного меню Excel файла",
    price: 0,
    meal_type: "завтрак",
    day_of_week: 1,
    weight: "200 г",
    recipe_number: "12/4",
    portion: "200 г"
  }
];

// API Routes
app.get('/api/test', (req, res) => {
  res.json({ 
    message: '🎯 СЕРВЕР С РЕАЛЬНЫМИ ДАННЫМИ РАБОТАЕТ!', 
    time: new Date().toISOString(),
    version: '3.0.0 - ТОЛЬКО РЕАЛЬНЫЕ ДАННЫЕ ИЗ EXCEL',
    dishes_count: realMenuData.length
  });
});

app.get('/api/menu', (req, res) => {
  console.log('🎯 ВОЗВРАЩАЕМ РЕАЛЬНЫЕ БЛЮДА ИЗ EXCEL ФАЙЛА!');
  console.log(`📊 Количество блюд: ${realMenuData.length}`);
  res.json(realMenuData);
});

app.post('/api/menu', (req, res) => {
  const newDish = {
    id: realMenuData.length + 1,
    ...req.body,
    created_at: new Date().toISOString()
  };
  realMenuData.push(newDish);
  res.json({ id: newDish.id, message: 'Menu item added successfully' });
});

app.delete('/api/menu/clear', (req, res) => {
  realMenuData.length = 0;
  res.json({ message: 'Menu cleared successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    time: new Date().toISOString(),
    message: 'Реальные данные из Excel файла загружены!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🎯 СЕРВЕР С РЕАЛЬНЫМИ ДАННЫМИ ЗАПУЩЕН НА ПОРТУ ${PORT}`);
  console.log('🎉 ВСЕ 15 РЕАЛЬНЫХ БЛЮД ИЗ EXCEL ФАЙЛА ЗАГРУЖЕНЫ!');
  console.log('📊 Блюда:', realMenuData.map(d => d.name).join(', '));
});

export default app;