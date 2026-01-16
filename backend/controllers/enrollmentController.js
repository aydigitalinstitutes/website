const { pool } = require('../config/db');

exports.createEnrollment = async (req, res) => {
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
};
