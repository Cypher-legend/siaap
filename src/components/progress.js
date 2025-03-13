// progress.js
import React, { useState, useEffect } from 'react';
import './progress.css';

const Progress = () => {
  const [activities, setActivities] = useState(() => {
    const savedActivities = localStorage.getItem('progressActivities');
    return savedActivities ? JSON.parse(savedActivities) : {
      planned: [],
      unplanned: []
    };
  });
  
  const [showModal, setShowModal] = useState(false);
  const [newActivity, setNewActivity] = useState({
    type: 'unplanned', // Default and only option now
    task: '',
    targetsAchieved: '',
    date: new Date().toISOString().split('T')[0]
  });

  // Save activities to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('progressActivities', JSON.stringify(activities));
  }, [activities]);

  // Load and sync planner tasks on component mount and when localStorage changes
  useEffect(() => {
    const syncPlannerTasks = () => {
      const plannerTasks = localStorage.getItem('plannerTasks');
      if (plannerTasks) {
        const tasks = JSON.parse(plannerTasks);
        
        const plannedActivities = [];
        Object.entries(tasks).forEach(([date, taskList]) => {
          if (Array.isArray(taskList)) {
            taskList.forEach(taskItem => {
              const task = typeof taskItem === 'object' ? taskItem.task : taskItem;
              plannedActivities.push({
                task,
                date,
                targetsAchieved: '0',
                id: `${date}-${task}`.replace(/\s+/g, '-')
              });
            });
          }
        });

        // Update only the planned activities, keep unplanned as is
        setActivities(prev => ({
          ...prev,
          planned: plannedActivities
        }));
      }
    };

    syncPlannerTasks();

    // Add event listener for storage changes
    const handleStorageChange = (e) => {
      if (e.key === 'plannerTasks') {
        syncPlannerTasks();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewActivity(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTargetsAchievedUpdate = (type, id, value) => {
    setActivities(prev => ({
      ...prev,
      [type]: prev[type].map(activity =>
        activity.id === id ? { ...activity, targetsAchieved: value } : activity
      )
    }));
  };

  const handleAddActivity = () => {
    if (newActivity.task.trim()) {
      setActivities(prev => ({
        ...prev,
        unplanned: [...prev.unplanned, {
          ...newActivity,
          id: Date.now() + Math.random()
        }]
      }));
      setNewActivity({
        type: 'unplanned',
        task: '',
        targetsAchieved: '',
        date: new Date().toISOString().split('T')[0]
      });
      setShowModal(false);
    }
  };

  const ActivityTable = ({ type, activities }) => (
    <div className="activity-section">
      <h3>{type === 'planned' ? 'Planned Activities' : 'Unplanned Activities'}</h3>
      <table className="activity-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Task</th>
            {type === 'planned' && <th>Target</th>}
            <th>Number of Targets Achieved</th>
          </tr>
        </thead>
        <tbody>
          {activities.map(activity => (
            <tr key={activity.id}>
              <td>{new Date(activity.date).toLocaleDateString()}</td>
              <td>{activity.task}</td>
              {type === 'planned' && (
                <td>{activity.target || '0'}</td>
              )}
              <td>
                <input
                  type="number"
                  value={activity.targetsAchieved}
                  onChange={(e) => handleTargetsAchievedUpdate(type, activity.id, e.target.value)}
                  placeholder="Enter number"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="progress-container">
      <h1 className="title">South India AIDS Action Programme</h1>
      
      <div className="progress-content">
        <div className="header-actions">
          <h2>Progress Tracking</h2>
        </div>

        <ActivityTable type="planned" activities={activities.planned} />
        
        <div className="unplanned-section-header">
          <h3>Unplanned Activities</h3>
          <button 
            className="add-activity-btn"
            onClick={() => setShowModal(true)}
          >
            Add Unplanned Activity
          </button>
        </div>
        
        <div className="activity-table-container">
          <table className="activity-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Task</th>
                <th>Number of Targets Achieved</th>
              </tr>
            </thead>
            <tbody>
              {activities.unplanned.map(activity => (
                <tr key={activity.id}>
                  <td>{new Date(activity.date).toLocaleDateString()}</td>
                  <td>{activity.task}</td>
                  <td>
                    <input
                      type="number"
                      value={activity.targetsAchieved}
                      onChange={(e) => handleTargetsAchievedUpdate('unplanned', activity.id, e.target.value)}
                      placeholder="Enter number"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Add New Unplanned Activity</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={newActivity.date}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Task</label>
                <input
                  type="text"
                  name="task"
                  value={newActivity.task}
                  onChange={handleInputChange}
                  placeholder="Enter task description"
                />
              </div>

              <div className="form-group">
                <label>Number of Targets Achieved</label>
                <input
                  type="number"
                  name="targetsAchieved"
                  value={newActivity.targetsAchieved}
                  onChange={handleInputChange}
                  placeholder="Enter number"
                />
              </div>

              <button className="submit-btn" onClick={handleAddActivity}>
                Add Activity
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;