import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import CategorySelection from './CategorySelection';
import Navbar from '../Layout/Navbar';
import neonBlue from '../../assets/neonBlue.avif';
import { API_URL } from '../../config';
import { useAuthContext } from '../../Context/AuthContext';

const HomePage = () => {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const { user, isAuthenticated } = useAuthContext();
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
  }, [location.search]);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const checkLoginAndStartQuiz = (category) => {
    if (isAuthenticated) {
      navigate(`/quiz/${encodeURIComponent(category)}`);
    } else {
      navigate(`/account?category=${encodeURIComponent(category)}`);
    }
  };

  return (
    <div
      className="flex flex-col justify-start items-center min-h-screen lg:bg-black/75 bg-blend-overlay bg-center bg-cover"
      style={{ backgroundImage: `url(${neonBlue})` }}
    >
      <div className="quiz-container my-auto p-4 sm:p-6 bg-gray-900 rounded-lg w-full max-w-full sm:max-w-[90%] md:max-w-[80%] lg:max-w-[75%] h-screen overflow-y-auto">
        <Navbar showManageQuiz={user?.role === 'admin'} />
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#3bc7ff] mb-2 sm:mb-4 h-fit py-2 text-center">
          Quizzone
        </h1>
        <h3 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white mt-4 mb-2 py-1 sm:mb-4 text-center">
          Trivia Challenge
        </h3>
        <p className="text-white mb-3 sm:mb-6 text-center text-sm sm:text-base">
          Test your knowledge across various topics and have fun!
        </p>
        <h3 className="text-base sm:text-lg text-white mb-2 sm:mb-4 text-center">Select a Category</h3>
        <CategorySelection
          onSelectCategory={handleCategorySelect}
          selectedCategory={selectedCategory}
        />
        <button
          id='startBtn'
          className={`w-full py-2 rounded font-bold text-white ${
            !selectedCategory ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
          }`}
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