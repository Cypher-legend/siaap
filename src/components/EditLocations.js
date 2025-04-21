import React, { useEffect, useState } from 'react';
import './EditLocations.css';

const EditLocations = () => {
  const token = localStorage.getItem('token');
  const [locations, setLocations] = useState([]);
  const [newLocation, setNewLocation] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const fetchLocations = async () => {
    const res = await fetch('http://localhost:5000/api/locations', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    setLocations(data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleCreate = async () => {
    if (!newLocation.trim()) return;
    const res = await fetch('http://localhost:5000/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: newLocation }),
    });
    if (res.ok) {
      setNewLocation('');
      fetchLocations();
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this location?')) return;
    await fetch(`http://localhost:5000/api/locations/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchLocations();
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = async () => {
    const res = await fetch(`http://localhost:5000/api/locations/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ name: editingValue }),
    });
    if (res.ok) {
      setEditingId(null);
      setEditingValue('');
      fetchLocations();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  return (
    <div className="edit-locations-container">
      <h2>Edit Locations</h2>
      <div className="location-input">
        <input
          type="text"
          placeholder="New Location Name"
          value={newLocation}
          onChange={(e) => setNewLocation(e.target.value)}
        />
        <button onClick={handleCreate}>➕ Add</button>
      </div>
      <table className="locations-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Location Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {locations.map((loc) => (
            <tr key={loc.id}>
              <td>{loc.id}</td>
              <td>
                {editingId === loc.id ? (
                  <input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                  />
                ) : (
                  loc.name
                )}
              </td>
              <td>
                {loc.id === 0 ? (
                  <>
                    <button className="disabled-btn" disabled>Edit</button>
                    <button className="disabled-btn" disabled>Delete</button>
                  </>
                ) : editingId === loc.id ? (
                  <>
                    <button onClick={handleUpdate}>✔</button>
                    <button onClick={handleCancel}>✖</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(loc.id, loc.name)}>Edit</button>
                    <button onClick={() => handleDelete(loc.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EditLocations;
