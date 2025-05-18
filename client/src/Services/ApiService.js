import axios from 'axios';
import { API_URL } from '../config';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for adding token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 or 403 errors (unauthorized or forbidden)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Clear local storage and redirect to login if token is invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Only redirect to login if not already there
      if (!window.location.pathname.includes('/account')) {
        window.location.href = '/account';
      }
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  register: async (userData) => {
    const response = await api.post('/register', userData);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await api.post('/login', { email, password });
    return response.data;
  },
  
  validateToken: async () => {
    try {
      const response = await api.get('/api/check-token');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  
  getUserProfile: async () => {
    const response = await api.get('/api/user');
    return response.data;
  },
  
  updateProfile: async (userData) => {
    const response = await api.put('/api/update-profile', userData);
    return response.data;
  }
};

// Quiz services
export const quizService = {
  getQuestions: async (category) => {
    const response = await api.get(`/questions?category=${encodeURIComponent(category)}`);
    return response.data;
  },
  
  submitQuiz: async (quizData) => {
    const response = await api.post('/submit-quiz', quizData);
    return response.data;
  },
  
  getQuizResults: async (quizId) => {
    const response = await api.get(`/quiz-results/${quizId}`);
    return response.data;
  },
  
  getQuizStats: async () => {
    const response = await api.get('/quiz-stats');
    return response.data;
  }
};

// Admin services
export const adminService = {
  getQuestionsByCategory: async (category) => {
    const response = await api.get(`/admin/questions?category=${encodeURIComponent(category)}`);
    return response.data;
  },
  
  addQuestion: async (questionData) => {
    const response = await api.post('/admin/add-question', questionData);
    return response.data;
  },
  
  viewQuestions: async (category = null) => {
    let url = '/admin/view-questions';
    if (category) {
      url += `?category=${encodeURIComponent(category)}`;
    }
    const response = await api.get(url);
    return response.data;
  },
  
  deleteQuestion: async (questionId) => {
    const response = await api.delete(`/admin/delete-question/${questionId}`);
    return response.data;
  }
};

export default api;