require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL Connection
const postgresPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'adolescent_profile',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

if(postgresPool){
  console.log("postgre sql connected sucessfully")
}

// Staff Registration Route
app.post('/api/staff/register', async (req, res) => {
  try {
    const { 
      firstName, 
      lastName, 
      dateOfBirth, 
      email, 
      phoneNumber, 
      password 
    } = req.body;
    
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Insert staff into PostgreSQL
    const result = await postgresPool.query(
      `INSERT INTO staff 
      (phone_number, password, first_name, last_name, email, date_of_birth) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [phoneNumber, hashedPassword, firstName, lastName, email, dateOfBirth]
    );
    
    res.status(201).json({ 
      message: 'Staff registered successfully', 
      id: result.rows[0].id 
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Staff Login Route
app.post('/api/staff/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    
    // Find staff by phone number
    const result = await postgresPool.query(
      'SELECT * FROM staff WHERE phone_number = $1',
      [phoneNumber]
    );
    
    // Check if user exists
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Compare passwords
    const staff = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, staff.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      message: 'Login successful',
      staffId: staff.id,
      firstName: staff.first_name,
      lastName: staff.last_name
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(401).json({ error: error.message });
  }
});

// Server Startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  try {
    await postgresPool.end();
    console.log('Database connection closed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

module.exports = { app, postgresPool };