import { useState, useEffect } from "react";
import Navbar from "../Layout/Navbar";

const QuizResults = ({ quizResults, userAnswers, questions, isLoading = false }) => {
  // Local loading state
  const [loading, setLoading] = useState(isLoading);
  
  // Update loading state when props change
  useEffect(() => {
    setLoading(isLoading);
  }, [isLoading]);

  // Show loading spinner when results are being calculated
  if (loading) {
    return (
      <div className="w-full">
        <div className="flex flex-col items-center justify-center py-10">
          <div className="w-16 h-16 border-t-4 border-[#3bc7ff] border-solid rounded-full animate-spin"></div>
          <p className="mt-4 text-xl text-white">Calculating your quiz results...</p>
        </div>
      </div>
    );
  }

  // Show error message if results are not available
  if (!quizResults || !questions.length) {
    return (
      <div className="w-full">
        <div className="text-red-400 text-center my-6">
          No results available. Please try again.
        </div>
      </div>
    );
  }

  const scorePercentage = ((quizResults.score / quizResults.total) * 100).toFixed(1);
  const bgColor =
    scorePercentage >= 80 ? 'bg-green-600' : scorePercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600';

  return (
    <div className="results-container">
      <div className='flex flex-col justify-between h-auto align-center items-center mb-4 mt-4 py-4'>
        <Navbar/>
        <div className={`p-3 w-full h-fit flex flex-row justify-between items-center rounded-lg text-center border-2 border-gray-700 ${bgColor} mb-auto`}>
          <h2 className="text-2xl font-bold text-white mb-2">Quiz Results</h2>
          <p className="text-xl text-white">
            Score: <span className="font-bold">{quizResults.score}/{quizResults.total}</span> ({scorePercentage}%)
          </p>
        </div>
      </div>
      {questions.map((question, index) => {
        const answer = userAnswers.find((a) => a.question_id === question.id);
        const isCorrect = answer?.is_correct;
        const selectedOption = answer?.selected_option;
        const correctOption = answer?.correct_option || question.correct_option;

        return (
          <div key={question.id} className="mb-6 p-4 bg-gray-800 rounded-lg text-left">
            <h3 className="text-lg font-bold text-white mb-2">
              {index + 1}. {question.question_text}
            </h3>
            <div className="space-y-2">
              {['A', 'B', 'C', 'D'].map((option) => {
                const optionText = question[option.toLowerCase()];
                const isSelected = selectedOption === option;
                const isCorrectOption = correctOption === option;
                const classes = isSelected && isCorrect
                  ? 'bg-green-100 text-black p-2 rounded border-2 border-green-500'
                  : isSelected && !isCorrect
                    ? 'bg-red-100 text-black p-2 rounded border-2 border-red-500'
                    : isCorrectOption
                      ? 'bg-green-100 text-black p-2 rounded border-2 border-green-500'
                      : 'text-white';

                return (
                  <div key={option} className={classes}>
                    {option}: {optionText}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default QuizResults;