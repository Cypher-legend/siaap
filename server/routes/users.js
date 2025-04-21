// routes/users.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const {
    mobile_number,
    password,
    role,
    first_name,
    last_name,
    setlocation
  } = req.body;

  if (!mobile_number || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (mobile_number, password_hash, role, first_name, last_name, setlocation)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [mobile_number, hashedPassword, role, first_name, last_name, setlocation ?? 0]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ message: 'Mobile number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});


router.get('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, first_name, last_name, mobile_number, role, setlocation
      FROM users
      ORDER BY id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const {
    first_name,
    last_name,
    mobile_number,
    role,
    setlocation,
  } = req.body;

  const { id } = req.params;

  try {
    const result = await pool.query(
      `UPDATE users 
       SET first_name = $1, last_name = $2, mobile_number = $3, role = $4, setlocation = $5 
       WHERE id = $6 
       RETURNING *`,
      [first_name, last_name, mobile_number, role, setlocation, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
