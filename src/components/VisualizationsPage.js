// src/components/Visualizations.js
import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import './VisualizationsPage.css';

const Visualizations = () => {
  const [genderData, setGenderData] = useState({});
  const [locationData, setLocationData] = useState({});
  const [sessionsData, setSessionsData] = useState({});
  const [categoryData, setCategoryData] = useState({});
  const [engagementData, setEngagementData] = useState({});
  const [ageData, setAgeData] = useState({});

  useEffect(() => {
    fetch('/api/visualizations/gender')
      .then(res => res.json())
      .then(data => setGenderData(data));

    fetch('/api/visualizations/location')
      .then(res => res.json())
      .then(data => setLocationData(data));

    fetch('/api/visualizations/sessions')
      .then(res => res.json())
      .then(data => setSessionsData(data));

    fetch('/api/visualizations/category')
      .then(res => res.json())
      .then(data => setCategoryData(data));

    fetch('/api/visualizations/engagement')
      .then(res => res.json())
      .then(data => setEngagementData(data));

    fetch('/api/visualizations/age')
      .then(res => res.json())
      .then(data => setAgeData(data));
  }, []);

  return (
    <div className="visualizations-container">
      <h2>General Visualizations</h2>
      <div className="chart-row">
        <div className="chart-box">
          <h3>Gender Distribution</h3>
          <Pie data={genderData} />
        </div>
        <div className="chart-box">
          <h3>Children by Location</h3>
          <Bar data={locationData} />
        </div>
        <div className="chart-box">
          <h3>Sessions Over Time</h3>
          <Line data={sessionsData} />
        </div>
      </div>

      <h2>Advanced Visualizations</h2>
      <div className="chart-row">
        <div className="chart-box">
          <h3>Answers by Category</h3>
          <Bar data={categoryData} />
        </div>
        <div className="chart-box">
          <h3>Child Engagement</h3>
          <Bar data={engagementData} />
        </div>
        <div className="chart-box">
          <h3>Age Distribution</h3>
          <Bar data={ageData} />
        </div>
      </div>
    </div>
  );
};

export default Visualizations;
