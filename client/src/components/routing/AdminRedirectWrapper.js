import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRedirectWrapper = ({ children }) => {
  const { currentUser } = useContext(AuthContext);

  if (currentUser && currentUser.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default AdminRedirectWrapper; 