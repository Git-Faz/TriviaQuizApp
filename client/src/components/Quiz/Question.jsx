import React, { useState, useEffect } from 'react';

const Question = ({ question, index, onSelectAnswer, selectedOption, quizSubmitted }) => {
  // State to store shuffled options
  const [options, setOptions] = useState([]);

  // Shuffle options when component mounts or question changes
  useEffect(() => {
    const opts = [
      { value: 'A', text: question.a },
      { value: 'B', text: question.b },
      { value: 'C', text: question.c },
      { value: 'D', text: question.d }
    ];
    // Fisher-Yates shuffle
    for (let i = opts.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [opts[i], opts[j]] = [opts[j], opts[i]];
    }
    setOptions(opts);
  }, [question.id]); // Run only when question.id changes

  const handleOptionChange = (e) => {
    if (!quizSubmitted) {
      onSelectAnswer(question.id, index, e.target.value);
    }
  };

  // Classes for result highlighting
  const getOptionClasses = (option) => {
    if (!quizSubmitted) return 'text-white';
    const isSelected = selectedOption === option.value;
    const isCorrect = option.value === question.correct_option;
    if (isSelected && isCorrect) {
      return 'bg-green-100 text-black p-2 rounded border-2 border-green-500 block my-1';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 text-black p-2 rounded border-2 border-red-500 block my-1';
    }
    if (!isSelected && isCorrect) {
      return 'bg-green-100 text-black p-2 rounded border-2 border-green-500 block my-1';
    }
    return 'text-white';
  };

  return (
    <div className="question mb-4 sm:mb-6 p-3 sm:p-4 shadow-[0_2px_5px_#3bc7ff] rounded-lg border-b-4 border-[#3bc7ff]" data-question-id={question.id}>
      <h3 className="text-lg sm:text-xl font-bold text-white mb-2">
        {index + 1}. {question.question_text}
      </h3>
      <div className="space-y-2">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center ${getOptionClasses(option)} cursor-pointer text-sm sm:text-base`}
          >
            <input
              type="radio"
              name={`q${question.id}`}
              value={option.value}
              checked={selectedOption === option.value}
              onChange={handleOptionChange}
              disabled={quizSubmitted}
              className="mr-2 text-blue-500 focus:ring-blue-500"
            />
            <span>{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default Question;