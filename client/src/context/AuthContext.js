import React, { createContext, useState, useEffect } from 'react';
import API from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('currentUser');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  console.log('AuthContext initialized. Current token:', token ? 'present' : 'null', 'loading:', loading);
  console.log('AuthContext: Initial currentUser state:', currentUser);

  // Check if user is logged in on first load or after token changes
  useEffect(() => {
    const verifyToken = async () => {
      if (!token) {
        console.log('AuthContext: No token found, setting loading to false.');
        setLoading(false);
        return;
      }

      console.log('AuthContext: Verifying token and fetching current user...');
      try {
        API.setAuthToken(token);
        const res = await API.getCurrentUser();
        // Ensure the full user object, including avatar, is set
        setCurrentUser(res.data);
        localStorage.setItem('currentUser', JSON.stringify(res.data)); // Persist full user data
        console.log('AuthContext: Token verified. User data re-fetched from API and stored:', res.data);
      } catch (err) {
        console.error("AuthContext: Token verification failed:", err);
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser'); // Clear invalid user data
        API.setAuthToken(null);
        setCurrentUser(null);
      } finally {
        setLoading(false);
        console.log('AuthContext: Loading set to false after verification.');
      }
    };

    verifyToken();
  }, [token]);

  // Login function
  const login = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', user.role);
    localStorage.setItem('currentUser', JSON.stringify(user)); // Store full user object on login
    API.setAuthToken(token);
    setCurrentUser(user);
    setLoading(false);
    console.log('AuthContext: Login successful. User stored in localStorage:', user);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('currentUser'); // Clear user data on logout
    API.setAuthToken(null);
    setCurrentUser(null);
    console.log('AuthContext: Logged out.');
  };

  // Update user profile
  // This function now expects the full updated user object from the API response
  const updateProfile = (updatedUser) => {
    console.log('AuthContext: updateProfile called with (from API response or local update): ', updatedUser);
    setCurrentUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser)); // Persist updated user data
    console.log('AuthContext: currentUser updated and stored in localStorage:', updatedUser);
  };

  // Thêm hàm register nếu chưa có
  const register = async (userData) => {
    setLoading(true);
    console.log('AuthContext: Registering user...');
    try {
      const res = await API.register(userData);
      console.log('AuthContext: Registration successful:', res.data);
      
      const { token, user } = res.data;
      localStorage.setItem('token', token);
      setCurrentUser(user);
      localStorage.setItem('currentUser', JSON.stringify(user)); // Persist full user data after registration
      return user;
    } catch (error) {
      console.error('AuthContext: Registration error:', error);
      throw error;
    } finally {
      setLoading(false);
      console.log('AuthContext: Loading set to false after registration.');
    }
  };

  // Thêm hàm tiện ích để kiểm tra vai trò
  const isAdmin = () => {
    console.log('AuthContext: Checking isAdmin. currentUser:', currentUser);
    return currentUser && currentUser.role === 'admin';
  };

  // Thêm hàm tiện ích để kiểm tra quyền tải nhạc
  const canUploadMusic = () => {
    console.log('AuthContext: Checking canUploadMusic. currentUser:', currentUser);
    return currentUser && (currentUser.role === 'admin' || currentUser.canUploadMusic === true);
  };

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      loading, 
      login, 
      logout, 
      updateProfile, 
      register, 
      isAdmin, 
      canUploadMusic 
    }}>
      {children}
    </AuthContext.Provider>
  );
}; 