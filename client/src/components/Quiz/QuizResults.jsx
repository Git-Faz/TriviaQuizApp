import React from 'react';
import { HomeBtn, LogoutBtn } from '../common/Button';
const QuizResults = ({ quizResults, userAnswers, questions }) => {
  if (!quizResults || !questions.length) {
    return (
      <div className="text-red-400 text-center">
        No results available. Please try again.
      </div>
    );
  }

  const scorePercentage = ((quizResults.score / quizResults.total) * 100).toFixed(1);
  const bgColor =
    scorePercentage >= 80 ? 'bg-green-600' : scorePercentage >= 60 ? 'bg-yellow-600' : 'bg-red-600';

  return (
    <div className="results-container">
      <div className='flex flex-row justify-between h-auto align-center items-center mb-4 mt-4 py-4'>
        <div className={`p-3 w-[100%] h-fit flex flex-row justify-between items-center rounded-lg text-center border-2 border-gray-700 ${bgColor} mb-auto`}>
          <h2 className="text-2xl font-bold text-white mb-2 ">Quiz Results</h2>
          <p className="text-xl text-white">
            Score: <span className="font-bold">{quizResults.score}/{quizResults.total}</span> ({scorePercentage}%)
          </p>
        </div>
        <HomeBtn /> 
        <LogoutBtn />
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