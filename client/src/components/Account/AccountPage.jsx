import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import neonBlue from '../../assets/neonBlue.avif';

const AccountPage = () => {
  const [activeForm, setActiveForm] = useState('login');
  const location = useLocation();

  useEffect(() => {
    if (location.hash === '#registerForm') {
      setActiveForm('register');
    } else {
      setActiveForm('login');
    }
  }, [location.hash]);

  const toggleForms = () => {
    setActiveForm(activeForm === 'login' ? 'register' : 'login');
    window.history.replaceState(null, '', activeForm === 'login' ? '#registerForm' : '#loginForm');
  };

  const searchParams = new URLSearchParams(location.search);
  const category = searchParams.get('category');

  return (
    <div 
      className="font-sans bg-black/75 bg-blend-overlay bg-center bg-cover flex justify-center items-center h-screen m-0"
      style={{ backgroundImage: `url(${neonBlue})` }}
    >
      <div className="bg-black p-8 rounded-lg shadow-md w-full max-w-md">
        {activeForm === 'login' ? (
          <LoginForm 
            toggleForms={toggleForms} 
            redirectCategory={category} 
          />
        ) : (
          <RegisterForm 
            toggleForms={toggleForms} 
          />
        )}
      </div>
    </div>
  );
};

export default AccountPage;