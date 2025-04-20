import React, { useEffect, useState } from 'react';
import './EditCategories.css';

const EditCategories = () => {
  const token = localStorage.getItem('token');
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingValue, setEditingValue] = useState('');

  const fetchCategories = async () => {
    const res = await fetch('http://localhost:5000/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    setCategories(data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const res = await fetch('http://localhost:5000/api/categories', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: newName.trim() })
    });
    if (res.ok) {
      setNewName('');
      fetchCategories();
    }
  };

  const handleEdit = (id, name) => {
    setEditingId(id);
    setEditingValue(name);
  };

  const handleUpdate = async () => {
    const res = await fetch(`http://localhost:5000/api/categories/${editingId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ name: editingValue })
    });
    if (res.ok) {
      setEditingId(null);
      setEditingValue('');
      fetchCategories();
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingValue('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    await fetch(`http://localhost:5000/api/categories/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchCategories();
  };

  return (
    <div className="edit-categories-container">
      <h2>Edit Categories</h2>
      <div className="category-input">
        <input
          type="text"
          value={newName}
          placeholder="New Category Name"
          onChange={(e) => setNewName(e.target.value)}
        />
        <button onClick={handleCreate}>➕ Add</button>
      </div>

      <table className="categories-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Category Name</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.id}</td>
              <td>
                {editingId === cat.id ? (
                  <input
                    value={editingValue}
                    onChange={(e) => setEditingValue(e.target.value)}
                  />
                ) : (
                  cat.name
                )}
              </td>
              <td>
                {editingId === cat.id ? (
                  <>
                    <button onClick={handleUpdate}>✔</button>
                    <button onClick={handleCancel}>✖</button>
                  </>
                ) : (
                  <>
                    <button onClick={() => handleEdit(cat.id, cat.name)}>Edit</button>
                    <button onClick={() => handleDelete(cat.id)}>Delete</button>
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

export default EditCategories;
