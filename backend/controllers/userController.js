const { pool } = require('../config/db');

// Update Profile (Address/Phone)
exports.updateProfile = async (req, res) => {
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
};

// Get All Users (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, role, phone, address FROM users ORDER BY id ASC');
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create User (Admin)
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

    const newUser = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
      [name, email, password, role || 'student']
    );

    res.json({ success: true, user: newUser.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Admin Reset Password
exports.adminResetPassword = async (req, res) => {
  const { userId, newPassword } = req.body;

  if (!userId || !newPassword) {
    return res.status(400).json({ success: false, error: 'User ID and new password are required' });
  }

  try {
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
    res.json({ success: true, message: 'Password reset successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// User Change Password
exports.changePassword = async (req, res) => {
  const { userId, oldPassword, newPassword } = req.body;

  if (!userId || !oldPassword || !newPassword) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];
    if (user.password !== oldPassword) {
      return res.status(400).json({ success: false, error: 'Incorrect old password' });
    }

    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [newPassword, userId]);
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};
