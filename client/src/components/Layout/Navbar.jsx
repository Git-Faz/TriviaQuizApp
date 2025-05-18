import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';

const Navbar = ({ showManageQuiz = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useContext(AuthContext);

  const isHomePage = location.pathname === '/';

  const handleProfileClick = () => {
    if (isHomePage) {
      if (!isAuthenticated) {
        navigate('/account');
      } else {
        navigate('/userProfile');
      }
    } else {
      navigate('/');
    }
  };

  const handleManageQuizClick = () => {
    navigate('/admin');
  };

  const handleLogoutClick = async () => {
    try {
      await logout();
      navigate('/account');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const profileButtonText = isHomePage
    ? user?.username
      ? `Welcome, ${user.username}`
      : 'My Profile'
    : 'Home';

  return (
    <div className="flex justify-between items-center p-2.5 mb-8 w-full">
      <button
        className="flex p-1.5 justify-center items-center text-center box-border rounded-md
        border-solid w-fit h-fit border-2 border-green-600 text-green-600 font-bold hover:bg-green-600 hover:text-white hover:font-bold cursor-pointer"
        onClick={handleProfileClick}
      >
        {profileButtonText}
      </button>

      {showManageQuiz && user?.role === 'admin' && (
        <button 
          className="btn p-1.5 justify-center items-center text-center box-border content-center rounded-md cursor-pointer
          border-solid border-2 border-gray-500 h-fit w-fit hover:bg-gray-200 text-white font-bold hover:font-bold hover:text-black flex"
          onClick={handleManageQuizClick}
        >
          Manage Quiz
        </button>
      )}

      {isAuthenticated && (
        <button
          className="flex p-1.5 justify-center items-center text-center box-border rounded-md
          border-solid border-2 border-red-700 h-fit w-fit sm:h-16 hover:bg-red-700 text-red-700 font-bold hover:font-bold hover:text-white cursor-pointer"
          onClick={handleLogoutClick}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Navbar;
