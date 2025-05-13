import { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Question from './Question';
import QuizResults from './QuizResults';
import neonBlue from '../../assets/neonBlue.avif';
import { AuthContext } from '../../Context/AuthContext';
import { API_URL } from '../../config';

const QuizPage = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useContext(AuthContext);
  
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState([]);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(5 * 60);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);

  const decodedCategory = decodeURIComponent(category);
  const displayCategory = decodedCategory === 'GK' ? 'General Knowledge' : decodedCategory;

  // Check authentication first before fetching questions
  useEffect(() => {
    if (!authLoading && !user) {
      setError('Please log in to take the quiz');
      navigate(`/account?category=${encodeURIComponent(decodedCategory)}`);
    }
  }, [authLoading, user, navigate, decodedCategory]);

  const fetchQuestions = useCallback(async () => {
    // Don't fetch if user isn't authenticated yet
    if (authLoading || !user) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/questions?category=${encodeURIComponent(decodedCategory)}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError('Please log in to take the quiz');
          navigate(`/account?category=${encodeURIComponent(decodedCategory)}`);
          return;
        }
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      if (data.length === 0) {
        setError('No questions available for this category');
        setTimeout(() => navigate('/'), 3000);
        return;
      }

      const shuffledQuestions = [...data].sort(() => Math.random() - 0.5).slice(0, 20);
      setQuestions(shuffledQuestions);
      setIsLoading(false);
    } catch (err) {
      setError(`Failed to load questions: ${err.message}`);
      setIsLoading(false);
    }
  }, [decodedCategory, navigate, user, authLoading]);

  useEffect(() => {
    fetchQuestions();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchQuestions]);

  useEffect(() => {
    if (!isLoading && questions.length > 0 && !quizSubmitted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoading, questions.length, quizSubmitted]);

  const handleAnswerSelect = useCallback((questionId, questionIndex, selectedOption) => {
    setUserAnswers((prev) => {
      const newAnswers = [...prev];
      const existingIndex = newAnswers.findIndex((a) => a.question_id === questionId);
      if (existingIndex !== -1) {
        newAnswers[existingIndex] = { ...newAnswers[existingIndex], selected_option: selectedOption };
      } else {
        newAnswers.push({ question_id: questionId, index: questionIndex, selected_option: selectedOption });
      }
      return newAnswers;
    });
  }, []);

  const submitQuiz = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (userAnswers.length !== questions.length) {
      // eslint-disable-next-line no-undef
      alert(`Please answer all ${questions.length} questions`);
      return;
    }

    const quiz_id = `quiz-${Date.now()}`;
    try {
      const response = await fetch(`${API_URL}/submit-quiz`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          quiz_id,
          category: decodedCategory,
          answers: userAnswers.map(({ question_id, selected_option }) => ({
            question_id,
            selected_option
          }))
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          navigate(`/account?category=${encodeURIComponent(decodedCategory)}`);
          return;
        }
        throw new Error('Failed to submit quiz');
      }

      const data = await response.json();
      setQuizResults(data);
      setQuizSubmitted(true);
      fetchQuizResults(data.quiz_id);
    } catch (err) {
      setError(`Failed to submit quiz: ${err.message}`);
    }
  }, [decodedCategory, navigate, questions.length, userAnswers]);

  const fetchQuizResults = useCallback(async (quizId) => {
    try {
      const response = await fetch(`${API_URL}/quiz-results/${quizId}`, {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Failed to fetch results');

      const resultsData = await response.json();
      const resultsMap = {};
      resultsData.forEach((result) => {
        resultsMap[result.id] = result;
      });

      setUserAnswers((prev) =>
        prev.map((answer) => {
          const result = resultsMap[answer.question_id];
          return result ? { ...answer, is_correct: result.is_correct, correct_option: result.correct_option } : answer;
        })
      );
    } catch (err) {
      setError(`Failed to load results: ${err.message}`);
    }
  }, []);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
    return (
      <div 
        className="flex flex-row justify-center m-0 min-h-screen bg-black/75 bg-blend-overlay bg-center bg-cover bg-repeat-y py-8 overflow-auto"
        style={{ backgroundImage: `url(${neonBlue})` }}
      >
        <div className="w-full max-w-3xl">
          <div className="quiz-container bg-black text-white shadow-[0_0_10px_#3bc7ff] rounded-lg w-full h-fit p-[20px_30px] text-center">
            <h2 className="text-2xl font-bold text-[#3bc7ff]">Checking authentication...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex flex-row justify-center m-0 min-h-screen bg-black/75 bg-blend-overlay bg-center bg-cover bg-repeat-y py-8 overflow-auto"
        style={{ backgroundImage: `url(${neonBlue})` }}
      >
        <div className="w-full max-w-3xl">
          <div className="quiz-container bg-black text-white shadow-[0_0_10px_#3bc7ff] rounded-lg w-full h-fit p-[20px_30px] text-center">
            <h2 className="text-2xl font-bold text-[#3bc7ff] mb-2">Error</h2>
            <p className="mb-4">{error}</p>
            <button
              className="py-2 px-5 font-bold text-black bg-[#ccf0ff] hover:bg-[#3bc7ff] hover:text-white rounded-md"
              onClick={() => navigate('/')}
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div 
        className="flex flex-row justify-center m-0 min-h-screen bg-black/75 bg-blend-overlay bg-center bg-cover bg-repeat-y py-8 overflow-auto"
        style={{ backgroundImage: `url(${neonBlue})` }}
      >
        <div className="w-full max-w-3xl">
          <div className="quiz-container bg-black text-white shadow-[0_0_10px_#3bc7ff] rounded-lg w-full h-fit p-[20px_30px] text-center">
            <h2 className="text-2xl font-bold text-[#3bc7ff]">Loading {displayCategory} Quiz...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="flex flex-row justify-center m-0 min-h-screen bg-black/75 bg-blend-overlay bg-center bg-cover bg-repeat-y py-8 overflow-auto"
      style={{ backgroundImage: `url(${neonBlue})` }}
    >
      <div className="w-full max-w-3xl">
        {!quizSubmitted ? (
          <div className="quiz-container bg-black text-white shadow-[0_0_10px_#3bc7ff] rounded-lg w-full h-fit p-4 sm:p-[20px_30px] text-center">
            <div className="fixed flex flex-shrink flex-wrap top-2 right-2 w-fit text-base sm:text-lg font-bold text-center bg-[#3bc7ff] text-black px-2 sm:px-3 py-1 border-2 border-black rounded-md z-20">
              Time Left: {formatTime(timeLeft)}
            </div>
            <div className="quiz-heading">
              <h2 className="mr-2 w-full text-black bg-[#3bc7ff] text-2xl flex justify-center py-2.5 px-5 rounded-md font-bold">{displayCategory} Quiz</h2>
              <div className="flex justify-between items-center mt-2">
                <button
                  className="ml-2 text-green-500 bg-black border-green-500 border-2 hover:bg-green-500 hover:text-black text-lg flex justify-center py-2.5 px-5 rounded-md font-bold"
                  onClick={() => navigate('/')}
                >
                  Home
                </button>
              </div>
            </div>
            <div className="space-y-6">
              {questions.map((question, index) => (
                <Question
                  key={question.id}
                  question={question}
                  index={index}
                  onSelectAnswer={handleAnswerSelect}
                  selectedOption={userAnswers.find((a) => a.question_id === question.id)?.selected_option}
                  quizSubmitted={quizSubmitted}
                />
              ))}
            </div>
            <button
              className="m-0 mt-8 py-2 px-5 font-bold text-black bg-[#ccf0ff] hover:bg-[#3bc7ff] hover:text-white rounded-md w-full"
              onClick={submitQuiz}
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <div className="quiz-container bg-black text-white shadow-[0_0_10px_#3bc7ff] rounded-lg w-full h-fit p-[20px_30px] text-center">
            <QuizResults quizResults={quizResults} userAnswers={userAnswers} questions={questions} />
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;