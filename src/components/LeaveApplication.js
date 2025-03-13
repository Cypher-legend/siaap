// LeaveApplication.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LeaveApplication.css';

const LeaveApplication = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    leaveType: '',
    isHalfDay: false,
    numberOfDays: '',
    fromDate: '',
    toDate: '',
    leaveCategory: ''
  });

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    
    if (name === 'isHalfDay') {
      setFormData(prev => ({
        ...prev,
        isHalfDay: checked,
        numberOfDays: checked ? '' : prev.numberOfDays
      }));
    } else if (name === 'numberOfDays') {
      const numDays = value === '' ? '' : parseFloat(value);
      setFormData(prev => ({
        ...prev,
        [name]: numDays,
        isHalfDay: false
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Leave Application Data:', formData);
    alert('Leave application submitted successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="leave-container">
      <h1 className="title">South India AIDS Action Programme</h1>
      
      <div className="leave-form">
        <div className="form-header">
          <h2>Leave Application</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Duration</label>
            <div className="duration-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="isHalfDay"
                  checked={formData.isHalfDay}
                  onChange={handleChange}
                  disabled={formData.numberOfDays !== ''}
                />
                Half Day
              </label>
              
              <div className="number-input">
                <label>Number of Days:</label>
                <input
                  type="number"
                  name="numberOfDays"
                  value={formData.numberOfDays}
                  onChange={handleChange}
                  min="1"
                  step="1"
                  disabled={formData.isHalfDay}
                  placeholder="Enter number of days"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Date(s) of Leave</label>
            {formData.numberOfDays > 1 ? (
              <div className="date-range">
                <div className="date-input">
                  <label>From:</label>
                  <input
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="date-input">
                  <label>To:</label>
                  <input
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            ) : (
              <input
                type="date"
                name="fromDate"
                value={formData.fromDate}
                onChange={handleChange}
                required
              />
            )}
          </div>

          <div className="form-group">
            <label>Type of Leave</label>
            <select
              name="leaveCategory"
              value={formData.leaveCategory}
              onChange={handleChange}
              required
            >
              <option value="">Select leave type</option>
              <option value="cl">CL</option>
              <option value="sl">SL</option>
              <option value="compoff">Comp. Off</option>
              <option value="festival">Festival</option>
            </select>
          </div>

          <button type="submit" className="submit-btn">
            Submit Application
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeaveApplication;