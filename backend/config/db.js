const { Pool } = require('pg');
require('dotenv').config({ path: '../.env' });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const initDB = async () => {
  try {
    // Users Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100),
        role VARCHAR(20) DEFAULT 'student',
        address TEXT,
        phone VARCHAR(20),
        otp VARCHAR(6),
        otp_expires_at TIMESTAMP,
        google_id VARCHAR(100),
        github_id VARCHAR(100)
      );
    `);

    // Enrollments Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS enrollments (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        phone VARCHAR(20) NOT NULL,
        course VARCHAR(100) NOT NULL,
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Migrations for existing Users table
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(100);');
      await pool.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL;');
    } catch (e) {
      console.log('Migration note:', e.message);
    }

    // Settings Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        key VARCHAR(50) UNIQUE NOT NULL,
        value TEXT
      );
    `);

    // Seed Admin User
    const adminCheck = await pool.query("SELECT * FROM users WHERE role = 'admin'");
    if (adminCheck.rows.length === 0) {
      await pool.query(
        "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)",
        ['Administrator', 'admin@aydigital.com', 'admin123', 'admin']
      );
      console.log('Admin user created: admin@aydigital.com / admin123');
    }

    // Seed Default Settings
    const defaultSettings = {
      'email': 'anshulyadav32@icloud.com',
      'phone': '+91 98765 43210',
      'whatsapp': '+91 98765 43210',
      'address': 'Ay Digital Institute, Main Road, City',
      'brand_name': 'AY Digital Institute',
      'brand_logo': '',
      'brand_display': 'both',
      'menu_items': JSON.stringify([
        { label: 'Home', path: '/' },
        { label: 'About', path: '/about' },
        { label: 'Courses', path: '/courses' },
        { label: 'Contact', path: '/contact' }
      ])
    };

    for (const [key, value] of Object.entries(defaultSettings)) {
      await pool.query(
        "INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING",
        [key, value]
      );
    }

    console.log('Database initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};

module.exports = { pool, initDB };
