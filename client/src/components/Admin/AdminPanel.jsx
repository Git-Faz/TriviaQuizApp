import { useState, useEffect } from 'react';
import { HomeBtn } from '../common/Button';
import AddQuestion from './AddQuestion';
import ViewQuestions from './ViewQuestions';
import { adminService } from '../../Services/ApiService';

const AdminPanel = () => {
  const [questions, setQuestions] = useState([]);
  const [viewCategory, setViewCategory] = useState('');

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      const data = await adminService.viewQuestions(viewCategory);
      setQuestions(data);
    } catch (err) {
      console.error('Error loading questions:', err);
    }
  };

  const handleDelete = async (questionId) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        const data = await adminService.deleteQuestion(questionId);
        alert(data.message);
        loadQuestions();
      } catch (err) {
        console.error('Error deleting question:', err);
      }
    }
  };

  return (
    <div className="bg-black p-6">
      <HomeBtn />
      <div className="max-w-2xl mx-auto bg-[#202020] p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4 text-white">Admin Panel - Manage Questions</h1>
        
        <AddQuestion onQuestionAdded={loadQuestions} />
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