require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Database Configuration
const DB_TYPE = process.env.DB_TYPE || 'postgresql'; // default to PostgreSQL

// PostgreSQL Connection
const postgresPool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'adolescent_profile',
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

if(postgresPool){
  console.log("postgre sql connect sucessfully")
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/adolescent_profile')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Mongoose Schemas
const StaffSchema = new mongoose.Schema({
  phoneNumber: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: String,
  lastName: String
});

const Staff = mongoose.model('Staff', StaffSchema);

// PostgreSQL Staff Registration
async function registerStaffPostgres(phoneNumber, password, firstName, lastName) {
  try {
    const result = await postgresPool.query(
      'INSERT INTO staff (phone_number, password, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id',
      [phoneNumber, password, firstName, lastName]
    );
    
    return result.rows[0].id;
  } catch (error) {
    throw error;
  }
}

// PostgreSQL Staff Login
async function loginStaffPostgres(phoneNumber, password) {
  try {
    const result = await postgresPool.query(
      'SELECT * FROM staff WHERE phone_number = $1 AND password = $2',
      [phoneNumber, password]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    throw error;
  }
}

// Staff Registration Route
app.post('/api/staff/register', async (req, res) => {
  try {
    const { phoneNumber, password, firstName, lastName } = req.body;
    
    // Choose database based on environment variable
    if (DB_TYPE === 'postgresql') {
      const staffId = await registerStaffPostgres(phoneNumber, password, firstName, lastName);
      res.status(201).json({ 
        message: 'Staff registered successfully', 
        id: staffId 
      });
    } else {
      // MongoDB registration
      const staff = new Staff(req.body);
      await staff.save();
      res.status(201).json({ message: 'Staff registered successfully' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Staff Login Route
app.post('/api/staff/login', async (req, res) => {
  try {
    const { phoneNumber, password } = req.body;
    
    // Choose database based on environment variable
    if (DB_TYPE === 'postgresql') {
      const loginSuccessful = await loginStaffPostgres(phoneNumber, password);
      if (!loginSuccessful) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      res.json({ message: 'Login successful' });
    } else {
      // MongoDB login
      const staff = await Staff.findOne({ 
        phoneNumber: phoneNumber,
        password: password 
      });
      
      if (!staff) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      
      res.json({ message: 'Login successful' });
    }
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Additional PostgreSQL Routes (from previous implementation)
// You can add more routes following a similar pattern of checking DB_TYPE

// Children Routes Example
app.get('/api/children', async (req, res) => {
  try {
    if (DB_TYPE === 'postgresql') {
      const result = await postgresPool.query('SELECT * FROM children');
      res.json(result.rows);
    } else {
      // Add MongoDB equivalent if needed
      res.status(501).json({ error: 'Not implemented for MongoDB' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Error Handling for PostgreSQL Pool
postgresPool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err);
});

// Server Startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Using ${DB_TYPE.toUpperCase()} as database`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  try {
    await postgresPool.end();
    await mongoose.connection.close();
    console.log('Database connections closed');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});

module.exports = { app, postgresPool, Staff };