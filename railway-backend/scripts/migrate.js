/**
 * Миграция базы данных для PostgreSQL
 */

import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/school_meals'
});

const migrations = [
  {
    version: 1,
    name: 'create_initial_tables',
    up: `
      -- Schools table
      CREATE TABLE IF NOT EXISTS schools (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        address TEXT,
        phone VARCHAR(50),
        email VARCHAR(255),
        director_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('DIRECTOR', 'PARENT', 'STUDENT')),
        school_id INTEGER NOT NULL REFERENCES schools(id),
        verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Menu items table
      CREATE TABLE IF NOT EXISTS menu_items (
        id SERIAL PRIMARY KEY,
        school_id INTEGER NOT NULL REFERENCES schools(id),
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL DEFAULT 0,
        meal_type VARCHAR(50) NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
        portion VARCHAR(100),
        week_start DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Orders table
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        school_id INTEGER NOT NULL REFERENCES schools(id),
        menu_item_id INTEGER NOT NULL REFERENCES menu_items(id),
        week_start DATE NOT NULL,
        day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
        price DECIMAL(10,2),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Indexes for performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_school_id ON users(school_id);
      CREATE INDEX IF NOT EXISTS idx_menu_items_school_week ON menu_items(school_id, week_start);
      CREATE INDEX IF NOT EXISTS idx_orders_user_week ON orders(user_id, week_start);
      CREATE INDEX IF NOT EXISTS idx_orders_school_week ON orders(school_id, week_start);

      -- Migration tracking table
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        version INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `
  },
  {
    version: 2,
    name: 'add_performance_indexes',
    up: `
      -- Additional indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_menu_items_meal_type ON menu_items(meal_type);
      CREATE INDEX IF NOT EXISTS idx_menu_items_day_week ON menu_items(day_of_week);
      CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
      CREATE INDEX IF NOT EXISTS idx_users_verified ON users(verified);
    `
  },
  {
    version: 3,
    name: 'add_audit_logs',
    up: `
      -- Audit logs table for security tracking
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        action VARCHAR(100) NOT NULL,
        resource_type VARCHAR(50),
        resource_id INTEGER,
        details JSONB,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
    `
  }
];

async function runMigrations() {
  try {
    console.log('🔄 Начинаем миграцию базы данных...');
    
    // Check if migrations table exists
    await db.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        version INTEGER UNIQUE NOT NULL,
        name VARCHAR(255) NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Get executed migrations
    const result = await db.query('SELECT version FROM migrations ORDER BY version');
    const executedVersions = result.rows.map(row => row.version);

    // Run pending migrations
    for (const migration of migrations) {
      if (!executedVersions.includes(migration.version)) {
        console.log(`📝 Выполняем миграцию ${migration.version}: ${migration.name}`);
        
        await db.query(migration.up);
        
        await db.query(
          'INSERT INTO migrations (version, name) VALUES ($1, $2)',
          [migration.version, migration.name]
        );
        
        console.log(`✅ Миграция ${migration.version} выполнена`);
      } else {
        console.log(`⏭️ Миграция ${migration.version} уже выполнена`);
      }
    }

    console.log('🎉 Все миграции выполнены успешно!');
    
  } catch (error) {
    console.error('❌ Ошибка при выполнении миграций:', error);
    process.exit(1);
  } finally {
    await db.end();
  }
}

// Run migrations if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations();
}

export { runMigrations };
