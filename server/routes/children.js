const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, async (req, res) => {
    try {
      const userLocation = req.user.setlocation;
  
      const query = userLocation === 0
        ? 'SELECT * FROM children ORDER BY id'
        : 'SELECT * FROM children WHERE setlocation = $1 ORDER BY id';
  
      const result = userLocation === 0
        ? await pool.query(query)
        : await pool.query(query, [userLocation]);
  
      res.json(result.rows);
    } catch (err) {
      console.error('Error fetching children:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });

module.exports = router; // ✅ this is the key line!
