// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';
import { jwtDecode } from 'jwt-decode';

const LoginPage = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      const res = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobileNumber, password }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        alert(data.message || 'Login failed');
        return;
      }
  
      // Store JWT token
      const token = data.token;
      localStorage.setItem('token', token);
  
      // Decode token to get role and store it too
      const decoded = jwtDecode(token);
      localStorage.setItem('role', decoded.role);  // e.g. 'admin' or 'user'
  
      // Continue as normal
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed. Please try again.');
    }
  };
  return (
    <div className="login-container">
      <h1 className="title">South India AIDS Action Programme</h1>
      
      <div className="login-form">
        <div className="login-header">
          <h2>Log In</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Mobile #</label>
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="sign-in-btn">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;