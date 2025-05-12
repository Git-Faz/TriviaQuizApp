import React from 'react';
import { useNavigate } from 'react-router-dom';
import {API_URL} from '../../config';

const Navbar = ({ userData, showManageQuiz = false }) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    fetch(`${API_URL}/api/user`, {
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
  fetch(`${API_URL}/logout`, {
    method: 'POST',  // FIXED: Changed from GET to POST
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (!response.ok) throw new Error('Logout failed');
      return response.json();
    })
    .then(() => {
      // Clear any local storage or state related to authentication
      // For example, if you're using localStorage:
      localStorage.removeItem('user');
      
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
    <div className="flex flex-col sm:flex-row justify-between items-center p-2 mb-4 sm:mb-8 w-full gap-2">
      <button
        className="flex py-2 px-3.5 justify-center items-center text-center box-border rounded-md
        border-solid h-9 w-full sm:w-fit border-2 border-green-600 text-green-600 font-bold hover:bg-green-600 hover:text-white hover:font-bold cursor-pointer"
        onClick={handleProfileClick}
      >
        {userData?.username ? `Welcome, ${userData.username}` : 'My Profile'}
      </button>
      
      {showManageQuiz && (
        <button 
          className="btn py-2 px-3.5 justify-center items-center text-center box-border content-center rounded-md cursor-pointer
          border-solid border-2 border-gray-500 h-9 w-full sm:w-fit hover:bg-gray-200 text-white font-bold hover:font-bold hover:text-black flex"
          onClick={handleManageQuizClick}
        >
          Manage Quiz
        </button>
      )}
      
      <button
        className="flex py-2 px-3.5 justify-center items-center text-center box-border rounded-md
        border-solid border-2 border-red-700 h-9 w-full sm:w-fit hover:bg-red-700 text-red-700 font-bold hover:font-bold hover:text-white cursor-pointer"
        onClick={handleLogoutClick}
      >
        Logout
      </button>
    </div>
  );
};

export default Navbar;