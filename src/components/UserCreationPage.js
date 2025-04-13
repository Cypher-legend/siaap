import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCreationPage.css';

const UserCreationPage = () => {
  const navigate = useNavigate();

  // ✅ Form state
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const token = localStorage.getItem('token'); // ✅ Retrieve JWT from localStorage

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`, // ✅ Include token
        },
        body: JSON.stringify({ mobileNumber, password, role }),
      });

      // ✅ Try to parse JSON response safely
      let data;
      try {
        data = await res.json();
      } catch (err) {
        throw new Error(`Server response is not JSON (status: ${res.status})`);
      }

      if (res.ok) {
        alert('User created successfully!');
        navigate('/dashboard');
      } else if (res.status === 400 && data.message === 'Mobile number already exists') {
        alert('Mobile number already exists.');
      } else {
        alert(data.message || 'Unable to create new user.');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      alert('Something went wrong. Please try again.');
    }
  };

  return (
    <div className="user-creation-container">
      <h2>Create New User</h2>
      <form onSubmit={handleSubmit} className="user-form">
        <label>Mobile Number:</label>
        <input
          type="tel"
          value={mobileNumber}
          onChange={(e) => setMobileNumber(e.target.value)}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <label>Role:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>

        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default UserCreationPage;
