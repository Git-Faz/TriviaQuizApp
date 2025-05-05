import React from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = ({ userData, showManageQuiz = false }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    fetch('http://localhost:3001/api/user', {
      method: 'GET',
      credentials: 'include'
    })
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (data.error) {
          console.error('Profile fetch failed:', data.error);
          alert('Please log in to view your profile');
          navigate('/account');
          return;
        }
        navigate('/userProfile');
      })
      .catch(error => {
        console.error('Could not load user profile:', error);
        alert('Error loading profile: ' + error.message);
        navigate('/account');
      });
  };

  const handleManageQuizClick = () => {
    navigate('/admin');
  };

  const handleLogoutClick = () => {
    fetch('http://localhost:3001/logout', {
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
        navigate('/account');
      });
  };

  return (
    <div className="flex justify-between items-center p-2.5 mb-8 w-full">
      <button
        className="flex py-2 px-3.5 justify-center items-center text-center box-border rounded-md
        border-solid h-9 w-fit border-2 border-green-600 text-green-600 font-bold hover:bg-green-600 hover:text-white hover:font-bold cursor-pointer"
        onClick={handleProfileClick}
      >
        {userData?.username ? `Welcome, ${userData.username}` : 'My Profile'}
      </button>
      
      {showManageQuiz && (
        <button 
          className="btn py-2 px-3.5 justify-center items-center text-center box-border content-center rounded-md cursor-pointer
          border-solid border-2 border-gray-500 h-9 w-fit hover:bg-gray-200 text-white font-bold hover:font-bold hover:text-black flex"
          onClick={handleManageQuizClick}
        >
          Manage Quiz
        </button>
      )}
      
      <button
        className="flex py-2 px-3.5 justify-center items-center text-center box-border rounded-md
        border-solid border-2 border-red-700 h-9 w-fit hover:bg-red-700 text-red-700 font-bold hover:font-bold hover:text-white cursor-pointer"
        onClick={handleLogoutClick}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;