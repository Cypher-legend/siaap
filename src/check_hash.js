const bcrypt = require('bcrypt');

const enteredPassword = 'mysecurepassword'; // what user types
const storedHash = '$2b$10$atzuPUmEv7T4HgDBuc52neHeSab8ZVoejbIw2oXCNcxWt7s5SDG2G'; // from DB

bcrypt.compare(enteredPassword, storedHash)
  .then(result => {
    if (result) {
      console.log('✅ Password is correct!');
    } else {
      console.log('❌ Password is incorrect.');
    }
  })
  .catch(err => {
    console.error('Error comparing passwords:', err);
  });