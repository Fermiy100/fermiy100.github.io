const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const XLSX = require('xlsx');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('combined'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://fermiy.ru',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

// Data storage (in production use real database)
let users = [];
let menu = [];
let orders = [];

// Initialize data
async function initializeData() {
  try {
    // Create data directory if it doesn't exist
    await fs.mkdir('./data', { recursive: true });
    
    // Load existing data
    try {
      const usersData = await fs.readFile('./data/users.json', 'utf8');
      users = JSON.parse(usersData);
    } catch (error) {
      // Create default users if file doesn't exist
      users = [
        {
          id: 1,
          name: 'Директор Школы',
          email: 'director@school.ru',
          password: await bcrypt.hash('director123', 10),
          role: 'DIRECTOR',
          school_id: 1,
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          name: 'Родитель Иванов',
          email: 'parent@school.ru',
          password: await bcrypt.hash('parent123', 10),
          role: 'PARENT',
          school_id: 1,
          created_at: new Date().toISOString()
        }
      ];
      await saveUsers();
    }

    try {
      const menuData = await fs.readFile('./data/menu.json', 'utf8');
      menu = JSON.parse(menuData);
    } catch (error) {
      menu = [];
    }

    try {
      const ordersData = await fs.readFile('./data/orders.json', 'utf8');
      orders = JSON.parse(ordersData);
    } catch (error) {
      orders = [];
    }

    console.log('✅ Data initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing data:', error);
  }
}

// Save functions
async function saveUsers() {
  try {
    await fs.writeFile('./data/users.json', JSON.stringify(users, null, 2));
  } catch (error) {
    console.error('Error saving users:', error);
  }
}

async function saveMenu() {
  try {
    await fs.writeFile('./data/menu.json', JSON.stringify(menu, null, 2));
  } catch (error) {
    console.error('Error saving menu:', error);
  }
}

async function saveOrders() {
  try {
    await fs.writeFile('./data/orders.json', JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error('Error saving orders:', error);
  }
}

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: '1.0.0'
  });
});

// Auth routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Users routes
app.get('/api/users', authenticateToken, (req, res) => {
  try {
    const usersWithoutPasswords = users.map(({ password, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', authenticateToken, async (req, res) => {
  try {
    const { name, email, password, role, school_id } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields required' });
    }

    // Check if user already exists
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      name,
      email,
      password: hashedPassword,
      role,
      school_id: school_id || 1,
      created_at: new Date().toISOString()
    };

    users.push(newUser);
    await saveUsers();

    const { password: _, ...userWithoutPassword } = newUser;
    res.status(201).json(userWithoutPassword);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Menu routes
app.get('/api/menu', (req, res) => {
  try {
    res.json(menu);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/menu', authenticateToken, async (req, res) => {
  try {
    const { name, description, price, day_of_week, meal_type, weight, recipe_number } = req.body;

    if (!name || !price || !day_of_week || !meal_type) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    const newItem = {
      id: Math.max(...menu.map(m => m.id), 0) + 1,
      name,
      description: description || '',
      price: parseFloat(price),
      day_of_week,
      meal_type,
      weight: weight || '',
      recipe_number: recipe_number || '',
      created_at: new Date().toISOString()
    };

    menu.push(newItem);
    await saveMenu();

    res.status(201).json(newItem);
  } catch (error) {
    console.error('Create menu item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Menu upload
const upload = multer({ dest: 'uploads/' });

app.post('/api/menu/upload', authenticateToken, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    let addedCount = 0;
    const errors = [];

    for (const row of data) {
      try {
        if (row['Название блюда'] && row['Цена']) {
          const newItem = {
            id: Math.max(...menu.map(m => m.id), 0) + 1,
            name: row['Название блюда'],
            description: row['Описание'] || '',
            price: parseFloat(row['Цена']) || 0,
            day_of_week: row['День недели'] || 'ПОНЕДЕЛЬНИК',
            meal_type: row['Тип приема пищи'] || 'lunch',
            weight: row['Вес'] || '',
            recipe_number: row['Номер рецепта'] || '',
            created_at: new Date().toISOString()
          };

          menu.push(newItem);
          addedCount++;
        }
      } catch (error) {
        errors.push(`Row error: ${error.message}`);
      }
    }

    await saveMenu();

    // Clean up uploaded file
    await fs.unlink(req.file.path);

    res.json({
      success: true,
      message: `Successfully added ${addedCount} menu items`,
      addedCount,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Menu upload error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear menu
app.post('/api/menu/clear', authenticateToken, async (req, res) => {
  try {
    const deletedCount = menu.length;
    menu = [];
    await saveMenu();

    res.json({
      success: true,
      message: 'All menu items cleared',
      deletedCount
    });
  } catch (error) {
    console.error('Clear menu error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Orders routes
app.get('/api/orders', authenticateToken, (req, res) => {
  try {
    res.json(orders);
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/orders', authenticateToken, async (req, res) => {
  try {
    const { user_id, items, total_price } = req.body;

    if (!user_id || !items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    const newOrder = {
      id: Math.max(...orders.map(o => o.id), 0) + 1,
      user_id,
      items,
      total_price: parseFloat(total_price) || 0,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    orders.push(newOrder);
    await saveOrders();

    res.status(201).json(newOrder);
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files
app.use(express.static(path.join(__dirname, '../dist')));

// Catch all handler for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
async function startServer() {
  await initializeData();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌐 Frontend: http://localhost:${PORT}`);
  });
}

startServer().catch(console.error);

module.exports = app;
