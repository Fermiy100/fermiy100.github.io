-- База данных для школьного питания на Host-A
-- Создается в phpMyAdmin

-- Таблица школ
CREATE TABLE IF NOT EXISTS schools (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Таблица пользователей
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('DIRECTOR', 'PARENT', 'STUDENT') NOT NULL,
    school_id INT,
    class_name VARCHAR(50),
    phone VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
);

-- Таблица меню
CREATE TABLE IF NOT EXISTS menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    portion VARCHAR(100),
    day_of_week INT NOT NULL CHECK (day_of_week >= 1 AND day_of_week <= 5),
    meal_type ENUM('завтрак', 'обед', 'полдник', 'ужин', 'дополнительно') NOT NULL,
    school_id INT NOT NULL,
    week_start DATE NOT NULL,
    recipe_number VARCHAR(50),
    weight VARCHAR(50),
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    INDEX idx_school_week (school_id, week_start),
    INDEX idx_day_meal (day_of_week, meal_type)
);

-- Таблица заказов
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    menu_item_id INT NOT NULL,
    order_date DATE NOT NULL,
    quantity INT DEFAULT 1,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE,
    INDEX idx_user_date (user_id, order_date),
    INDEX idx_status (status)
);

-- Таблица настроек
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    school_id INT,
    setting_key VARCHAR(100) NOT NULL,
    setting_value TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE,
    UNIQUE KEY unique_school_setting (school_id, setting_key)
);

-- Вставляем тестовую школу
INSERT INTO schools (id, name, address, phone, email) VALUES 
(1, 'Тестовая школа №1', 'г. Москва, ул. Тестовая, д. 1', '+7 (495) 123-45-67', 'school@test.ru')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Вставляем тестовых пользователей
INSERT INTO users (id, email, password_hash, name, role, school_id, class_name, phone) VALUES 
(1, 'director@school.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Директор школы', 'DIRECTOR', 1, NULL, '+7 (495) 111-11-11'),
(2, 'parent@school.test', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Родитель/Ученик', 'PARENT', 1, '5А', '+7 (495) 222-22-22')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Вставляем тестовые настройки
INSERT INTO settings (school_id, setting_key, setting_value) VALUES 
(1, 'order_deadline_hours', '24'),
(1, 'max_orders_per_day', '10'),
(1, 'notification_email', 'school@test.ru')
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);
