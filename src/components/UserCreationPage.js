import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './UserCreationPage.css';

const UserCreationPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [setLocation, setSetLocation] = useState(0);
  const [locations, setLocations] = useState([]);

  // 🔄 Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/locations', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLocations(data);
      } catch (err) {
        console.error('Failed to fetch locations:', err);
      }
    };

    fetchLocations();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          mobileNumber,
          password,
          role,
          firstName,
          lastName,
          setlocation: setLocation,
        }),
      });

      const data = await res.json();

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
        <label>First Name:</label>
        <input
          type="text"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />

        <label>Last Name:</label>
        <input
          type="text"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />

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

        <label>Location:</label>
        <select value={setLocation} onChange={(e) => setSetLocation(parseInt(e.target.value))}>
          {locations.map(loc => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>

        <button type="submit">Create User</button>
      </form>
    </div>
  );
};

export default UserCreationPage;
