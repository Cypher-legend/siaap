const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ✅ Get all questions
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM questions ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get questions by category
router.get('/category/:category', authenticateToken, async (req, res) => {
  const { category } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM questions WHERE category = $1 ORDER BY id',
      [category]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
