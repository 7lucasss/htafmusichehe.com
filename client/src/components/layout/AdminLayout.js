import React from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { useContext } from 'react';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const AdminLayout = ({ children, title }) => {
  const { currentUser } = useContext(AuthContext);

  // Kiểm tra quyền admin
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex h-screen bg-dark">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminHeader title={title} />
        
        <main className="flex-1 overflow-y-auto p-6 bg-dark">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 