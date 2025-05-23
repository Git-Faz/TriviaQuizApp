import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../Context/AuthContext';

const LoginForm = ({ toggleForms, redirectCategory }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      // Use the login function from context instead of direct fetch
      await login(formData.email, formData.password);
      
      // Navigate after successful login
      if (redirectCategory) {
        navigate(`/?category=${encodeURIComponent(redirectCategory)}`);
      } else {
        navigate('/');
      }
      
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your credentials and try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <h2 className="text-white text-center text-xl font-bold mb-6">Sign In</h2>
      
      {error && (
        <div className="mb-4 p-2 bg-red-700 text-white rounded text-sm">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="loginEmail" className="block mb-2 text-white font-bold">Email</label>
        <input 
          type="email" 
          id="loginEmail" 
          name="email" 
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="loginPassword" className="block mb-2 text-white font-bold">Password</label>
        <input 
          type="password" 
          id="loginPassword" 
          name="password" 
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <button 
        type="submit"
        className="font-bold bg-blue-500 hover:bg-blue-600 text-white p-3 border-none rounded w-full cursor-pointer mt-4"
      >
        Sign In
      </button>
      
      <div className="flex items-center justify-center text-center mt-4">
        Don't have an account?{" "}
        <a 
          href="#registerForm" 
          onClick={(e) => {
            e.preventDefault();
            toggleForms();
          }}
          className="ml-1 text-blue-500 font-semibold no-underline hover:underline"
        >
          Register
        </a>
      </div>
    </form>
  );
};

export default LoginForm;