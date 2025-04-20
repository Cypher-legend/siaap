import React, { useEffect, useState } from 'react';
import './SessionAnswersPage.css';
import { useNavigate, useLocation } from 'react-router-dom';

const SessionAnswersPage = () => {
  const { state } = useLocation();
  const { session, child } = state || {};
  const sessionId = session?.id;
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  const [questionsByCategory, setQuestionsByCategory] = useState({});
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState({});

  useEffect(() => {
    const fetchQuestions = async () => {
      const res = await fetch('http://localhost:5000/api/questions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const grouped = data.reduce((acc, question) => {
        if (!acc[question.category]) acc[question.category] = [];
        acc[question.category].push(question);
        return acc;
      }, {});
      setQuestionsByCategory(grouped);
    };

    const fetchAnswers = async () => {
      const res = await fetch(`http://localhost:5000/api/answers/${sessionId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const answerMap = {};
      data.forEach(ans => (answerMap[ans.question_id] = ans.answer_value));
      setAnswers(answerMap);
      setSubmitted(answerMap);
    };

    if (sessionId) {
      fetchQuestions();
      fetchAnswers();
    }
  }, [sessionId, token]);

  const handleAnswerChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: parseInt(value) }));
  };

  const handleSubmitAll = async () => {
    const changed = Object.entries(answers).filter(
      ([id, val]) => submitted[id] !== parseInt(val)
    );

    for (const [questionId, value] of changed) {
      await fetch('http://localhost:5000/api/answers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: questionId,
          answer_value: value
        })
      });
    }

    alert('✅ Answers submitted');
    setSubmitted({ ...answers });
  };

  const handleCompleteSession = async () => {
    const allQuestions = Object.values(questionsByCategory).flat();
    const unanswered = allQuestions.some(q => submitted[q.id] === undefined);

    if (unanswered && !window.confirm('⚠️ Some questions are unanswered. Are you sure you want to complete this session?')) {
      return;
    }

    try {
      await fetch(`http://localhost:5000/api/sessions/${sessionId}/complete`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Session marked as complete!');
      navigate('/program/session-management');
    } catch (err) {
      alert('Could not complete session');
    }
  };

  const hasUnsubmittedChanges = Object.keys(answers).some(
    (id) => answers[id] !== submitted[id]
  );

  return (
    <div className="session-answers-container">
      <div className="session-details-header">
        <h2>Answer Questions</h2>
        {child && session && (
          <p>
            Child: <strong>{child.first_name} {child.last_name}</strong><br />
            Session #: <strong>{session.child_session_num}</strong><br />
            Date: <strong>{session.date.slice(0, 10)}</strong>
          </p>
        )}
      </div>

      <p className="blurb">
        All questions are grouped by category. Select and edit answers, then submit them using the button below.  
        Submitted answers are green, unsaved edits are red.
      </p>

      {Object.entries(questionsByCategory).map(([category, qs]) => (
        <div key={category} className="category-section">
          <h3 className="category-header">{category}</h3>
          {qs.map((q) => {
            const submittedVal = submitted[q.id];
            const currentVal = answers[q.id] ?? '';
            const isSubmitted = submittedVal !== undefined;
            const isChanged = isSubmitted && (currentVal === '' || parseInt(currentVal) !== submittedVal);

            return (
              <div
                key={q.id}
                className={`question-row ${isSubmitted ? 'answered' : ''} ${isChanged ? 'changed' : ''}`}
              >
                <span className="question-text">{q.text}</span>
                <select
                  value={currentVal}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  className="dropdown"
                >
                  <option value="">-- Select --</option>
                  <option value="1">Yes</option>
                  <option value="0">Maybe</option>
                  <option value="-1">No</option>
                </select>
              </div>
            );
          })}
        </div>
      ))}
      <div className="answer-actions">
        <div className="left-actions">
          {hasUnsubmittedChanges && (
            <button className="submit-btn" onClick={handleSubmitAll}>Submit Answers</button>
          )}
        </div>
        <div className="right-actions">
          <button className="complete-btn" onClick={handleCompleteSession}>
            Complete Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionAnswersPage;
