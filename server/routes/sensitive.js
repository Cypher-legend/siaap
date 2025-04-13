const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.get('/admin-data', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Secret data for admins only' });
});

router.get('/user-data', authenticateToken, (req, res) => {
  res.json({ message: `Hello ${req.user.role}! Here's your data.` });
});

module.exports = router;
