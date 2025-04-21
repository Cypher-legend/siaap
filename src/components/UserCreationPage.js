import React, { useEffect, useState } from 'react';
import './UserCreationPage.css';

const EditUsersPage = () => {
  const token = localStorage.getItem('token');
  const [users, setUsers] = useState([]), [locations, setLocations] = useState([]);
  const [search, setSearch] = useState(''), [selectedUser, setSelectedUser] = useState(null);
  const [originalUser, setOriginalUser] = useState(null), [isCreating, setIsCreating] = useState(false);

  const fetchData = async () => {
    const [usersRes, locRes] = await Promise.all([
      fetch('http://localhost:5000/api/users', { headers: { Authorization: `Bearer ${token}` } }),
      fetch('http://localhost:5000/api/locations', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setUsers(await usersRes.json()); setLocations(await locRes.json());
  };

  useEffect(() => { fetchData(); }, [token]);

  const filteredUsers = users.filter(u =>
    Object.values(u).some(val => String(val).toLowerCase().includes(search.toLowerCase()))
  );

  const handleSelect = (u) => {
    const formatted = {
      firstName: u.first_name || '', lastName: u.last_name || '',
      mobile_number: u.mobile_number || '', role: u.role || 'user',
      setlocation: u.setlocation ?? 0, id: u.id
    };
    setSelectedUser(formatted); setOriginalUser(formatted); setIsCreating(false);
  };

  const handleChange = (field, val) => setSelectedUser(p => ({ ...p, [field]: val }));
  const isSame = (field, val = selectedUser?.[field]) => val !== '' && originalUser?.[field] === val;

  const handleSave = async () => {
    const payload = {
      first_name: selectedUser.firstName || '', last_name: selectedUser.lastName || '',
      mobile_number: selectedUser.mobile_number || '', role: selectedUser.role || '',
      setlocation: selectedUser.setlocation ?? 0
    };
    if (isCreating) payload.password = selectedUser.password || '';

    const res = await fetch(
      isCreating ? 'http://localhost:5000/api/users' : `http://localhost:5000/api/users/${selectedUser.id}`,
      {
        method: isCreating ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      }
    );

    const msg = isCreating ? 'create' : 'update';
    if (res.ok) {
      alert(`✅ User ${msg}d!`);
      setSelectedUser(null); setOriginalUser(null); setIsCreating(false); fetchData();
    } else {
      const err = await res.json();
      alert(`❌ Failed to ${msg} user: ${err.message || 'Unknown error'}`);
    }
  };

  const handleDelete = async () => {
    if (!selectedUser?.id || !window.confirm('⚠️ Delete this user?')) return;
    const res = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      alert('🗑 User deleted'); setSelectedUser(null); setOriginalUser(null); fetchData();
    } else alert('❌ Delete failed');
  };

  const handleCreate = () => {
    setIsCreating(true);
    setSelectedUser({ firstName: '', lastName: '', mobile_number: '', password: '', role: 'user', setlocation: 0 });
    setOriginalUser({});
  };

  return (
    <div className="edit-child-container">
      <div className="edit-child-header">
        <h2>{isCreating ? 'Create New User' : 'Edit User'}</h2>
        <button className="create-btn" onClick={handleCreate}>➕ Create New User</button>
      </div>

      <div className="search-bar">
        <label>Search Users:</label>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
      </div>

      <table className="children-table">
        <thead>
          <tr><th>ID</th><th>Mobile</th><th>Role</th><th>First</th><th>Last</th><th>Location</th></tr>
        </thead>
        <tbody>
          {filteredUsers.map(u => (
            <tr key={u.id} className="clickable-row" onClick={() => handleSelect(u)}>
              <td>{u.id}</td><td>{u.mobile_number}</td><td>{u.role}</td>
              <td>{u.first_name}</td><td>{u.last_name}</td>
              <td>{locations.find(l => l.id === u.setlocation)?.name || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <>
          <p className="unsaved-warning"><strong>Note:</strong> Refreshing resets unsaved changes.</p>
          <div className="child-form">
            <input className={selectedUser.firstName ? isSame('firstName') ? 'field-unchanged' : 'field-edited' : ''} placeholder="First Name" value={selectedUser.firstName} onChange={e => handleChange('firstName', e.target.value)} />
            <input className={selectedUser.lastName ? isSame('lastName') ? 'field-unchanged' : 'field-edited' : ''} placeholder="Last Name" value={selectedUser.lastName} onChange={e => handleChange('lastName', e.target.value)} />
            <input className={selectedUser.mobile_number ? isSame('mobile_number') ? 'field-unchanged' : 'field-edited' : ''} placeholder="Mobile Number" value={selectedUser.mobile_number} onChange={e => handleChange('mobile_number', e.target.value)} />
            {isCreating && <input type="password" className="field-edited" placeholder="Password" value={selectedUser.password || ''} onChange={e => handleChange('password', e.target.value)} />}
            <select className={isSame('role') ? 'field-unchanged' : 'field-edited'} value={selectedUser.role} onChange={e => handleChange('role', e.target.value)}>
              <option value="user">user</option><option value="admin">admin</option>
            </select>
            <select className={isSame('setlocation') ? 'field-unchanged' : 'field-edited'} value={selectedUser.setlocation} onChange={e => handleChange('setlocation', parseInt(e.target.value))}>
              {locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
            </select>
            <div className="form-buttons">
              <button className="submit-btn" onClick={handleSave}>✔ Save</button>
              {!isCreating && <button className="delete-btn" onClick={handleDelete}>🗑 Delete</button>}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EditUsersPage;
