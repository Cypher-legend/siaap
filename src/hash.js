const bcrypt = require('bcrypt');

const password = 'pass';
const saltRounds = 10;

bcrypt.hash(password, saltRounds)
  .then(hash => {
    console.log('Hashed password:', hash);
  })
  .catch(err => {
    console.error('Error hashing password:', err);
  });