import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const AdminRoute = ({ children }) => {
  const { currentUser, loading } = useContext(AuthContext);

  console.log('AdminRoute: loading=', loading, 'currentUser=', currentUser);

  if (loading) {
    console.log('AdminRoute: Loading...');
    return <div className="flex items-center justify-center h-screen">Đang tải...</div>;
  }

  if (!currentUser || currentUser.role !== 'admin') {
    console.log('AdminRoute: Not admin, redirecting to login.');
    return <Navigate to="/login" replace />;
  }

  console.log('AdminRoute: User is admin, rendering children.');
  return children;
};

export default AdminRoute; 