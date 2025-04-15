import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './CreateSessionPage.css';

const CreateSessionPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const [children, setChildren] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedChild, setSelectedChild] = useState(location.state?.child || null);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [sessions, setSessions] = useState([]);
  const [warning, setWarning] = useState('');
  const [projectedNum, setProjectedNum] = useState(null);

  useEffect(() => {
    const fetchChildren = async () => {
      const res = await fetch('http://localhost:5000/api/sessions/children', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setChildren(data);
    };
    fetchChildren();
  }, [token]);

  useEffect(() => {
    if (selectedChild) {
      handleSelectChild(selectedChild);
    }
    // eslint-disable-next-line
  }, [selectedChild]);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearch(query);
    setFilteredChildren(
      children.filter(child =>
        child.first_name.toLowerCase().includes(query.toLowerCase()) ||
        child.last_name.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

  const handleSessionClick = (session) => {
    navigate('/session-answers', {
      state: {
        session,
        child: selectedChild
      }
    });
  };

  const handleSelectChild = async (child) => {
    setSelectedChild(child);
    setSearch('');
    setFilteredChildren([]);
    setDate('');
    setNotes('');
    setWarning('');
    setProjectedNum(null);
    const res = await fetch(`http://localhost:5000/api/sessions/${child.id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setSessions(data);
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setDate(newDate);

    if (new Date(newDate) < new Date().setHours(0, 0, 0, 0)) {
      setWarning('Warning: You are creating a session in the past.');
    } else {
      setWarning('');
    }

    // Calculate projected session number
    const allDates = sessions.map(s => new Date(s.date)).sort((a, b) => a - b);
    const insertionIndex = allDates.findIndex(d => new Date(newDate) < d);
    const projected = insertionIndex === -1 ? sessions.length + 1 : insertionIndex + 1;
    setProjectedNum(projected);
  };

  const handleSubmit = async () => {
    if (!selectedChild || !date) return;
    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          child_id: selectedChild.id,
          date,
          notes
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${data.name} session #${data.sessionNum} created on ${data.date}`);
        handleSelectChild(selectedChild); // Refresh sessions
      } else {
        alert('Could not create session.');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      alert('Server error');
    }
  };

  return (
    <div className="session-container">
      <h2>Session Management</h2>
      <div className="search-box">
        <label>Search children:</label>
        <input value={search} onChange={handleSearchChange} placeholder="Type a name..." />
        {filteredChildren.length > 0 && (
          <ul className="dropdown-list">
            {filteredChildren.map((child) => (
              <li key={child.id} onClick={() => handleSelectChild(child)}>
                {child.first_name} {child.last_name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {selectedChild && (
        <>
          <div className="child-info">
            <h3>Selected: {selectedChild.first_name} {selectedChild.last_name}</h3>
          </div>

          <div className="session-history">
            <h4>Sessions</h4>
            <p className="session-note">Click on a row to edit session details.</p>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Notes</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} onClick={() => handleSessionClick(s)} className="clickable-row">
                    <td>{s.child_session_num}</td>
                    <td>{s.date.slice(0, 10)}</td>
                    <td>{s.notes}</td>
                    <td>{s.compl_status ? 'Complete' : 'Incomplete'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="date-entry">
            <label>Select date:</label>
            <input type="date" value={date} onChange={handleDateChange} />
            {warning && <p className="warning">{warning}</p>}
            {projectedNum && (
              <p className="projected-session">Projected Session Number: #{projectedNum}</p>
            )}
            <label>Notes:</label>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Enter session notes..." />
            <button onClick={handleSubmit}>Create Session</button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateSessionPage;
