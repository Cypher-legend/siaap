const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// ✅ Get all questions with category names
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT q.id, q.text, q.category_id, c.name AS category
      FROM questions q
      JOIN categories c ON q.category_id = c.id
      ORDER BY q.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Get questions by category ID
router.get('/category/:categoryId', authenticateToken, async (req, res) => {
  const { categoryId } = req.params;
  try {
    const result = await pool.query(
      `
      SELECT q.id, q.text, q.category_id, c.name AS category
      FROM questions q
      JOIN categories c ON q.category_id = c.id
      WHERE q.category_id = $1
      ORDER BY q.id
      `,
      [categoryId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions by category:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Create new question
router.post('/', authenticateToken, async (req, res) => {
  const { text, category_id } = req.body;

  if (!text || !category_id) {
    return res.status(400).json({ message: 'Text and category_id are required' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO questions (text, category_id) VALUES ($1, $2) RETURNING *',
      [text, category_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating question:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Update question
router.put('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;
  const { text, category_id } = req.body;

  if (!text || !category_id) {
    return res.status(400).json({ message: 'Text and category_id are required' });
  }

  try {
    const result = await pool.query(
      'UPDATE questions SET text = $1, category_id = $2 WHERE id = $3 RETURNING *',
      [text, category_id, id]
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

// ✅ Delete question
router.delete('/:id', authenticateToken, async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM questions WHERE id = $1 RETURNING *', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json({ message: 'Question deleted' });
  } catch (err) {
    console.error('Error deleting question:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
