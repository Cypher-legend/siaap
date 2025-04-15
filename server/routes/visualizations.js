// server/routes/visualizations.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET /api/visualizations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const childrenByLocation = await pool.query(`
      SELECT setlocation, COUNT(*) as count
      FROM children
      GROUP BY setlocation
      ORDER BY setlocation
    `);

    const answerDistribution = await pool.query(`
      SELECT answer_value, COUNT(*) as count
      FROM answers
      GROUP BY answer_value
      ORDER BY answer_value
    `);

    const sessionsPerMonth = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') as month, COUNT(*) as count
      FROM sessions
      GROUP BY month
      ORDER BY month
    `);

    res.json({
      childrenByLocation: childrenByLocation.rows,
      answerDistribution: answerDistribution.rows,
      sessionsPerMonth: sessionsPerMonth.rows
    });
  } catch (err) {
    console.error('Error fetching visualization data:', err);
    res.status(500).json({ message: 'Server error while fetching visualizations' });
  }
});

module.exports = router;
