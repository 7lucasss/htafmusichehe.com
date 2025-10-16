import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRedirect = () => {
  const { currentUser, loading } = useContext(AuthContext);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!loading) {
      if (currentUser && currentUser.role === 'admin') {
        navigate('/admin');
      }
    }
  }, [currentUser, loading, navigate]);
  
  return null;
};

export default AdminRedirect; 