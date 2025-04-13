// Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();

  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const handleProgramClick = () => {
    setIsProgramDropdownOpen(!isProgramDropdownOpen);
    setIsAdminDropdownOpen(false); // Close admin when program opens
  };

  const handleAdminClick = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
    setIsProgramDropdownOpen(false); // Close program when admin opens
  };

  const handleProgramOptionClick = (option) => {
    setIsProgramDropdownOpen(false);
    if (option === 'Planner') {
      navigate('/planner');
    }
  };

  const handleAdminOptionClick = (option) => {
    setIsAdminDropdownOpen(false);
    if (option === 'User Management') {
      navigate('/admin/users');
    }
  };

  return (
    <div className="dashboard-container">
      <h1 className="title">South India AIDS Action Programme</h1>
      
      <div className="dashboard-content">
        <div className="sidebar">
          {/* Program Section */}
          <div className="dropdown-container">
            <button 
              className="dropdown-button"
              onClick={handleProgramClick}
            >
              Program {isProgramDropdownOpen ? '▼' : '▶'}
            </button>

            {isProgramDropdownOpen && (
              <div className="dropdown-content">
                <button 
                  className="dropdown-item"
                  onClick={() => handleProgramOptionClick('Planner')}
                >
                  Planner
                </button>
              </div>
            )}
          </div>

          {/* Admin Section */}
          {role === 'admin' && (
            <div className="dropdown-container admin-section">
              <button 
                className="dropdown-button"
                onClick={handleAdminClick}
              >
                Admin {isAdminDropdownOpen ? '▼' : '▶'}
              </button>

              {isAdminDropdownOpen && (
                <div className="dropdown-content">
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionClick('User Management')}
                  >
                    User Management
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="main-content">
          <div className="welcome-message">
            <h2>Welcome to SIAAP Dashboard</h2>
            <p>{role === 'admin' ? 'Manage users from the admin panel or open the planner.' : 'Use the Program menu to access Planner.'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
