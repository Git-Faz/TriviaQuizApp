const QuestionItem = ({ question, onDelete }) => {
    return (
      <div className="border border-gray-700 p-4 rounded">
        <p><strong>Question:</strong> {question.question_text}</p>
        <p><strong>A:</strong> {question.a}</p>
        <p><strong>B:</strong> {question.b}</p>
        <p><strong>C:</strong> {question.c}</p>
        <p><strong>D:</strong> {question.d}</p>
        <p><strong>Answer:</strong> {question.correct_option}</p>
        <button 
          className="mt-2 bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          onClick={() => onDelete(question.id)}
        >
          Delete
        </button>
      </div>
    );
  };
  
  export default QuestionItem;