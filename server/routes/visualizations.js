const express = require('express');
const router = express.Router();
const pool = require('../db');

const getColors = (length) => {
  const palette = [
    '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0',
    '#9966FF', '#FF9F40', '#E7E9ED', '#9CCC65',
    '#D4E157', '#FF7043', '#B39DDB', '#29B6F6'
  ];
  return Array.from({ length }, (_, i) => palette[i % palette.length]);
};

router.get('/', async (req, res) => {
  try {
    const genderRes = await pool.query(`
      SELECT gender, COUNT(*) as count
      FROM children
      GROUP BY gender
    `);

    const locationRes = await pool.query(`
      SELECT l.name, COUNT(*) as count
      FROM children c
      JOIN locations l ON c.setlocation = l.id
      GROUP BY l.name
    `);

    const sessionRes = await pool.query(`
      SELECT TO_CHAR(date, 'YYYY-MM') as month, COUNT(*) as count
      FROM sessions
      GROUP BY month
      ORDER BY month
    `);

    const categoryRes = await pool.query(`
      SELECT cat.name as category, COUNT(*) as count
      FROM answers a
      JOIN questions q ON a.question_id = q.id
      JOIN categories cat ON q.category_id = cat.id
      GROUP BY cat.name
      ORDER BY cat.name
    `);

    const engagementRes = await pool.query(`
      SELECT c.first_name || ' ' || c.last_name as name, COUNT(s.id) as session_count
      FROM children c
      LEFT JOIN sessions s ON c.id = s.child_id
      GROUP BY c.id
      ORDER BY session_count DESC
      LIMIT 10
    `);

    const ageRes = await pool.query(`
      SELECT age, COUNT(*) as count
      FROM children
      GROUP BY age
      ORDER BY age
    `);

    res.json({
      gender: {
        labels: genderRes.rows.map(row => row.gender),
        datasets: [{
          label: 'Count',
          data: genderRes.rows.map(row => parseInt(row.count)),
          backgroundColor: getColors(genderRes.rows.length)
        }]
      },
      location: {
        labels: locationRes.rows.map(row => row.name),
        datasets: [{
          label: 'Children',
          data: locationRes.rows.map(row => parseInt(row.count)),
          backgroundColor: getColors(locationRes.rows.length)
        }]
      },
      sessions: {
        labels: sessionRes.rows.map(row => row.month),
        datasets: [{
          label: 'Sessions',
          data: sessionRes.rows.map(row => parseInt(row.count)),
          borderColor: '#36A2EB',
          backgroundColor: 'rgba(54,162,235,0.4)',
          fill: true,
          tension: 0.3
        }]
      },
      category: {
        labels: categoryRes.rows.map(row => row.category),
        datasets: [{
          label: 'Answers',
          data: categoryRes.rows.map(row => parseInt(row.count)),
          backgroundColor: getColors(categoryRes.rows.length)
        }]
      },
      engagement: {
        labels: engagementRes.rows.map(row => row.name),
        datasets: [{
          label: 'Sessions',
          data: engagementRes.rows.map(row => parseInt(row.session_count)),
          backgroundColor: getColors(engagementRes.rows.length)
        }]
      },
      age: {
        labels: ageRes.rows.map(row => parseInt(row.age)),
        datasets: [{
          label: 'Children',
          data: ageRes.rows.map(row => parseInt(row.count)),
          backgroundColor: getColors(ageRes.rows.length)
        }]
      }
    });
  } catch (err) {
    console.error('Visualization error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
