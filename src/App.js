// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import RegistrationPage from './components/RegistrationPage';
import Dashboard from './components/Dashboard';
import ReferralForm from './components/ReferralForm';
import LeaveApplication from './components/LeaveApplication';
import Planner from './components/planner';
import Progress from './components/progress';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/referral" element={<ReferralForm />} />
          <Route path="/admin/leave" element={<LeaveApplication />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/progress" element={<Progress />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;