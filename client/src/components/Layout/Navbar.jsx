import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';
import logo from '../../assets/logocp.svg'; // Adjust the path as necessary

const Logo = ({ image, size = 4 }) => {
  return (
    <img 
      src={image} 
      alt="Quizzone Logo" 
      className={`w-${size * 4} h-${size * 4} object-contain`}
    />
  );
};

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
    <nav className="shadow-md border-b-4 border-[#3bc7ff] sticky top-0 z-50 relative">
      {/* Glowing line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 pb-0 bg-[#3bc7ff] shadow-[0_0_10px_#3bc7ff]"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo Section */}
          <div className="flex-shrink-0">
            {isHomePage && <Logo image={logo} size={3} />}
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <button
              className="px-4 py-2 text-sm font-medium text-green-600 border-2 border-green-600 rounded-md 
                       hover:bg-green-600 hover:text-white transition-colors duration-200 focus:outline-none 
                       focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              onClick={handleProfileClick}
            >
              {profileButtonText}
            </button>
            
            {showManageQuiz && user?.role === 'admin' && (
              <button 
                className="px-4 py-2 text-sm font-medium text-gray-700 border-2 border-gray-500 rounded-md 
                         hover:bg-gray-500 hover:text-white transition-colors duration-200 focus:outline-none 
                         focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
                onClick={handleManageQuizClick}
              >
                Manage Quiz
              </button>
            )}

            {isAuthenticated && (
              <button
                className="px-4 py-2 text-sm font-medium text-red-600 border-2 border-red-600 rounded-md 
                         hover:bg-red-600 hover:text-white transition-colors duration-200 focus:outline-none 
                         focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={handleLogoutClick}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
