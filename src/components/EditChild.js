import React, { useEffect, useState } from 'react';
import './EditChild.css';
import { useLocation, useNavigate } from 'react-router-dom';

const EditChild = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [child, setChild] = useState(null);
  const [locations, setLocations] = useState([]);
  const [allChildren, setAllChildren] = useState([]);
  const [selectedChildId, setSelectedChildId] = useState(null);
  const [warningShown, setWarningShown] = useState(false);
  const isSidebarAccess = !location.state?.child;
  const [originalChild, setOriginalChild] = useState(null); // to hold original values
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/locations', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => setLocations(data))
      .catch(console.error);

    if (isSidebarAccess) {
      fetch('http://localhost:5000/api/children', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => res.json())
        .then(data => setAllChildren(data))
        .catch(console.error);
    } else {
      setChild(location.state.child);
      setOriginalChild(location.state.child);
    }
    if (!isSidebarAccess && location.state?.child) {
        setChild(location.state.child);
        setOriginalChild(location.state.child);
      }
  }, [isSidebarAccess, location.state, token]);

  const handleChildSelect = (id) => {
    const selected = allChildren.find(c => c.id === parseInt(id));
    setSelectedChildId(id);
    setChild({ ...selected });
    setOriginalChild({ ...selected })
  };

  const calculateAge = (dobStr) => {
    const dob = new Date(dobStr);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const m = today.getMonth() - dob.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
    return age;
  };
  
  const handleInputChange = (field, value) => {
    if (field === 'setlocation' && child.setlocation !== value && !warningShown) {
      alert('⚠️ Warning: this child may no longer be visible in your current database view.');
      setWarningShown(true);
    }
  
    if (field === 'dob') {
      const age = calculateAge(value);
      setChild(prev => ({ ...prev, dob: value, age }));
    } else {
      setChild(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async () => {
    if (!child) return;
  
    const method = isCreatingNew ? 'POST' : 'PUT';
    const endpoint = isCreatingNew
      ? 'http://localhost:5000/api/children'
      : `http://localhost:5000/api/children/${child.id}`;
  
    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(child),
      });
  
      if (res.ok) {
        alert(isCreatingNew ? '✅ Child created successfully' : '✅ Child updated successfully');
        navigate('/program/children');
      } else {
        alert(isCreatingNew ? '❌ Failed to create child' : '❌ Failed to update child');
      }
    } catch (err) {
      console.error('Submit error:', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('⚠️ Are you sure you want to delete this child and ALL related session/answer data?')) return;
    if (!window.confirm('This action is permanent. Confirm again to delete.')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/children/${child.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        alert('❌ Child deleted');
        navigate('/program/children');
      } else {
        alert('Failed to delete child.');
      }
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  return (
    
    <div className="edit-child-container">
      <div className="edit-child-header">
  <h2>{isCreatingNew ? 'Create New Child' : 'Edit Child'}</h2>
  <button className="create-btn" onClick={() => {
  setChild({
    first_name: '',
    last_name: '',
    dob: '',
    gender: '',
    setlocation: 1
  });
  setIsCreatingNew(true);
  setSelectedChildId(null);
    }}>
    <span role="img" aria-label="Add">➕</span> Create New Child
    </button>
</div>
      <h2>Edit Child</h2>
      {isSidebarAccess && (
        <div className="search-bar">
          <label>Select a child to edit:</label>
          <select value={selectedChildId || ''} onChange={(e) => handleChildSelect(e.target.value)}>
            <option value="">-- Choose Child --</option>
            {allChildren.map(child => (
              <option key={child.id} value={child.id}>
                {child.first_name} {child.last_name}
              </option>
            ))}
          </select>
        </div>
      )}
      <p className="unsaved-warning">
        <strong>Note:</strong> Refresh the page without submitting to restore original data.
      </p>

      {child && (
        <div className="child-form">
          <input
  type="text"
  className={child.first_name === originalChild?.first_name ? 'field-unchanged' : 'field-edited'}
  placeholder="First Name"
  value={child.first_name || ''}
  onChange={(e) => handleInputChange('first_name', e.target.value)}
/>

<input
  type="text"
  className={child.last_name === originalChild?.last_name ? 'field-unchanged' : 'field-edited'}
  placeholder="Last Name"
  value={child.last_name || ''}
  onChange={(e) => handleInputChange('last_name', e.target.value)}
/>

<input
  type="text"
  className={child.gender === originalChild?.gender ? 'field-unchanged' : 'field-edited'}
  placeholder="Gender"
  value={child.gender || ''}
  onChange={(e) => handleInputChange('gender', e.target.value)}
/>

          <label>Date of Birth:</label>
          <input
  type="date"
  className={child.dob?.slice(0, 10) === originalChild?.dob?.slice(0, 10) ? 'field-unchanged' : 'field-edited'}
  value={child.dob ? child.dob.slice(0, 10) : ''}
  onChange={(e) => handleInputChange('dob', e.target.value)}
/>

          <label>Set Location:</label>
          <select
  className={child.setlocation === originalChild?.setlocation ? 'field-unchanged' : 'field-edited'}
  value={child.setlocation || ''}
  onChange={(e) => handleInputChange('setlocation', parseInt(e.target.value))}
>
{locations
  .filter(loc => loc.id !== 0)
  .map(loc => (
    <option key={loc.id} value={loc.id}>
      {loc.name}
    </option>
))}
</select>

          <div className="form-buttons">
            <button className="submit-btn" onClick={handleSubmit}>✔ Save</button>
            <button className="delete-btn" onClick={handleDelete}>
                <span role="img" aria-label="trash">🗑</span> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditChild;
