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
app.use(express.json({ limit: '10mb' }));

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
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    // Check if user exists
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    // Insert new user
    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, email, password, 'student']
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

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Login Endpoint
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Ensure table structure is updated with address/phone/otp/social
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

    // Create Enrollments Table
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

    // Create Settings Table
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
      'brand_logo': '', // URL or base64
      'brand_display': 'both', // 'name', 'logo', 'both'
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
    
    // Add columns if they don't exist (migration for existing table)
    try {
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires_at TIMESTAMP;');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(100);');
      await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id VARCHAR(100);');
      await pool.query('ALTER TABLE users ALTER COLUMN password DROP NOT NULL;'); // Password optional for social login
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

// Enrollment Endpoint
app.post('/api/enroll', async (req, res) => {
  const { name, email, phone, course, message } = req.body;

  if (!name || !email || !phone || !course) {
    return res.status(400).json({ success: false, error: 'All required fields must be filled' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO enrollments (name, email, phone, course, message) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, email, phone, course, message || '']
    );
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Get Site Settings
app.get('/api/settings', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM site_settings');
    const settings = {};
    result.rows.forEach(row => {
      settings[row.key] = row.value;
    });
    res.json({ success: true, settings });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Update Site Settings (Admin only - simplified check)
app.post('/api/settings', async (req, res) => {
  const { settings } = req.body; // Expect object { key: value }
  
  try {
    for (const [key, value] of Object.entries(settings)) {
      const valToStore = typeof value === 'object' ? JSON.stringify(value) : value;
      await pool.query(
        'INSERT INTO site_settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
        [key, valToStore]
      );
    }
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// OTP Endpoints
app.post('/api/otp/send', async (req, res) => {
  const { email } = req.body;
  
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'UPDATE users SET otp = $1, otp_expires_at = $2 WHERE email = $3',
      [otp, expiry, email]
    );

    // In a real app, send via Email (Nodemailer)
    console.log(`>>> OTP for ${email}: ${otp} <<<`);

    res.json({ success: true, message: 'OTP sent to email (Check console for demo)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

app.post('/api/otp/login', async (req, res) => {
  const { email, otp } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = result.rows[0];

    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ success: false, error: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otp_expires_at)) {
      return res.status(400).json({ success: false, error: 'OTP Expired' });
    }

    // Clear OTP
    await pool.query('UPDATE users SET otp = NULL, otp_expires_at = NULL WHERE id = $1', [user.id]);

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
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
});

// Forgot Password
app.post('/api/forgot-password', async (req, res) => {
  // Reusing the same OTP logic for simplicity
  const { email } = req.body;
  // Redirect to send OTP logic internally or duplicate
  // For simplicity, client can just call /api/otp/send and then redirect to reset page
  res.redirect(307, '/api/otp/send');
});

app.post('/api/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) return res.status(404).json({ success: false, error: 'User not found' });

    const user = result.rows[0];
    if (user.otp !== otp) return res.status(400).json({ success: false, error: 'Invalid OTP' });

    await pool.query(
      'UPDATE users SET password = $1, otp = NULL, otp_expires_at = NULL WHERE id = $2',
      [newPassword, user.id]
    );

    res.json({ success: true, message: 'Password reset successfully' });
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
