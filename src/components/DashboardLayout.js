// src/components/DashboardLayout.js
import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import './Dashboard.css';

const DashboardLayout = () => {
  const role = localStorage.getItem('role');
  const navigate = useNavigate();
  const [isProgramDropdownOpen, setIsProgramDropdownOpen] = useState(false);
  const [isAdminDropdownOpen, setIsAdminDropdownOpen] = useState(false);

  const handleProgramClick = () => {
    setIsProgramDropdownOpen(!isProgramDropdownOpen);
    setIsAdminDropdownOpen(false);
  };

  const handleAdminClick = () => {
    setIsAdminDropdownOpen(!isAdminDropdownOpen);
    setIsProgramDropdownOpen(false);
  };

  return (
    <div className="dashboard-container">
      <h1 className="title">South India AIDS Action Programme</h1>
      <div className="dashboard-content">
        <div className="sidebar">
          <div className="dropdown-container">
            <button className="dropdown-button" onClick={handleProgramClick}>
              Program {isProgramDropdownOpen ? '▼' : '▶'}
            </button>
            {isProgramDropdownOpen && (
              <div className="dropdown-content">
                <button className="dropdown-item" onClick={() => navigate('/planner')}>
                  Planner
                </button>
                <button className="dropdown-item" onClick={() => navigate('/program/children')}>
                  Children
                </button>
              </div>
            )}
          </div>

          {role === 'admin' && (
            <div className="dropdown-container admin-section">
              <button className="dropdown-button" onClick={handleAdminClick}>
                Admin {isAdminDropdownOpen ? '▼' : '▶'}
              </button>
              {isAdminDropdownOpen && (
                <div className="dropdown-content">
                  <button className="dropdown-item" onClick={() => navigate('/admin/users')}>
                    User Management
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
