// Required packages:
// npm install pg dotenv express

const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// Create express app
const app = express();
app.use(express.json());

// Set up PostgreSQL connection pool
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'adolescent_profile',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// Test database connection
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('Database connection error:', err);
  } else {
    console.log('Database connected successfully at:', res.rows[0].now);
  }
});

// Staff route - login
app.post('/api/staff/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    
    const result = await pool.query(
      'SELECT * FROM staff WHERE phone_number = $1 AND password = $2',
      [phoneNumber, password]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ message: 'Login successful' }); 
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Staff route - register
app.post('/api/staff/register', async (req, res) => {
  try {
    const { phoneNumber, password, firstName, lastName } = req.body;
    
    const result = await pool.query(
      'INSERT INTO staff (phone_number, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [phoneNumber, password, firstName, lastName]
    );
    
    res.status(201).json({ message: 'Staff registered successfully', id: result.rows[0].id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Children routes

// Get all children (with complete profile information)
app.get('/api/children', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM child_profiles');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching children:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get child by ID
app.get('/api/children/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM child_profiles WHERE id = $1',
      [id]``  
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    // Get medical history for this child
    const medicalHistory = await pool.query(
      'SELECT * FROM medical_history WHERE child_id = $1 ORDER BY diagnosis_date DESC',
      [id]
    );
    
    const childData = {
      ...result.rows[0],
      medicalHistory: medicalHistory.rows
    };
    
    res.json(childData);
  } catch (error) {
    console.error('Error fetching child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create a new child
app.post('/api/children', async (req, res) => {
  try {
    const {
      firstName, lastName, dateOfBirth, healthStatus, gender,
      blockNumber,
      emergencyContact: { name, relationship, phoneNumber }
    } = req.body;
    
    // Use the database function to add a child
    const result = await pool.query(
      'SELECT add_child($1, $2, $3, $4, $5, $6, $7, $8, $9) AS child_id',
      [
        firstName, lastName, dateOfBirth, healthStatus, gender,
        blockNumber,
        name, relationship, phoneNumber
      ]
    );
    
    const childId = result.rows[0].child_id;
    
    // Get the complete child data to return
    const childResult = await pool.query(
      'SELECT * FROM child_profiles WHERE id = $1',
      [childId]
    );
    
    res.status(201).json(childResult.rows[0]);
  } catch (error) {
    console.error('Error creating child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a child's health status
app.put('/api/children/:id/health-status', async (req, res) => {
  try {
    const { id } = req.params;
    const { healthStatus } = req.body;
    
    const result = await pool.query(
      'SELECT update_health_status($1, $2) AS updated',
      [id, healthStatus]
    );
    
    if (!result.rows[0].updated) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    res.json({ message: 'Health status updated successfully' });
  } catch (error) {
    console.error('Error updating health status:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add medical history to a child
app.post('/api/children/:id/medical-history', async (req, res) => {
  try {
    const { id } = req.params;
    const { condition, diagnosisDate, notes } = req.body;
    
    const result = await pool.query(
      'SELECT add_medical_history($1, $2, $3, $4) AS record_id',
      [id, condition, diagnosisDate, notes]
    );
    
    // Get the inserted record
    const recordId = result.rows[0].record_id;
    const recordResult = await pool.query(
      'SELECT * FROM medical_history WHERE id = $1',
      [recordId]
    );
    
    res.status(201).json(recordResult.rows[0]);
  } catch (error) {
    console.error('Error adding medical history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update a child's block number
app.put('/api/children/:id/block', async (req, res) => {
  try {
    const { id } = req.params;
    const { blockNumber } = req.body;
    
    const result = await pool.query(
      'SELECT update_child_block($1, $2) AS updated',
      [id, blockNumber]
    );
    
    if (!result.rows[0].updated) {
      return res.status(404).json({ message: 'Child not found' });
    }
    
    res.json({ message: 'Block number updated successfully' });
  } catch (error) {
    console.error('Error updating block number:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get children by age
app.get('/api/children/age/:age', async (req, res) => {
  try {
    const { age } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM child_profiles WHERE age = $1',
      [age]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching children by age:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Add these routes to your existing server.js file

// Get all question categories
app.get('/api/question-categories', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM question_categories ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching question categories:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get questions by category
app.get('/api/questions/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM questions WHERE category_id = $1 AND is_active = TRUE ORDER BY id',
      [categoryId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions by category:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get age-appropriate questions for a specific child
app.get('/api/children/:childId/questions', async (req, res) => {
  try {
    const { childId } = req.params;
    const { categoryId } = req.query;
    
    const result = await pool.query(
      'SELECT * FROM get_questions_for_child($1, $2)',
      [childId, categoryId || null]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching questions for child:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Start a new assessment session
app.post('/api/assessment-sessions', async (req, res) => {
  try {
    const { childId, staffId, notes } = req.body;
    
    const result = await pool.query(
      'SELECT start_assessment_session($1, $2, $3) AS session_id',
      [childId, staffId, notes]
    );
    
    const sessionId = result.rows[0].session_id;
    
    res.status(201).json({ 
      message: 'Assessment session started successfully', 
      sessionId 
    });
  } catch (error) {
    console.error('Error starting assessment session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Record a response
app.post('/api/responses', async (req, res) => {
  try {
    const { 
      childId, 
      questionId, 
      response, 
      staffId, 
      sessionId,
      notes 
    } = req.body;
    
    const result = await pool.query(
      'SELECT add_response($1, $2, $3, $4, $5, $6) AS response_id',
      [childId, questionId, response, staffId, sessionId || null, notes]
    );
    
    const responseId = result.rows[0].response_id;
    
    res.status(201).json({ 
      message: 'Response recorded successfully', 
      responseId 
    });
  } catch (error) {
    console.error('Error recording response:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Complete an assessment session
app.put('/api/assessment-sessions/:sessionId/complete', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { notes } = req.body;
    
    const result = await pool.query(
      'SELECT complete_assessment_session($1, $2) AS completed',
      [sessionId, notes]
    );
    
    if (!result.rows[0].completed) {
      return res.status(404).json({ message: 'Assessment session not found' });
    }
    
    res.json({ message: 'Assessment session completed successfully' });
  } catch (error) {
    console.error('Error completing assessment session:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get assessment summary for a child
app.get('/api/children/:childId/assessment-summary', async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM get_child_assessment_summary($1)',
      [childId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assessment summary:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all responses for a child
app.get('/api/children/:childId/responses', async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM child_responses WHERE child_id = $1 ORDER BY category_name, response_date DESC',
      [childId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching child responses:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all assessment sessions for a child
app.get('/api/children/:childId/assessment-sessions', async (req, res) => {
  try {
    const { childId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM assessment_session_details WHERE child_id = $1 ORDER BY session_date DESC',
      [childId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching assessment sessions:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get session details with questions and responses
app.get('/api/assessment-sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    
    // Get session details
    const sessionResult = await pool.query(
      'SELECT * FROM assessment_session_details WHERE session_id = $1',
      [sessionId]
    );
    
    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ message: 'Assessment session not found' });
    }
    
    // Get questions and responses for this session
    const questionsResult = await pool.query(`
      SELECT 
        sq.order_number,
        q.id AS question_id,
        q.question_text,
        qc.id AS category_id,
        qc.name AS category_name,
        r.response,
        r.notes
      FROM 
        session_questions sq
      JOIN 
        questions q ON sq.question_id = q.id
      JOIN 
        question_categories qc ON q.category_id = qc.id
      LEFT JOIN 
        responses r ON sq.response_id = r.id
      WHERE 
        sq.session_id = $1
      ORDER BY 
        sq.order_number
    `, [sessionId]);
    
    // Combine results
    const sessionData = {
      ...sessionResult.rows[0],
      questions: questionsResult.rows
    };
    
    res.json(sessionData);
  } catch (error) {
    console.error('Error fetching session details:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Server startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));