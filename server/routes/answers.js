const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get list of categories from questions table
router.get('/questions/categories', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT DISTINCT category FROM questions ORDER BY category');
    res.json(result.rows.map(row => row.category));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ message: 'Error fetching categories' });
  }
});

// Get questions by category
router.get('/questions', authenticateToken, async (req, res) => {
  const { category } = req.query;
  try {
    const result = await pool.query('SELECT * FROM questions WHERE category = $1 ORDER BY id', [category]);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching questions:', err);
    res.status(500).json({ message: 'Error fetching questions' });
  }
});

// Get answers for a session
router.get('/answers/:sessionId', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;
  try {
    const result = await pool.query(
      'SELECT question_id, answer_value FROM answers WHERE session_id = $1',
      [sessionId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching answers:', err);
    res.status(500).json({ message: 'Error fetching answers' });
  }
});

// Submit or update an answer
router.post('/answers', authenticateToken, async (req, res) => {
  const { session_id, question_id, answer_value } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM answers WHERE session_id = $1 AND question_id = $2',
      [session_id, question_id]
    );

    if (existing.rows.length > 0) {
      await pool.query(
        'UPDATE answers SET answer_value = $1 WHERE session_id = $2 AND question_id = $3',
        [answer_value, session_id, question_id]
      );
    } else {
      await pool.query(
        'INSERT INTO answers (session_id, question_id, answer_value) VALUES ($1, $2, $3)',
        [session_id, question_id, answer_value]
      );
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error saving answer:', err);
    res.status(500).json({ message: 'Error saving answer' });
  }
});

// Mark session as complete
router.patch('/sessions/:sessionId/complete', authenticateToken, async (req, res) => {
  const { sessionId } = req.params;

  try {
    await pool.query(
      'UPDATE sessions SET compl_status = TRUE WHERE id = $1',
      [sessionId]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error marking session complete:', err);
    res.status(500).json({ message: 'Error completing session' });
  }
});

module.exports = router;
