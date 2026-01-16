const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from parent .env file
dotenv.config({ path: '../.env' });

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Postgres Connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB Connection
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('Connected to Database successfully');
  release();
});

// API Routes

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ensure table structure is updated with address/phone
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL,
        role VARCHAR(20) DEFAULT 'student',
        address TEXT,
        phone VARCHAR(20)
      );
    `);
    
    // Add columns if they don't exist (migration for existing table)
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);');
    } catch (e) {
      console.log('Columns likely exist or migration error:', e.message);
    }

    // Check if user exists
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      // Simple password check (should be hashed in production)
      if (user.password === password) {
        res.json({ 
          success: true, 
          user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            address: user.address,
            phone: user.phone
          } 
        });
      } else {
        res.status(401).json({ success: false, error: 'Invalid credentials' });
      }
    } else {
      // For demo: If no user found, create a demo user if email is 'student@example.com'
      if (email === 'student@example.com' && password === 'password123') {
         // Insert demo user
         const newUser = await pool.query(
           'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
           ['Demo Student', 'student@example.com', 'password123', 'student']
         );
         const user = newUser.rows[0];
         res.json({ 
           success: true, 
           user: { 
             id: user.id, 
             name: user.name, 
             email: user.email, 
             role: user.role,
             address: user.address,
             phone: user.phone
           } 
         });
      } else {
         res.status(401).json({ success: false, error: 'User not found' });
      }
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update Profile Endpoint
app.post('/api/update-profile', async (req, res) => {
  const { id, address, phone } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'User ID is required' });
  }

  try {
    const result = await pool.query(
      'UPDATE users SET address = $1, phone = $2 WHERE id = $3 RETURNING *',
      [address, phone, id]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          name: user.name, 
          email: user.email, 
          role: user.role,
          address: user.address,
          phone: user.phone
        } 
      });
    } else {
      res.status(404).json({ success: false, error: 'User not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Start Server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Backend server running on http://localhost:${port}`);
  });
}

module.exports = app;
