const { pool } = require('../config/db');

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
