import React, { useEffect, useState } from 'react';
import './CreateSessionPage.css';

const CreateSessionPage = () => {
  const token = localStorage.getItem('token');
  const [children, setChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/children', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setChildren(data);
      } catch (err) {
        console.error('Error fetching children:', err);
      }
    };

    fetchChildren();
  }, [token]);

  useEffect(() => {
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const results = children.filter(
        child => child.first_name.toLowerCase().includes(lower) || child.last_name.toLowerCase().includes(lower)
      );
      setFilteredChildren(results);
    } else {
      setFilteredChildren([]);
    }
  }, [searchTerm, children]);

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    setSearchTerm('');
    setFilteredChildren([]);
  };

  const handleSubmit = async () => {
    if (!selectedChild || !date) return;
    try {
      const res = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          child_id: selectedChild.id,
          date,
          notes,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(`${data.sessionNum}th session created on ${data.date} for ${data.name}`);
        setSelectedChild(null);
        setDate('');
        setNotes('');
      } else {
        alert(data.message || 'Failed to create session');
      }
    } catch (err) {
      console.error('Error creating session:', err);
      alert('Something went wrong');
    }
  };

  return (
    <div className="create-session-container">
      <h2>Create New Session</h2>

      <div className="search-bar">
        <label htmlFor="search">Search children:</label>
        <input
          id="search"
          type="text"
          placeholder="Enter name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredChildren.length > 0 && (
        <div className="children-list">
          {filteredChildren.map(child => (
            <div key={child.id} className="child-item">
              <span>{child.first_name} {child.last_name} (Age: {child.age})</span>
              <button className="select-btn" onClick={() => handleSelectChild(child)}>Select Child</button>
            </div>
          ))}
        </div>
      )}

      {selectedChild && (
        <div className="selected-child-info">
          <strong>Selected:</strong> {selectedChild.first_name} {selectedChild.last_name} (Age: {selectedChild.age}, Gender: {selectedChild.gender})
        </div>
      )}

      {selectedChild && (
        <div className="session-form">
          <label htmlFor="date">Date:</label>
          <input
            type="date"
            id="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <label htmlFor="notes">Notes:</label>
          <textarea
            id="notes"
            rows="5"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <button onClick={handleSubmit}>Create Session</button>
        </div>
      )}
    </div>
  );
};

export default CreateSessionPage;