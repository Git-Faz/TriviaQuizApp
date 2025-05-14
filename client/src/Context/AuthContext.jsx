// src/context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if the user is logged in on app load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_URL}/api/check-session`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        if (!response.ok) {
          throw new Error('Authentication check failed');
        }

        const data = await response.json();
        
        if (data.authenticated && data.user) {
          //console.log('User authenticated:', data.user);
          setUser(data.user);
        } else {
          console.log('No authenticated user');
          setUser(null);
        }
      } catch (err) {
        console.error('Auth check error:', err);
        setError(err.message);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }
      
      // Re-fetch user data to ensure we have the most current info
      const userResponse = await fetch(`${API_URL}/api/user`, {
        credentials: 'include'
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data after login');
      }
      
      const userData = await userResponse.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      setUser(null);
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const response = await fetch(`${API_URL}/api/user`, {
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh user data');
      }
      
      const userData = await response.json();
      setUser(userData);
      return userData;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        loading, 
        error, 
        login, 
        logout, 
        refreshUser 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;