import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/Home/HomePage';
import AccountPage from './components/Account/AccountPage';
import QuizPage from './components/Quiz/QuizPage';
import UserProfile from './components/UserProfile/UserProfile';
import AdminPanel from './components/Admin/AdminPanel';


const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<AccountPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/quiz/:category" element={<QuizPage />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/logout" element={<AccountPage />} />
        <Route path="*" element={<HomePage />} />
      </Routes>
    </Router>
  );
}

export default App;