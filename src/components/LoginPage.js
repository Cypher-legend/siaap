// LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Here you would typically make an API call to authenticate the user
      console.log('Login attempted:', { mobileNumber, password });
      
      // For now, we'll just simulate a successful login
      alert('Login successful!');
      
      // Navigate to dashboard
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
          
          <button 
            type="button" 
            className="register-btn" 
            onClick={() => navigate('/register')}
          >
            New User Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;