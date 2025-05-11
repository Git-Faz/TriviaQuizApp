import { useState } from 'react';

const AddQuestion = ({ baseUrl, onQuestionAdded }) => {
  const [formData, setFormData] = useState({
    category: '',
    question_text: '',
    option_a: '',
    option_b: '',
    option_c: '',
    option_d: '',
    correct_option: 'A'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    fetch(`${baseUrl}/admin/add-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData),
      credentials: 'include'
    })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      setFormData({
        category: '',
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A'
      });
      onQuestionAdded();
    })
    .catch(err => console.error('Error:', err));
  };

  return (
    <>
      <h2 className="text-lg font-semibold mb-2 text-gray-200">Add New Question</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="category" className="block font-medium text-gray-300">Category:</label>
          <select 
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          >
            <option value="">Select Category</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Movies">Movies</option>
            <option value="GK">GK</option>
            <option value="Psychology">Psychology</option>
          </select>
        </div>

        <div>
          <label htmlFor="question_text" className="block font-medium text-gray-300">Question:</label>
          <textarea 
            id="question_text"
            name="question_text"
            value={formData.question_text}
            onChange={handleInputChange}
            rows="3"
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          ></textarea>
        </div>

        <div>
          <label htmlFor="option_a" className="block font-medium text-gray-300">Option A:</label>
          <input 
            type="text"
            id="option_a"
            name="option_a"
            value={formData.option_a}
            onChange={handleInputChange}
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          />
        </div>

        <div>
          <label htmlFor="option_b" className="block font-medium text-gray-300">Option B:</label>
          <input 
            type="text"
            id="option_b"
            name="option_b"
            value={formData.option_b}
            onChange={handleInputChange}
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          />
        </div>

        <div>
          <label htmlFor="option_c" className="block font-medium text-gray-300">Option C:</label>
          <input 
            type="text"
            id="option_c"
            name="option_c"
            value={formData.option_c}
            onChange={handleInputChange}
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          />
        </div>

        <div>
          <label htmlFor="option_d" className="block font-medium text-gray-300">Option D:</label>
          <input 
            type="text"
            id="option_d"
            name="option_d"
            value={formData.option_d}
            onChange={handleInputChange}
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          />
        </div>

        <div>
          <label htmlFor="correct_option" className="block font-medium text-gray-300">Correct Answer:</label>
          <select 
            id="correct_option"
            name="correct_option"
            value={formData.correct_option}
            onChange={handleInputChange}
            required 
            className="w-full border border-gray-700 p-2 rounded bg-[#2a2a2a] text-white"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Question
        </button>
      </form>
    </>
  );
};

export default AddQuestion;