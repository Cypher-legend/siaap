import React, { useEffect, useState } from 'react';
import './EditQuestion.css';

const EditQuestion = () => {
  const token = localStorage.getItem('token');
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [originalQuestion, setOriginalQuestion] = useState(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5000/api/categories', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (selectedCategoryId) {
      fetch(`http://localhost:5000/api/questions/category/${selectedCategoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(setQuestions)
        .catch(console.error);
    } else {
      setQuestions([]);
    }
  }, [selectedCategoryId, token]);

  const handleSelectQuestion = (question) => {
    setEditingQuestion({ ...question });
    setOriginalQuestion({ ...question });
    setIsCreatingNew(false);
  };

  const handleChange = (value) => {
    setEditingQuestion(prev => ({ ...prev, text: value }));
  };

  const handleSubmit = async () => {
    const url = isCreatingNew
      ? 'http://localhost:5000/api/questions'
      : `http://localhost:5000/api/questions/${editingQuestion.id}`;
    const method = isCreatingNew ? 'POST' : 'PUT';

    const body = {
      text: editingQuestion.text,
      category_id: parseInt(selectedCategoryId)
    };

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      alert(isCreatingNew ? '✅ Question created!' : '✅ Question updated!');
      setEditingQuestion(null);
      setOriginalQuestion(null);
      setIsCreatingNew(false);

      const newData = await fetch(`http://localhost:5000/api/questions/category/${selectedCategoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
      setQuestions(newData);
    } else {
      alert('❌ Failed to save question');
    }
  };

  const handleDelete = async () => {
    if (!editingQuestion?.id) return;
    if (!window.confirm('⚠️ Are you sure you want to delete this question?')) return;
    if (!window.confirm('This action is permanent. Confirm again to delete.')) return;

    const res = await fetch(`http://localhost:5000/api/questions/${editingQuestion.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });

    if (res.ok) {
      alert('🗑 Question deleted');
      setEditingQuestion(null);
      setOriginalQuestion(null);
      const newData = await fetch(`http://localhost:5000/api/questions/category/${selectedCategoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => res.json());
      setQuestions(newData);
    } else {
      alert('❌ Failed to delete question');
    }
  };

  const handleCreateNew = () => {
    setEditingQuestion({ text: '' });
    setOriginalQuestion({ text: '' });
    setIsCreatingNew(true);
  };

  return (
    <div className="edit-question-container">
      <div className="question-header">
        <h2>Edit Questions</h2>
        {selectedCategoryId && (
          <button className="create-btn" onClick={handleCreateNew}>
            <span role="img" aria-label="Add">➕</span> New Question
          </button>
        )}
      </div>

      <label>Select a Category:</label>
      <select
        value={selectedCategoryId}
        onChange={(e) => {
          setSelectedCategoryId(e.target.value);
          setEditingQuestion(null);
        }}
      >
        <option value="">-- Choose Category --</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>

      {selectedCategoryId && (
        <>
          <p className="click-instruction">Click a question to edit or delete it.</p>
          <ul className="question-list">
            {questions.map(q => (
              <li
                key={q.id}
                onClick={() => handleSelectQuestion(q)}
                className={editingQuestion?.id === q.id ? 'active' : ''}
              >
                {q.text}
              </li>
            ))}
          </ul>
        </>
      )}

      {editingQuestion && (
        <>
          <p className="unsaved-warning">
            <strong>Note:</strong> Refresh without submitting to discard changes.
          </p>
          <textarea
            value={editingQuestion.text}
            onChange={(e) => handleChange(e.target.value)}
            className={editingQuestion.text !== originalQuestion.text ? 'changed' : 'unchanged'}
          />
          <div className="form-buttons">
            <button className="submit-btn" onClick={handleSubmit}>✔ Save</button>
            {!isCreatingNew && (
              <button className="delete-btn" onClick={handleDelete}>
                <span role="img" aria-label="Delete">🗑</span> Delete
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default EditQuestion;
