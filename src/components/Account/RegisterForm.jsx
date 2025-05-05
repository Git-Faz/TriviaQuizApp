import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const RegisterForm = ({ toggleForms }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 8) {
      alert("Password length must be greater than 8");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    
    try {
      const response = await fetch('http://localhost:3001/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password
        }),
        credentials: 'include'
      });
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      alert("Registered successfully");
      navigate('/');
      
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="text-white">
      <h2 className="text-white text-center text-xl font-bold mb-6">Create Account</h2>
      
      <div className="mb-4">
        <label htmlFor="registerName" className="block mb-2 text-white font-bold">Username</label>
        <input 
          type="text" 
          id="registerName" 
          name="username" 
          required
          value={formData.username}
          onChange={handleChange}
          className="w-full p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="registerEmail" className="block mb-2 text-white font-bold">Email</label>
        <input 
          type="email" 
          id="registerEmail" 
          name="email" 
          required
          value={formData.email}
          onChange={handleChange}
          className="w-full p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="registerPassword" className="block mb-2 text-white font-bold">Password</label>
        <input 
          type="password" 
          id="registerPassword" 
          name="password" 
          required
          value={formData.password}
          onChange={handleChange}
          className="w-full p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <div className="mb-4">
        <label htmlFor="confirmPassword" className="block mb-2 text-white font-bold">Confirm Password</label>
        <input 
          type="password" 
          id="confirmPassword" 
          name="confirmPassword" 
          required
          value={formData.confirmPassword}
          onChange={handleChange}
          className="w-full p-2 rounded-md bg-black text-white border border-[#3bc7ff] focus:outline-none focus:border-blue-500"
        />
      </div>
      
      <button 
        type="submit"
        id="submitBtn"
        className="font-bold bg-blue-500 hover:bg-blue-600 text-white p-3 border-none rounded w-full cursor-pointer mt-4"
      >
        Register
      </button>
      
      <div className="flex items-center justify-center text-center mt-4">
        Already have an account?{" "}
        <a 
          href="#loginForm" 
          onClick={(e) => {
            e.preventDefault();
            toggleForms();
          }}
          className="ml-1 text-blue-500 font-semibold no-underline hover:underline"
        >
          Sign In
        </a>
      </div>
    </form>
  );
};

export default RegisterForm;