// planner.js
import React, { useState, useEffect } from 'react';
import './planner.css';

const TASK_CATEGORIES = [
  'AST',
  'PST',
  'Referral',
  'Report Writing',
  'Access',
  'Stakeholder Meeting'
];

const Planner = () => {
  // Uncomment this line once to reset tasks if needed
  // localStorage.removeItem('plannerTasks');
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tasks, setTasks] = useState(() => {
    // Initialize tasks from localStorage
    const savedTasks = localStorage.getItem('plannerTasks');
    return savedTasks ? JSON.parse(savedTasks) : {};
  });
  const [newTask, setNewTask] = useState('');
  const [taskTarget, setTaskTarget] = useState('');
  const [taskAchieved, setTaskAchieved] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(TASK_CATEGORIES[0]);
  
  // Get progress data for synchronization if needed
  // const [progressData, setProgressData] = useState(() => {
  //   const savedProgress = localStorage.getItem('progressActivities');
  //   return savedProgress ? JSON.parse(savedProgress) : { planned: [], unplanned: [] };
  // });

  // Save tasks to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('plannerTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Format date as YYYY-MM-DD for task storage
  const formatDate = (date) => {
    if (!date) return '';
    
    // Get date components explicitly
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Convert from 0-based to 1-based
    const day = date.getDate();
    
    // Format with leading zeros
    const formattedMonth = String(month).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    
    // Build the date string
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    
    // Debug output
    console.log(`Formatting date: ${date.toString()}`);
    console.log(`Year: ${year}, Month: ${month}, Day: ${day}`);
    console.log(`Formatted date string: ${dateStr}`);
    
    return dateStr;
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get day of week for first day of month (0-6)
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate between months
  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // Handle day click - Set the exact date with all components
  const handleDayClick = (day) => {
    // Create a date for the clicked day using explicit year, month, and day values
    const clickedYear = currentMonth.getFullYear();
    const clickedMonth = currentMonth.getMonth();
    
    // Create new date with explicit values and zero time components
    const clickedDate = new Date(clickedYear, clickedMonth, day, 0, 0, 0, 0);
    
    // Debug output
    console.log(`Clicked on day: ${day}`);
    console.log(`Current month: ${clickedMonth} (${monthNames[clickedMonth]})`);
    console.log(`Created date object: ${clickedDate.toString()}`);
    console.log(`Date components: year=${clickedYear}, month=${clickedMonth}, day=${day}`);
    
    setSelectedDate(clickedDate);
    setShowModal(true);
  };

  // Add new task
  const handleAddTask = () => {
    if (!newTask.trim() || !selectedDate) {
      console.log("No task or no date selected");
      return;
    }

    // Get date components from selectedDate
    const taskYear = selectedDate.getFullYear();
    const taskMonth = selectedDate.getMonth() + 1; // Convert to 1-indexed for storage
    const taskDay = selectedDate.getDate();
    
    // Format date string manually to ensure accuracy
    const dateStr = `${taskYear}-${String(taskMonth).padStart(2, '0')}-${String(taskDay).padStart(2, '0')}`;
    
    // Parse target and achieved as numbers
    const targetValue = taskTarget.trim() ? parseInt(taskTarget.trim(), 10) : 0;
    const achievedValue = taskAchieved.trim() ? parseInt(taskAchieved.trim(), 10) : 0;
    
    // Calculate balance
    const balanceValue = targetValue - achievedValue;
    
    // Create task object with all necessary data
    const taskObj = {
      task: newTask.trim(),
      category: selectedCategory,
      target: targetValue,
      achieved: achievedValue,
      balance: balanceValue,
      id: Date.now(),  // Add an ID for easier manipulation later
      // Store date components for reference
      year: taskYear,
      month: taskMonth,
      day: taskDay
    };
    
    // Debug output
    console.log(`Adding task for date: ${selectedDate.toString()}`);
    console.log(`Date string for storage: ${dateStr}`);
    console.log(`Task object:`, taskObj);
    
    // Update tasks using functional update to ensure we have latest state
    setTasks(prev => {
      // Create a new object to avoid mutation
      const updatedTasks = {...prev};
      
      // Initialize the array for this date if it doesn't exist
      if (!updatedTasks[dateStr]) {
        updatedTasks[dateStr] = [];
      }
      
      // Add the new task
      updatedTasks[dateStr] = [...updatedTasks[dateStr], taskObj];
      
      return updatedTasks;
    });
    
    // Update progress data for synchronization
    // const newProgressTask = {
    //   task: newTask.trim(),
    //   target: targetValue,
    //   date: dateStr,
    //   targetsAchieved: achievedValue,
    //   category: selectedCategory,
    //   id: `${dateStr}-${Date.now()}`
    // };
    
    // setProgressData(prev => {
    //   const updatedProgress = {
    //     ...prev,
    //     planned: [...prev.planned, newProgressTask]
    //   };
    //   localStorage.setItem('progressActivities', JSON.stringify(updatedProgress));
    //   return updatedProgress;
    // });
    
    // Reset form and close modal
    setNewTask('');
    setTaskTarget('');
    setTaskAchieved('');
    setShowModal(false);
  };

  // Update task achieved value
  const handleUpdateAchieved = (dateStr, taskIndex, newAchieved) => {
    setTasks(prev => {
      const updatedTasks = {...prev};
      
      // Get the task
      const task = {...updatedTasks[dateStr][taskIndex]};
      
      // Update achieved and balance
      task.achieved = parseInt(newAchieved, 10) || 0;
      task.balance = task.target - task.achieved;
      
      // Update the task in the tasks array
      updatedTasks[dateStr][taskIndex] = task;
      
      return updatedTasks;
    });
  };

  // Delete task
  const handleDeleteTask = (dateStr, taskIndex) => {
    setTasks(prev => {
      // Create a new object to avoid mutation
      const updatedTasks = {...prev};
      // Filter out the task to delete
      updatedTasks[dateStr] = updatedTasks[dateStr].filter((_, index) => index !== taskIndex);
      
      // Remove the date key if no tasks remain
      if (updatedTasks[dateStr].length === 0) {
        delete updatedTasks[dateStr];
      }
      
      return updatedTasks;
    });
  };

  // Generate calendar grid
  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(<td key={`empty-${j}`} className="empty"></td>);
        } else if (day > daysInMonth) {
          week.push(<td key={`empty-end-${j}`} className="empty"></td>);
        } else {
          // Create a date object for this day
          const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day, 0, 0, 0, 0);
          const dateStr = formatDate(date);
          // Check if there are tasks for this date
          const hasTasks = tasks[dateStr] && tasks[dateStr].length > 0;
          
          // Calculate total balance for this day
          let dayBalance = 0;
          if (hasTasks) {
            dayBalance = tasks[dateStr].reduce((sum, task) => sum + (task.balance || 0), 0);
          }
          
          // Determine class based on balance
          let balanceClass = '';
          if (dayBalance > 0) {
            balanceClass = 'positive-balance';
          } else if (dayBalance < 0) {
            balanceClass = 'negative-balance';
          }
          
          week.push(
            <td 
              key={day} 
              className={`day ${hasTasks ? 'has-tasks' : ''} ${balanceClass}`}
              onClick={() => handleDayClick(day)}
            >
              <span className="day-number">{day}</span>
              {hasTasks && (
                <div className="task-indicator">
                  {dayBalance !== 0 && (
                    <span className="day-balance">{dayBalance > 0 ? `+${dayBalance}` : dayBalance}</span>
                  )}
                </div>
              )}
            </td>
          );
          day++;
        }
      }
      calendar.push(<tr key={i}>{week}</tr>);
      if (day > daysInMonth) break;
    }

    return calendar;
  };

  // Get tasks organized by category for current month
  const getCategoryTasks = () => {
    const categoryTasks = {};
    TASK_CATEGORIES.forEach(category => {
      categoryTasks[category] = [];
    });

    // Loop through all tasks and filter by current month
    Object.entries(tasks).forEach(([dateStr, dateTasks]) => {
      // Extract year, month, day from the date string
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
      // Month in the date string is 1-based, but month in JS Date is 0-based
      const taskMonth = month - 1;
      
      // Check if task belongs to current month
      if (taskMonth === currentMonth.getMonth() && 
          parseInt(year) === currentMonth.getFullYear()) {
        
        // Add each task to its category
        dateTasks.forEach(task => {
          // Handle both string and object formats
          if (typeof task === 'string') {
            // Legacy format - put in first category
            categoryTasks[TASK_CATEGORIES[0]].push({
              date: parseInt(day),
              task: task,
              target: 0,
              achieved: 0,
              balance: 0
            });
          } else {
            // Object format with category
            const category = task.category || TASK_CATEGORIES[0];
            categoryTasks[category].push({
              date: parseInt(day),
              task: task.task,
              target: task.target || 0,
              achieved: task.achieved || 0,
              balance: task.balance || 0
            });
          }
        });
      }
    });

    // Sort tasks by date within each category
    Object.keys(categoryTasks).forEach(category => {
      categoryTasks[category].sort((a, b) => a.date - b.date);
    });

    return categoryTasks;
  };

  // Calculate category statistics
  const getCategoryStats = () => {
    const stats = {};
    const categoryTasks = getCategoryTasks();
    
    TASK_CATEGORIES.forEach(category => {
      const tasks = categoryTasks[category];
      const totalTarget = tasks.reduce((sum, task) => sum + (task.target || 0), 0);
      const totalAchieved = tasks.reduce((sum, task) => sum + (task.achieved || 0), 0);
      const totalBalance = totalTarget - totalAchieved;
      
      stats[category] = {
        totalTarget,
        totalAchieved,
        totalBalance,
        completionPercentage: totalTarget ? Math.round((totalAchieved / totalTarget) * 100) : 0
      };
    });
    
    return stats;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // Get category stats for display
  const categoryStats = getCategoryStats();

  return (
    <div className="planner-container">
      
      <div className="planner-content">
        <div className="calendar-header">
          <button onClick={() => changeMonth(-1)}>&lt;</button>
          <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
          <button onClick={() => changeMonth(1)}>&gt;</button>
        </div>

        {/* Monthly summary stats */}
        <div className="monthly-summary">
          <h3>Monthly Progress</h3>
          <div className="summary-grid">
            {Object.entries(categoryStats).map(([category, stats]) => (
              <div key={category} className="summary-card">
                <h4>{category}</h4>
                <div className="summary-stats">
                  <div className="stat-item">
                    <span className="stat-label">Target:</span>
                    <span className="stat-value">{stats.totalTarget}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Achieved:</span>
                    <span className="stat-value">{stats.totalAchieved}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Balance:</span>
                    <span className={`stat-value ${stats.totalBalance > 0 ? 'positive' : stats.totalBalance < 0 ? 'negative' : ''}`}>
                      {stats.totalBalance}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Completion:</span>
                    <span className="stat-value">{stats.completionPercentage}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <table className="calendar">
          <thead>
            <tr>
              <th>Sun</th>
              <th>Mon</th>
              <th>Tue</th>
              <th>Wed</th>
              <th>Thu</th>
              <th>Fri</th>
              <th>Sat</th>
            </tr>
          </thead>
          <tbody>
            {renderCalendar()}
          </tbody>
        </table>

        {/* Category summary section */}
        <div className="category-summaries">
          <h3>Monthly Task Categories</h3>
          <div className="category-grid">
            {Object.entries(getCategoryTasks()).map(([category, categoryTasks]) => (
              <div key={category} className="category-box">
                <h4>{category}</h4>
                <div className="category-tasks">
                  {categoryTasks.length > 0 ? (
                    categoryTasks.map((task, index) => (
                      <div key={index} className="category-task-item">
                        <span className="task-date">{task.date}</span>
                        <span className="task-text">{task.task}</span>
                        <div className="task-metrics">
                          <span className="task-target">Target: {task.target}</span>
                          <span className="task-achieved">Achieved: {task.achieved}</span>
                          <span className={`task-balance ${task.balance > 0 ? 'positive' : task.balance < 0 ? 'negative' : ''}`}>
                            Balance: {task.balance}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="no-tasks">No tasks</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Task modal */}
        {showModal && selectedDate && (
          <div className="modal">
            <div className="modal-content">
              <div className="modal-header">
                <h3>Tasks for {selectedDate.toLocaleDateString()}</h3>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              
              <div className="task-list">
                {tasks[formatDate(selectedDate)]?.map((taskItem, index) => (
                  <div key={index} className="task-item">
                    {typeof taskItem === 'string' ? (
                      <span>{taskItem}</span>
                    ) : (
                      <div className="task-details">
                        <div className="task-header">
                          <span className="task-category">{taskItem.category}</span>
                          <span className="task-text">{taskItem.task}</span>
                        </div>
                        <div className="task-metrics">
                          <div className="metric-item">
                            <span className="metric-label">Target:</span>
                            <span className="metric-value">{taskItem.target || 0}</span>
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Achieved:</span>
                            <input 
                              type="number" 
                              className="achieved-input" 
                              value={taskItem.achieved || 0}
                              onChange={(e) => handleUpdateAchieved(
                                formatDate(selectedDate), 
                                index, 
                                e.target.value
                              )}
                              min="0"
                            />
                          </div>
                          <div className="metric-item">
                            <span className="metric-label">Balance:</span>
                            <span className={`metric-value ${taskItem.balance > 0 ? 'positive' : taskItem.balance < 0 ? 'negative' : ''}`}>
                              {taskItem.balance || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                    <button 
                      onClick={() => handleDeleteTask(formatDate(selectedDate), index)}
                      className="delete-task"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-task">
                <div className="task-input-group">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
                    {TASK_CATEGORIES.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Enter new task"
                    onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                  />
                </div>
                <div className="task-metrics-input">
                  <input
                    type="number"
                    value={taskTarget}
                    onChange={(e) => setTaskTarget(e.target.value)}
                    placeholder="Target"
                    min="0"
                  />
                  <input
                    type="number"
                    value={taskAchieved}
                    onChange={(e) => setTaskAchieved(e.target.value)}
                    placeholder="Achieved"
                    min="0"
                  />
                  <div className="balance-preview">
                    Balance: {(parseInt(taskTarget) || 0) - (parseInt(taskAchieved) || 0)}
                  </div>
                </div>
                <button onClick={handleAddTask}>Add Task</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Planner;