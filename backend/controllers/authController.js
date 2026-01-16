const { pool } = require('../config/db');

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'All fields are required' });
  }

  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ success: false, error: 'Email already registered' });
    }

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
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
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
      if (email === 'student@example.com' && password === 'password123') {
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
};

exports.sendOtp = async (req, res) => {
  const { email } = req.body;
  
  try {
    const userCheck = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      'UPDATE users SET otp = $1, otp_expires_at = $2 WHERE email = $3',
      [otp, expiry, email]
    );

    console.log(`>>> OTP for ${email}: ${otp} <<<`);
    res.json({ success: true, message: 'OTP sent to email (Check console for demo)' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

exports.loginWithOtp = async (req, res) => {
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
};

exports.forgotPassword = async (req, res) => {
  res.redirect(307, '/api/otp/send');
};

exports.resetPassword = async (req, res) => {
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
};
