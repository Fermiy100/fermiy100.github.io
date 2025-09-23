const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Простые тестовые данные
const users = [
  { id: 1, email: 'director@school.test', password: 'P@ssw0rd1!', role: 'DIRECTOR' },
  { id: 2, email: 'parent@school.test', password: 'P@ssw0rd1!', role: 'PARENT' }
];

const menus = [
  {
    id: 1,
    title: 'Меню на неделю',
    week: '2024-01-15',
    items: [
      { id: 1, name: 'Борщ', mealType: 'Обед', dayOfWeek: 1, price: 150 },
      { id: 2, name: 'Котлета', mealType: 'Обед', dayOfWeek: 1, price: 200 },
      { id: 3, name: 'Каша', mealType: 'Завтрак', dayOfWeek: 2, price: 100 },
      { id: 4, name: 'Суп', mealType: 'Обед', dayOfWeek: 2, price: 120 },
      { id: 5, name: 'Плов', mealType: 'Обед', dayOfWeek: 3, price: 180 },
      { id: 6, name: 'Салат', mealType: 'Обед', dayOfWeek: 3, price: 80 }
    ]
  }
];

// Маршруты
app.get('/ping', (req, res) => res.send('pong'));

app.get('/health', (req, res) => res.json({ ok: true }));

// Авторизация
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    return res.status(401).json({ error: 'Неверные учетные данные' });
  }
  
  res.json({
    token: 'demo-token-' + user.id,
    user: { id: user.id, email: user.email, role: user.role }
  });
});

// Получение текущего меню
app.get('/api/menus/current', (req, res) => {
  const schoolId = req.query.schoolId || 1;
  const menu = menus[0];
  res.json({ menu });
});

// Загрузка меню (заглушка)
app.post('/api/menus/upload', (req, res) => {
  res.json({ 
    message: 'Меню загружено успешно',
    menuId: 1,
    createdCount: 6
  });
});

// Выбор блюд (заглушка)
app.post('/api/selections', (req, res) => {
  const { selections } = req.body;
  res.json({ 
    message: 'Выбор сохранен',
    createdCount: selections.length
  });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
