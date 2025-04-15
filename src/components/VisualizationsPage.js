import React, { useEffect, useState } from 'react';
import { Pie, Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title,
} from 'chart.js';
import './VisualizationsPage.css';

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Title
);

const VisualizationsPage = () => {
  const [charts, setCharts] = useState({});

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const res = await fetch('/api/visualizations');
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          setCharts(data);
        } catch (jsonErr) {
          console.error("❌ Failed to fetch visualizations: Expected JSON, received:", text);
        }
      } catch (err) {
        console.error('❌ Fetch error:', err);
      }
    };

    fetchCharts();
  }, []);

  const renderChart = (type, title, data, hideLegend = false, integerYAxis = false, fullWidth = false) => {
    if (!data || !data.labels || data.labels.length === 0) {
      return (
        <div className="chart-box">
          <h3>{title}</h3>
          <p>No Data Available</p>
        </div>
      );
    }

    const chartProps = {
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: hideLegend ? { display: false } : { position: 'bottom' },
          title: { display: true, text: title }
        },
        scales: integerYAxis
          ? {
              y: {
                ticks: {
                  callback: function(value) {
                    return Number.isInteger(value) ? value : '';
                  }
                }
              }
            }
          : {}
      }
    };

    return (
      <div className={`chart-box ${fullWidth ? 'full-width' : ''}`}>
        {type === 'pie' && <Pie {...chartProps} />}
        {type === 'bar' && <Bar {...chartProps} />}
        {type === 'line' && <Line {...chartProps} />}
      </div>
    );
  };

  return (
    <div className="visualizations-container">
      <h2>General Visualizations</h2>
      <div className="chart-row">
        {renderChart('pie', 'Gender Distribution', charts.gender)}
        {renderChart('bar', 'Children by Location', charts.location, true, false, true)}
        {renderChart('line', 'Sessions Over Time', charts.sessions)}
      </div>

      <h2>Advanced Visualizations</h2>
      <div className="chart-row">
        {renderChart('bar', 'Answers by Category', charts.category, true)}
        {renderChart('bar', 'Child Engagement', charts.engagement, true)}
        {renderChart('bar', 'Age Distribution', charts.age, true, true)}
      </div>
    </div>
  );
};

export default VisualizationsPage;
