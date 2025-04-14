// QuestionsTablePage.js
import React, { useEffect, useState } from 'react';
import './QuestionTablePage.css';

const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const QuestionsTablePage = () => {
  const [questions, setQuestions] = useState([]);
  const [sortedQuestions, setSortedQuestions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/questions', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setQuestions(data);
        setSortedQuestions(data);
      } catch (err) {
        console.error('Error fetching questions:', err);
      }
    };

    fetchQuestions();
  }, [token]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...sortedQuestions].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedQuestions(sorted);
    setSortConfig({ key, direction });
  };

  const getArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '↕';
  };

  const resetFilters = () => {
    setSortedQuestions(questions);
    setSearchTerm('');
    setSortConfig({ key: '', direction: '' });
  };

  const filteredQuestions = sortedQuestions.filter(
    (q) =>
      q.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (q.category && q.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="questions-table-container">
      <div className="search-bar">
        <label htmlFor="search">Search database for all question text and categories:</label>
        <input
          id="search"
          type="text"
          placeholder="Enter keyword..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="questions-table-header">
        <h2>Questions</h2>
        <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
      </div>

      <table className="questions-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID {getArrow('id')}</th>
            <th onClick={() => handleSort('text')}>Question {getArrow('text')}</th>
            <th onClick={() => handleSort('category')}>Category {getArrow('category')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredQuestions.map((q) => (
            <tr key={q.id}>
              <td>{q.id}</td>
              <td dangerouslySetInnerHTML={{ __html: highlightMatch(q.text, searchTerm) }} />
              <td dangerouslySetInnerHTML={{ __html: highlightMatch(q.category || '', searchTerm) }} />
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default QuestionsTablePage;
