// ReferralForm.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ReferralForm.css';

const ReferralForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: '',
    clientName: '',
    blockNumber: '',
    doorNumber: '',
    staffName: '',
    reasons: {
      mentalHealth: false,
      sexualHealth: false,
      childProtection: false,
      domesticViolence: false,
      legal: false,
      schemesEntitlements: false,
      education: false
    },
    accomponatorName: '',
    accessedService: '',
    completedTreatment: '',
    followups: {
      followup1: '',
      followup2: '',
      followup3: '',
      followup4: '',
      followup5: ''
    }
  });

  const followupOptions = [
    'Free from Symptoms',
    'Recurrence but no treatment',
    'Recurrance and treated',
    'Attending school regularly',
    'Valid Document'
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      reasons: {
        ...prevState.reasons,
        [name]: checked
      }
    }));
  };

  const handleFollowupChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      followups: {
        ...prevState.followups,
        [name]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Referral Form Data:', formData);
    alert('Referral form submitted successfully!');
    navigate('/dashboard');
  };

  return (
    <div className="referral-container">
      <h1 className="title">South India AIDS Action Programme</h1>
      
      <div className="referral-form">
        <div className="form-header">
          <h2>Referral & Access Form</h2>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Existing form fields */}
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Client Name</label>
            <input
              type="text"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Block Number</label>
            <input
              type="text"
              name="blockNumber"
              value={formData.blockNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Door Number</label>
            <input
              type="text"
              name="doorNumber"
              value={formData.doorNumber}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Staff Name</label>
            <input
              type="text"
              name="staffName"
              value={formData.staffName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Reason</label>
            <div className="checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="mentalHealth"
                  checked={formData.reasons.mentalHealth}
                  onChange={handleCheckboxChange}
                />
                Mental Health
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="sexualHealth"
                  checked={formData.reasons.sexualHealth}
                  onChange={handleCheckboxChange}
                />
                Sexual/Reproductive Health
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="childProtection"
                  checked={formData.reasons.childProtection}
                  onChange={handleCheckboxChange}
                />
                Child Protection
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="domesticViolence"
                  checked={formData.reasons.domesticViolence}
                  onChange={handleCheckboxChange}
                />
                Domestic Violence
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="legal"
                  checked={formData.reasons.legal}
                  onChange={handleCheckboxChange}
                />
                Legal
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="schemesEntitlements"
                  checked={formData.reasons.schemesEntitlements}
                  onChange={handleCheckboxChange}
                />
                Schemes & Entitlements
              </label>
              
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="education"
                  checked={formData.reasons.education}
                  onChange={handleCheckboxChange}
                />
                Education
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Accomponator Name</label>
            <input
              type="text"
              name="accomponatorName"
              value={formData.accomponatorName}
              onChange={handleChange}
              required
            />
          </div>

          {/* New follow-up sections */}
          <div className="form-group">
            <label>Accessed Service?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="accessedService"
                  value="yes"
                  checked={formData.accessedService === 'yes'}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="accessedService"
                  value="no"
                  checked={formData.accessedService === 'no'}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Completed Treatment?</label>
            <div className="radio-group">
              <label className="radio-label">
                <input
                  type="radio"
                  name="completedTreatment"
                  value="yes"
                  checked={formData.completedTreatment === 'yes'}
                  onChange={handleChange}
                />
                Yes
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="completedTreatment"
                  value="no"
                  checked={formData.completedTreatment === 'no'}
                  onChange={handleChange}
                />
                No
              </label>
            </div>
          </div>

          <div className="followup-section">
            <h3>Follow-up Status</h3>
            
            {/* Follow-up 1 */}
            <div className="form-group">
              <label>Follow-up 1 (After 1 month)</label>
              <select
                name="followup1"
                value={formData.followups.followup1}
                onChange={handleFollowupChange}
              >
                <option value="">Select status</option>
                {followupOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Follow-up 2 */}
            <div className="form-group">
              <label>Follow-up 2 (2 months after 2nd Follow-up)</label>
              <select
                name="followup2"
                value={formData.followups.followup2}
                onChange={handleFollowupChange}
              >
                <option value="">Select status</option>
                {followupOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Follow-up 3 */}
            <div className="form-group">
              <label>Follow-up 3 (3 months after 2nd Follow-up)</label>
              <select
                name="followup3"
                value={formData.followups.followup3}
                onChange={handleFollowupChange}
              >
                <option value="">Select status</option>
                {followupOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Follow-up 4 */}
            <div className="form-group">
              <label>Follow-up 4</label>
              <select
                name="followup4"
                value={formData.followups.followup4}
                onChange={handleFollowupChange}
              >
                <option value="">Select status</option>
                {followupOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Follow-up 5 */}
            <div className="form-group">
              <label>Follow-up 5</label>
              <select
                name="followup5"
                value={formData.followups.followup5}
                onChange={handleFollowupChange}
              >
                <option value="">Select status</option>
                {followupOptions.map((option, index) => (
                  <option key={index} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="submit-btn">
            Submit Referral
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReferralForm;