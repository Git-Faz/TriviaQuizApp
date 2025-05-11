import { useState, useEffect } from 'react';
import { HomeBtn } from '../common/Button';
import AddQuestion from './AddQuestion';
import ViewQuestions from './ViewQuestions';
import { API_URL } from '../../config';

const AdminPanel = () => {
  const baseUrl = API_URL;
  const [questions, setQuestions] = useState([]);
  const [viewCategory, setViewCategory] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = () => {
    let url = `${baseUrl}/admin/view-questions`;

    if (viewCategory) {
      url += `?category=${encodeURIComponent(viewCategory)}`;
    }

    fetch(url, {
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (!Array.isArray(data)) {
          console.error('Unexpected response:', data);
          throw new Error('Invalid response format');
        }
        setQuestions(data);
      })
      .catch(err => console.error('Error:', err));
  };

  const handleDelete = (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      fetch(`${baseUrl}/admin/delete-question/${questionId}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      .then(response => response.json())
      .then(data => {
        alert(data.message);
        loadQuestions();
      })
      .catch(err => console.error('Error:', err));
    }
  };

  return (
    <div className="bg-black p-6">
      <HomeBtn />
      <div className="max-w-2xl mx-auto bg-[#202020] p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-white">Admin Panel - Manage Questions</h1>
        
        <AddQuestion baseUrl={baseUrl} onQuestionAdded={loadQuestions} />
      </div>

      <div className="max-w-2xl mx-auto bg-[#202020] p-6 mt-6 rounded-lg shadow-md">
        <ViewQuestions 
          questions={questions}
          viewCategory={viewCategory}
          setViewCategory={setViewCategory}
          loadQuestions={loadQuestions}
          handleDelete={handleDelete}
        />
      </div>
    </div>
  );
}

export default AdminPanel;
