// routes/locations.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
const { authenticateToken } = require('../middleware/auth');

// GET all locations
router.get('/', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name FROM locations ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching locations' });
  }
});

// ✅ PUT update location
router.put('/:id', authenticateToken, async (req, res) => {
  const locationId = parseInt(req.params.id);
  const { name } = req.body;

  if (locationId === 0) {
    return res.status(400).json({ message: 'Cannot edit the "All" location.' });
  }

  try {
    await pool.query('UPDATE locations SET name = $1 WHERE id = $2', [name, locationId]);
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ message: 'Failed to update location' });
  }
});

// ✅ DELETE a location
router.delete('/:id', authenticateToken, async (req, res) => {
  const locationId = parseInt(req.params.id);

  if (locationId === 0) {
    return res.status(400).json({ message: 'Cannot delete the "All" location.' });
  }

  try {
    await pool.query('DELETE FROM locations WHERE id = $1', [locationId]);
    res.status(200).json({ message: 'Location deleted successfully' });
  } catch (err) {
    console.error('Error deleting location:', err);
    res.status(500).json({ message: 'Failed to delete location' });
  }
});

// ✅ Add this after the existing routes
router.post('/', authenticateToken, async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    return res.status(400).json({ message: 'Location name is required.' });
  }

  if (name.toLowerCase() === 'all') {
    return res.status(400).json({ message: 'You cannot manually add a location named "All".' });
  }

  try {
    const result = await pool.query(
      'INSERT INTO locations (name) VALUES ($1) RETURNING *',
      [name.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating location:', err);
    res.status(500).json({ message: 'Failed to create location.' });
  }
});

module.exports = router;
