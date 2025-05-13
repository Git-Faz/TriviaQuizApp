import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import UserInfo from './UserInfo';
import QuizStats from './QuizStats';
import EditUser from './EditUser';
import NavigationButtons from './NavigationButtons';
import neonBlue from '../../assets/neonBlue.avif';
import { API_URL } from '../../config';

const UserProfile = () => {
  const [showEditForm, setShowEditForm] = useState(false);
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });
  const [csStats, setCsStats] = useState({ attempts: 0, highScore: 0, average: 0 });
  const [gkStats, setGkStats] = useState({ attempts: 0, highScore: 0, average: 0 });
  const [moviesStats, setMoviesStats] = useState({ attempts: 0, highScore: 0, average: 0 });
  const [psychStats, setPsychStats] = useState({ attempts: 0, highScore: 0, average: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch user basic info
    fetch(`${API_URL}/api/user`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(data => {
      if (data.error) {
        navigate('/account');
        return;
      }
      setUserData({
        username: data.username || 'Unknown User',
        email: data.email || 'No email'
      });
      setFormData({
        username: data.username || '',
        email: data.email || '',
        password: ''
      });
    })
    .catch(error => {
      console.error('Failed to load user profile:', error);
      alert('Error loading profile: ' + error.message);
      navigate('/account');
    });

    // Fetch quiz statistics
    fetch(`${API_URL}/quiz-stats`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error('Network response was not ok');
      return response.json();
    })
    .then(stats => {
      if (!Array.isArray(stats)) throw new Error('Invalid data format');
      
      stats.forEach(stat => {
        switch(stat.category) {
          case 'Computer Science':
            setCsStats({
              attempts: stat.attempts || 0,
              highScore: stat.highScore || 0,
              average: stat.average || 0
            });
            break;
          case 'General Knowledge':
          case 'GK': // Map 'GK' to 'General Knowledge' for compatibility
            setGkStats({
              attempts: stat.attempts || 0,
              highScore: stat.highScore || 0,
              average: stat.average || 0
            });
            break;
          case 'Movies':
            setMoviesStats({
              attempts: stat.attempts || 0,
              highScore: stat.highScore || 0,
              average: stat.average || 0
            });
            break;
          case 'Psychology':
            setPsychStats({
              attempts: stat.attempts || 0,
              highScore: stat.highScore || 0,
              average: stat.average || 0
            });
            break;
        }
      });
    })
    .catch(error => {
      console.error('Failed to load quiz stats:', error);
      alert('Error loading stats: ' + error.message);
    });
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    fetch(`${API_URL}/api/update-profile`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
    })
    .then(response => {
      if (!response.ok) throw new Error('Update failed');
      return response.json();
    })
    .then(data => {
      setUserData({
        username: data.username,
        email: data.email
      });
      setShowEditForm(false);
      alert('Profile updated successfully!');
    })
    .catch(error => {
      console.error('Error updating profile:', error);
      alert('Failed to update profile: ' + error.message);
    });
  };

  const handleLogout = () => {
    fetch(`${API_URL}/logout`, {
      method: 'GET',
      credentials: 'include'
    })
    .then(response => {
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    })
    .then(() => {
      alert('Logged out!');
      navigate('/account');
    })
    .catch(error => {
      console.error('Logout failed:', error);
      alert('Logout failed: ' + error.message);
    });
  };

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-black/75 bg-blend-overlay bg-center bg-cover bg-repeat-y"
      style={{ backgroundImage: `url(${neonBlue})` }}
    >
      <div className="flex flex-col justify-evenly content-center w-fit h-fit bg-black text-white p-10 rounded-lg shadow-lg text-center">
        <UserInfo username={userData.username} email={userData.email} />

        <div className="mt-4">
          {!showEditForm ? (
            <button 
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-md transition"
              onClick={() => setShowEditForm(true)}
            >
              Edit Profile
            </button>
          ) : (
            <EditUser 
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              onCancel={() => setShowEditForm(false)}
            />
          )}
        </div>

        {!showEditForm && (
          <QuizStats 
            csStats={csStats}
            gkStats={gkStats}
            moviesStats={moviesStats}
            psychStats={psychStats}
          />
        )}

        <NavigationButtons 
          onDashboardClick={() => navigate('/')}
          onLogoutClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default UserProfile;