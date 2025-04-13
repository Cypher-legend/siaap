const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../db');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const { mobileNumber, password, role } = req.body;

  if (!mobileNumber || !password || !role) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      'INSERT INTO users (mobile_number, password_hash, role) VALUES ($1, $2, $3)',
      [mobileNumber, hashedPassword, role]
    );
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      res.status(400).json({ message: 'Mobile number already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
});

module.exports = router;
