const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/locations', require('./routes/locations'));
app.use('/api/children', require('./routes/children'));
app.use('/api/questions', require('./routes/questions'));
app.use('/api/sessions', require('./routes/sessions'));
app.use('/api', require('./routes/answers'));
app.use('/api/visualizations', require('./routes/visualizations'));
app.use('/api/categories', require('./routes/categories'));


// Server Startup
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
