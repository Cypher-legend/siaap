// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import UserCreationPage from './components/UserCreationPage';
import Planner from './components/planner';
import ChildrenTablePage from './components/ChildrenTablePage';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/planner" element={<Planner />} />
            <Route path="/admin/users" element={<UserCreationPage />} />
            <Route path="/program/children" element={<ChildrenTablePage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

export default App;