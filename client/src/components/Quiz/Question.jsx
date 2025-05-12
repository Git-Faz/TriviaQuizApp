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
      return 'bg-green-100 text-black p-2 rounded-md border-2 border-green-500 block my-1 sm:my-2 md:my-3 lg:my-4 xl:my-5';
    }
    if (isSelected && !isCorrect) {
      return 'bg-red-100 text-black p-2 rounded-md border-2 border-red-500 block my-1 sm:my-2 md:my-3 lg:my-4 xl:my-5';
    }
    if (!isSelected && isCorrect) {
      return 'bg-green-100 text-black p-2 rounded-md border-2 border-green-500 block my-1 sm:my-2 md:my-3 lg:my-4 xl:my-5';
    }
    return 'text-white';
  };

  return (
    <div className="question mb-6 p-4 shadow-lg rounded-lg border-b-4 border-[#3bc7ff] md:p-6 lg:p-8 xl:p-10">
      <h3 className="text-xl font-bold text-white mb-2 md:mb-4 lg:mb-6 xl:mb-8">
        {index + 1}. {question.question_text}
      </h3>
      <div className="space-y-2 md:space-y-4 lg:space-y-6 xl:space-y-8">
        {options.map((option) => (
          <label
            key={option.value}
            className={`flex items-center ${getOptionClasses(option)} cursor-pointer`}
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
