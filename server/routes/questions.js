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

router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { text, category } = req.body;

  if (!text || !category) {
    return res.status(400).json({ message: 'Text and category are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE questions SET text = $1, category = $2 WHERE id = $3 RETURNING *',
      [text, category, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating question:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;