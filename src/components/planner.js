import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './planner.css';

const Planner = () => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessionsByDate, setSessionsByDate] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [modalSessions, setModalSessions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await fetch('http://localhost:5000/api/sessions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      const grouped = {};
      data.forEach(session => {
        const dateKey = session.date.slice(0, 10);
        if (!grouped[dateKey]) grouped[dateKey] = [];
        grouped[dateKey].push(session);
      });

      setSessionsByDate(grouped);
    };

    fetchSessions();
  }, [token]);

  const formatDate = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const handleSessionClick = (session) => {
    navigate('/session-answers', {
      state: {
        session,
        child: session.child
      }
    });
  };

  const handleDayClick = (clickedDateObj) => {
    const dateKey = formatDate(clickedDateObj);
    setSelectedDate(dateKey);
    setModalSessions(sessionsByDate[dateKey] || []);
    setShowModal(true);
  };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDayOfMonth = getFirstDayOfMonth(currentMonth);
    const calendar = [];
    let day = 1;

    for (let i = 0; i < 6; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDayOfMonth) {
          week.push(<td key={`empty-${i}-${j}`} className="empty"></td>);
        } else if (day > daysInMonth) {
          week.push(<td key={`empty-end-${i}-${j}`} className="empty"></td>);
        } else {
          const dayDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
          const dateStr = formatDate(dayDate);
          const sessionCount = sessionsByDate[dateStr]?.length || 0;
          const dayClass = `day ${isToday(dayDate) ? 'today' : ''}`;

          week.push(
            <td key={day} className={dayClass} onClick={() => handleDayClick(dayDate)}>
              <div className="day-number">{day}</div>
              {sessionCount > 0 && (
                <div className="session-count">{sessionCount}</div>
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

  const changeMonth = (offset) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="planner-container">
      <div className="calendar-header">
        <button onClick={() => changeMonth(-1)}>&lt;</button>
        <h2>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h2>
        <button onClick={() => changeMonth(1)}>&gt;</button>
      </div>

      <table className="calendar">
        <thead>
          <tr>
            <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
          </tr>
        </thead>
        <tbody>{renderCalendar()}</tbody>
      </table>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Sessions on {selectedDate}</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            {modalSessions.length > 0 ? (
              <table className="modal-session-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Child</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {modalSessions.map((s) => (
                    <tr key={s.id} onClick={() => handleSessionClick(s)} className="clickable-row">
                      <td>{s.child_session_num}</td>
                      <td>{s.child?.first_name} {s.child?.last_name}</td>
                      <td>{s.compl_status ? 'Complete' : 'Incomplete'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No sessions</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Planner;
