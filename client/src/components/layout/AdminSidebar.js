import React, { useContext, useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaMusic, 
  FaUserTie, 
  FaCompactDisc,
  FaTags, // Thêm icon
  FaList, 
  FaCog, 
  FaChevronLeft, 
  FaSignOutAlt 
} from 'react-icons/fa';

const AdminSidebar = ({ isSidebarOpen, setSidebarOpen }) => {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { name: 'Bảng điều khiển', path: '/admin/dashboard', icon: <FaTachometerAlt /> },
    { name: 'Quản lý người dùng', path: '/admin/users', icon: <FaUsers /> },
    { name: 'Quản lý bài hát', path: '/admin/songs', icon: <FaMusic /> },
    { name: 'Quản lý nghệ sĩ', path: '/admin/artists', icon: <FaUserTie /> },
    { name: 'Quản lý album', path: '/admin/albums', icon: <FaCompactDisc /> },
    { name: 'Quản lý thể loại', path: '/admin/genres', icon: <FaTags /> },
    { name: 'Quản lý playlist', path: '/admin/playlists', icon: <FaList /> },
    { name: 'Cài đặt', path: '/admin/settings', icon: <FaCog /> },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="w-64 bg-primary bg-opacity-30 flex flex-col">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-secondary">HTaf Admin</h1>
      </div>
      
      <div className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-2 px-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <NavLink
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  location.pathname === item.path
                    ? 'bg-secondary text-white'
                    : 'text-gray-300 hover:bg-gray-800'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <NavLink
          to="/"
          className="flex items-center px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors"
        >
          <FaChevronLeft className="mr-3" />
          <span>Về trang chủ</span>
        </NavLink>
        
        <button
          onClick={handleLogout}
          className="flex items-center px-4 py-2 mt-2 text-gray-300 hover:bg-gray-800 rounded-md transition-colors w-full text-left"
        >
          <FaSignOutAlt className="mr-3" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar; 