// server/routes/children.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// Helper function to calculate age from DOB
const calculateAge = (dob) => {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// GET all children (filtered by user's setlocation)
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

// GET specific child by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM children WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Child not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching child:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT update child
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, dob, gender, setlocation } = req.body;

    if (setlocation === 0) {
      return res.status(400).json({ message: 'Invalid location. Cannot assign "All" as a setlocation.' });
    }

    const age = calculateAge(dob);

    await pool.query(
      'UPDATE children SET first_name=$1, last_name=$2, dob=$3, age=$4, gender=$5, setlocation=$6 WHERE id=$7',
      [first_name, last_name, dob, age, gender, setlocation, id]
    );

    res.json({ message: 'Child updated' });
  } catch (err) {
    console.error('Error updating child:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE child (cascade will remove sessions and answers)
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM children WHERE id = $1', [id]);
    res.json({ message: 'Child deleted' });
  } catch (err) {
    console.error('Error deleting child:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// POST create new child
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { first_name, last_name, dob, gender, setlocation } = req.body;
    if (setlocation === 0) {
      return res.status(400).json({ message: 'Invalid location. Cannot assign "All" as a setlocation.' });
    }
    const age = calculateAge(dob);

    const result = await pool.query(
      'INSERT INTO children (first_name, last_name, dob, age, gender, setlocation) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [first_name, last_name, dob, age, gender, setlocation]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating child:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
