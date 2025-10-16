import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo instance axios
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true,
});

export const setAuthToken = (token) => {
  if (token) {
    instance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete instance.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

export const verifyToken = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await instance.get('/auth/verify-token');
    return response.data.valid;
  } catch (error) {
    console.error('Token verification failed:', error);
    return false;
  }
};

export default {
  setAuthToken,
  verifyToken
}; 