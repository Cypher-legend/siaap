// Dashboard.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
const role = localStorage.getItem('role');

const Dashboard = () => {
  const navigate = useNavigate();
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const handleProgramClick = () => {
    setIsProgramDropdownOpen(!isProgramDropdownOpen);
    setIsAdminDropdownOpen(false); // Close admin dropdown when program is clicked
  };

  const handleAdminClick = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
    setIsProgramDropdownOpen(false); // Close program dropdown when admin is clicked
  };

  const handleProgramOptionClick = (option) => {
    setIsProgramDropdownOpen(false);
    switch(option) {
      case 'Session Registration':
        // navigate('/session-registration'); // To be implemented
        console.log('Session Registration clicked');
        break;
      case 'Referral & Access':
        // navigate('/Referral & Access'); // To be implemented
        console.log('Referral & Access clicked');
        break;
      case 'Planner':
        navigate('/planner');
        break;
      case 'Progress':
        // navigate('/Progress'); // To be implemented
        console.log('Progress clicked');
        break;
      default:
        break;
    }
  };

  const handleAdminOptionClick = (option) => {
    setIsAdminDropdownOpen(false);
    switch(option) {
      case 'User Management':
        // navigate('/admin/users'); // To be implemented
        console.log('User Management clicked');
        break;
      case 'Reports':
        // navigate('/admin/reports'); // To be implemented
        console.log('Reports clicked');
        break;
      case 'Settings':
        // navigate('/admin/settings'); // To be implemented
        console.log('Settings clicked');
        break;
      case 'Attendance Records':
        // navigate('/admin/attendance'); // To be implemented
        console.log('Attendance Records clicked');
        break;
      case 'Leave':
        // navigate('/admin/Leave'); // To be implemented
        console.log('Leave clicked');
        break;
      case 'Compensatory Work':
        // navigate('/admin/compensatory'); // To be implemented
        console.log('Compensatory Work clicked');
        break;
      default:
        break;
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
                  onClick={() => handleProgramOptionClick('Session Registration')}
                >
                  Session Registration
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleProgramOptionClick('Referral & Access')}
                >
                  Referral & Access
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleProgramOptionClick('Planner')}
                >
                  Planner
                </button>
                <button 
                  className="dropdown-item"
                  onClick={() => handleProgramOptionClick('Progress')}
                >
                  Progress
                </button>
              </div>
            )}
          </div>

          {/* Admin Section */}
          {role && role === 'admin' && (
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
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionClick('Reports')}
                  >
                    Reports
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionClick('Settings')}
                  >
                    Settings
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionClick('Attendance Records')}
                  >
                    Attendance Records
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionClick('Leave')}
                  >
                    Leave
                  </button>
                  <button 
                    className="dropdown-item"
                    onClick={() => handleAdminOptionClick('Compensatory Work')}
                  >
                    Compensatory Work
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="main-content">
          <div className="welcome-message">
            <h2>Welcome to SIAAP Dashboard</h2>
            <p>Please select a program or admin option from the sidebar to get started.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;