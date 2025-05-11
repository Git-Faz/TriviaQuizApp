import QuestionItem from './QuestionItem';

const ViewQuestions = ({ questions, viewCategory, setViewCategory, loadQuestions, handleDelete }) => {
  return (
    <>
      <h2 className="text-lg font-semibold mb-2 text-gray-200">View Questions</h2>
      
      <div className="mb-4">
        <label htmlFor="viewCategory" className="block font-medium text-gray-300">Select Category:</label>
        <select 
          id="viewCategory"
          value={viewCategory}
          onChange={(e) => setViewCategory(e.target.value)}
          className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
        >
          <option value="">All Categories</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Movies">Movies</option>
          <option value="GK">GK</option>
          <option value="Psychology">Psychology</option>
        </select>
        <button 
          onClick={loadQuestions} 
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          View Questions
        </button>
      </div>

      <div className="space-y-4 text-white">
        {questions.length === 0 ? (
          <p>No questions found.</p>
        ) : (
          questions.map(question => (
            <QuestionItem 
              key={question.id} 
              question={question} 
              onDelete={handleDelete} 
            />
          ))
        )}
      </div>
    </>
  );
};

export default ViewQuestions;