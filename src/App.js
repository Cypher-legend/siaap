// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import UserCreationPage from './components/UserCreationPage';
import Planner from './components/planner';
import ChildrenTablePage from './components/ChildrenTablePage';
import QuestionTablePage from './components/QuestionTablePage';
import CreateSessionPage from './components/CreateSessionPage';
import SessionAnswersPage from './components/SessionAnswersPage';
import EditChild from './components/EditChild';
import EditQuestion from './components/EditQuestion'; 
import VisualizationsPage from './components/VisualizationsPage';




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
            <Route path="/program/questions" element={<QuestionTablePage />} />
            <Route path="/program/session-management" element={<CreateSessionPage />} />
            <Route path="/session-answers" element={<SessionAnswersPage />} />
            <Route path="/program/edit-child" element={<EditChild />} />
            <Route path="/program/edit-questions" element={<EditQuestion />} />
            <Route path="/admin/visualizations" element={<VisualizationsPage />} />
          </Route>
        </Routes>
      </div>
    </Router>
  );
}

const originalFetch = window.fetch;

window.fetch = async (...args) => {
  const res = await originalFetch(...args);
  const contentType = res.headers.get("Content-Type");

  if (contentType && contentType.includes("application/json")) {
    return res; // valid JSON response, let it pass through
  }

  // For everything else (HTML, etc.), clone before reading
  const cloned = res.clone();
  const text = await cloned.text();

  console.warn('⚠️ Received non-JSON response from:', args[0], '\nContent preview:\n', text.slice(0, 200));

  return res; // return original response (unconsumed)
};


export default App;