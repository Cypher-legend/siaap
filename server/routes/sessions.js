const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Get children in user's setlocation
router.get('/children', authenticateToken, async (req, res) => {
  try {
    const { setlocation } = req.user;
    const childrenQuery = setlocation === 0
      ? 'SELECT * FROM children ORDER BY first_name'
      : 'SELECT * FROM children WHERE setlocation = $1 ORDER BY first_name';
    
    const result = await pool.query(childrenQuery, setlocation === 0 ? [] : [setlocation]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching children' });
  }
});

// Create a new session for a child
router.post('/', authenticateToken, async (req, res) => {
  const { child_id, date, notes } = req.body;

  try {
    // Get the current session count for the child
    const countResult = await pool.query(
      'SELECT COUNT(*) FROM sessions WHERE child_id = $1',
      [child_id]
    );
    const sessionNum = parseInt(countResult.rows[0].count) + 1;

    // Insert new session
    await pool.query(
      'INSERT INTO sessions (child_id, date, notes, child_session_num) VALUES ($1, $2, $3, $4)',
      [child_id, date, notes, sessionNum]
    );

    // Get child info for confirmation message
    console.log("Creating session for child_id:", child_id);
    const childInfo = await pool.query('SELECT first_name, last_name FROM children WHERE id = $1', [child_id]);

    if (childInfo.rows.length === 0) {
        return res.status(404).json({ message: 'Child not found' });
      }

    const { first_name, last_name } = childInfo.rows[0];

    res.json({ sessionNum, name: `${first_name} ${last_name}`, date });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ message: 'Could not create session' });
  }
});

module.exports = router;
