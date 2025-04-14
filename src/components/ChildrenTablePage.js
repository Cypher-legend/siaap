import React, { useEffect, useState } from 'react';
import './ChildrenTablePage.css';

const highlightMatch = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const ChildrenTablePage = () => {
  const [children, setChildren] = useState([]);
  const [sortedChildren, setSortedChildren] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/children', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setChildren(data);
        setSortedChildren(data);
      } catch (err) {
        console.error('Error fetching children:', err);
      }
    };

    fetchChildren();
  }, [token]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }

    const sorted = [...sortedChildren].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    setSortedChildren(sorted);
    setSortConfig({ key, direction });
  };

  const getArrow = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '▲' : '▼';
    }
    return '↕';
  };

  const resetFilters = () => {
    setSortedChildren(children);
    setSearchTerm('');
    setSortConfig({ key: '', direction: '' });
  };

  const filteredChildren = sortedChildren.filter(
    (child) =>
      child.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      child.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="children-table-container">
      <div className="search-bar">
        <label htmlFor="search">Search database for all first and last names:</label>
        <input
          id="search"
          type="text"
          placeholder="Enter name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="children-table-header">
        <h2>Children</h2>
        <button className="reset-btn" onClick={resetFilters}>Reset Filters</button>
      </div>

      <table className="children-table">
        <thead>
          <tr>
            <th onClick={() => handleSort('id')}>ID {getArrow('id')}</th>
            <th onClick={() => handleSort('first_name')}>First Name {getArrow('first_name')}</th>
            <th onClick={() => handleSort('last_name')}>Last Name {getArrow('last_name')}</th>
            <th onClick={() => handleSort('dob')}>DOB {getArrow('dob')}</th>
            <th onClick={() => handleSort('age')}>Age {getArrow('age')}</th>
            <th onClick={() => handleSort('gender')}>Gender {getArrow('gender')}</th>
            <th onClick={() => handleSort('setlocation')}>Set Location {getArrow('setlocation')}</th>
          </tr>
        </thead>
        <tbody>
          {filteredChildren.map(child => (
            <tr key={child.id}>
              <td>{child.id}</td>
              <td dangerouslySetInnerHTML={{ __html: highlightMatch(child.first_name, searchTerm) }} />
              <td dangerouslySetInnerHTML={{ __html: highlightMatch(child.last_name, searchTerm) }} />
              <td>{child.dob.slice(0, 10)}</td>
              <td>{child.age}</td>
              <td>{child.gender}</td>
              <td>{child.setlocation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ChildrenTablePage;
