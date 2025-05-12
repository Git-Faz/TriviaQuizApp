import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategorySelection from './CategorySelection';
import Navbar from '../Layout/Navbar';
import neonBlue from '../../assets/neonBlue.jpg';
import { API_URL } from '../../config';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const redirectCategory = searchParams.get('category');
    if (redirectCategory) {
      setSelectedCategory(redirectCategory);
      checkLoginAndStartQuiz(redirectCategory);
      window.history.replaceState({}, document.title, location.pathname);
    }

    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include'
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.error) {
          setUserData(null);
          return;
        }
        setUserData(data);
      })
      .catch((error) => {
        console.error('Failed to fetch user data:', error);
        setUserData(null);
      });
  }, [location.search]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const checkLoginAndStartQuiz = (category) => {
    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include'
    })
      .then((response) => {
        if (!response.ok) throw new Error('Not logged in');
        return response.json();
      })
      .then((data) => {
        if (data.error || !data.user_id) {
          navigate(`/account?category=${encodeURIComponent(category)}`);
          return;
        }
        //const displayCategory = category === 'GK' ? 'General Knowledge' : category;
        navigate(`/quiz/${encodeURIComponent(category)}`);
      })
      .catch((error) => {
        navigate(`/account?category=${encodeURIComponent(category)}`);
        console.error('Failed to fetch user data:', error);
      });
  };

  return (
    <div
      className="flex flex-col justify-center items-center min-h-screen bg-black/75 bg-blend-overlay bg-center bg-cover"
      style={{ backgroundImage: `url(${neonBlue})` }}
    >
      <div className="quiz-container my-auto p-6 bg-gray-900 rounded-lg md:w-1/2 sm:w-3/4 w-11/12 h-screen">
        <Navbar userData={userData} showManageQuiz={userData?.role === 'admin'} />
        <h1 className="text-6xl font-bold text-[#3bc7ff] mb-4 text-center md:text-8xl">Trivia Challenge</h1>
        <p className="text-white mb-6 text-center md:text-2xl">
          Test your knowledge across various topics and have fun!
        </p>
        <h3 className="text-lg text-white mb-4 text-center md:text-3xl">Select a Category</h3>
        <CategorySelection
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
        <button
        id='startBtn'
          className={`w-full py-2 rounded font-bold text-white md:text-2xl`}
          disabled={!selectedCategory}
          onClick={() => checkLoginAndStartQuiz(selectedCategory)}
        >
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default HomePage;