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

// Get sessions for a child
router.get('/:childId', authenticateToken, async (req, res) => {
  const { childId } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM sessions WHERE child_id = $1 ORDER BY date ASC',
      [childId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching sessions' });
  }
});

// Create a new session
router.post('/', authenticateToken, async (req, res) => {
  const { child_id, date, notes } = req.body;

  try {
    // 1. Get all existing sessions for this child, ordered by date
    const sessionsResult = await pool.query(
      'SELECT id, date FROM sessions WHERE child_id = $1 ORDER BY date ASC',
      [child_id]
    );

    // 2. Determine position for the new session
    let newIndex = sessionsResult.rows.findIndex(s => new Date(date) < new Date(s.date));
    if (newIndex === -1) newIndex = sessionsResult.rows.length;

    // 3. Insert new session and get its id
    const insertResult = await pool.query(
      'INSERT INTO sessions (child_id, date, notes) VALUES ($1, $2, $3) RETURNING id',
      [child_id, date, notes]
    );
    const newSessionId = insertResult.rows[0].id;

    // 4. Re-query including the new session
    const allSessions = await pool.query(
      'SELECT id, date FROM sessions WHERE child_id = $1 ORDER BY date ASC',
      [child_id]
    );

    // 5. Reassign child_session_num based on sorted order
    for (let i = 0; i < allSessions.rows.length; i++) {
      await pool.query(
        'UPDATE sessions SET child_session_num = $1 WHERE id = $2',
        [i + 1, allSessions.rows[i].id]
      );
    }

    // 6. Get session number and child name
    const { rows: sessionNumRow } = await pool.query(
      'SELECT child_session_num FROM sessions WHERE id = $1',
      [newSessionId]
    );
    const sessionNum = sessionNumRow[0].child_session_num;

    const { rows: childInfo } = await pool.query(
      'SELECT first_name, last_name FROM children WHERE id = $1',
      [child_id]
    );
    const { first_name, last_name } = childInfo[0];

    res.json({ sessionNum, name: `${first_name} ${last_name}`, date });
  } catch (err) {
    console.error('Error creating session:', err);
    res.status(500).json({ message: 'Could not create session' });
  }
});

module.exports = router;
