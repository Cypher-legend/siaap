import React, { useEffect, useState } from 'react';
import './ChildrenTablePage.css';
import { useNavigate } from 'react-router-dom';

const ChildrenTablePage = () => {
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [children, setChildren] = useState([]);
  const [locations, setLocations] = useState([]);
  const [search, setSearch] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
  const [editingChild, setEditingChild] = useState(null);
  const [originalChild, setOriginalChild] = useState(null);
  const [warningShown, setWarningShown] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const [childrenRes, locationsRes] = await Promise.all([
        fetch('http://localhost:5000/api/children', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/locations', {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);
      setChildren(await childrenRes.json());
      setLocations(await locationsRes.json());
    };
    fetchData();
  }, [token]);

  const filteredChildren = children
    .filter(child =>
      `${child.first_name} ${child.last_name}`.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const { key, direction } = sortConfig;
      if (!key) return 0;
      return (a[key] > b[key] ? 1 : -1) * (direction === 'asc' ? 1 : -1);
    });

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const getArrow = (key) => sortConfig.key === key ? (sortConfig.direction === 'asc' ? '▲' : '▼') : '↕';

  const handleEditClick = (child) => {
    setEditingChild({ ...child });
    setOriginalChild({ ...child });
  };

  const handleCreate = () => {
    setEditingChild({
      first_name: '',
      last_name: '',
      dob: '',
      gender: '',
      setlocation: 1
    });
    setOriginalChild({});
  };

  const handleInputChange = (field, value) => {
    if (field === 'setlocation' && editingChild.setlocation !== value && !warningShown) {
      alert('⚠️ This child may no longer be visible based on location filter.');
      setWarningShown(true);
    }

    setEditingChild(prev => ({
      ...prev,
      [field]: field === 'dob' ? value : value
    }));
  };

  const handleSubmit = async () => {
    const isNew = !editingChild.id;
    const endpoint = isNew
      ? 'http://localhost:5000/api/children'
      : `http://localhost:5000/api/children/${editingChild.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const body = JSON.stringify(editingChild);

    try {
      const res = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body
      });

      if (res.ok) {
        alert(isNew ? '✅ Child created' : '✅ Child updated');
        setEditingChild(null);
        setOriginalChild(null);
        const refreshed = await fetch('http://localhost:5000/api/children', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setChildren(await refreshed.json());
      } else {
        alert('❌ Failed to save changes');
      }
    } catch (err) {
      console.error('Save error:', err);
    }
  };

  const handleDelete = async () => {
    if (!editingChild?.id) return;
    if (!window.confirm('⚠️ Are you sure you want to delete this child and all related data?')) return;

    const res = await fetch(`http://localhost:5000/api/children/${editingChild.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      alert('🗑 Child deleted');
      setEditingChild(null);
      const refreshed = await fetch('http://localhost:5000/api/children', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChildren(await refreshed.json());
    } else {
      alert('❌ Failed to delete child');
    }
  };

  const navigateToSessions = (child) => {
    navigate('/program/session-management', { state: { child } });
  };

  const isFieldEdited = (key) =>
    editingChild?.[key] !== undefined &&
    originalChild?.[key] !== undefined &&
    editingChild[key] !== originalChild[key];

  return (
    <div className="children-table-container">
      <div className="children-table-header">
        <h2>Children</h2>
        <button className="create-btn" onClick={handleCreate}>➕ Create New Child</button>
      </div>

      <div className="search-bar">
        <label>Search:</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <table className="children-table">
        <thead>
          <tr>
            {['id', 'first_name', 'last_name', 'dob', 'age', 'gender', 'setlocation'].map((key) => (
              <th key={key} onClick={() => handleSort(key)}>
                {key.replace('_', ' ').toUpperCase()} {getArrow(key)}
              </th>
            ))}
            <th>✏️</th>
          </tr>
        </thead>
        <tbody>
          {filteredChildren.map(child => (
            <tr key={child.id}>
              <td onClick={() => navigateToSessions(child)}>{child.id}</td>
              <td onClick={() => navigateToSessions(child)}>{child.first_name}</td>
              <td onClick={() => navigateToSessions(child)}>{child.last_name}</td>
              <td onClick={() => navigateToSessions(child)}>{child.dob.slice(0, 10)}</td>
              <td onClick={() => navigateToSessions(child)}>{child.age}</td>
              <td onClick={() => navigateToSessions(child)}>{child.gender}</td>
              <td onClick={() => navigateToSessions(child)}>
                {locations.find(l => l.id === child.setlocation)?.name || child.setlocation}
              </td>
              <td>
                <button className="edit-btn" onClick={() => handleEditClick(child)}>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingChild && (
        <>
          <p className="unsaved-warning">Note: Refreshing will reset unsaved changes.</p>
          <div className="child-form">
            <input
              className={isFieldEdited('first_name') ? 'field-edited' : 'field-unchanged'}
              placeholder="First Name"
              value={editingChild.first_name || ''}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
            />
            <input
              className={isFieldEdited('last_name') ? 'field-edited' : 'field-unchanged'}
              placeholder="Last Name"
              value={editingChild.last_name || ''}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
            />
            <input
              className={isFieldEdited('gender') ? 'field-edited' : 'field-unchanged'}
              placeholder="Gender"
              value={editingChild.gender || ''}
              onChange={(e) => handleInputChange('gender', e.target.value)}
            />
            <label>Date of Birth:</label>
            <input
              type="date"
              className={isFieldEdited('dob') ? 'field-edited' : 'field-unchanged'}
              value={editingChild.dob?.slice(0, 10) || ''}
              onChange={(e) => handleInputChange('dob', e.target.value)}
            />
            <label>Set Location:</label>
            <select
              className={isFieldEdited('setlocation') ? 'field-edited' : 'field-unchanged'}
              value={editingChild.setlocation || ''}
              onChange={(e) => handleInputChange('setlocation', parseInt(e.target.value))}
            >
              <option value="" disabled>-- Select --</option>
              {locations.filter(l => l.id !== 0).map(loc => (
                <option key={loc.id} value={loc.id}>{loc.name}</option>
              ))}
            </select>

            <div className="form-buttons">
              <button className="submit-btn" onClick={handleSubmit}>✔ Save</button>
              {editingChild.id && (
                <button className="delete-btn" onClick={handleDelete}>🗑 Delete</button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChildrenTablePage;
