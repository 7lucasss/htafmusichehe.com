import { 
  FaUsers, 
  FaMusic, 
  FaChartLine, 
  FaSignOutAlt, 
  FaCog, 
  FaMoneyBillWave 
} from 'react-icons/fa';
import React from 'react';

export const INITIAL_STATS = {
  userCount: 0,
  songCount: 0,
  premiumUsers: 0
};

export const menuItems = [
  { path: '/admin', icon: <FaChartLine />, text: 'Dashboard' },
  { path: '/admin/users', icon: <FaUsers />, text: 'Quản lý người dùng' },
  { path: '/admin/songs', icon: <FaMusic />, text: 'Quản lý bài hát' },
  { path: '/admin/settings', icon: <FaCog />, text: 'Cài đặt hệ thống' },
];

export const StatCard = ({ title, value, icon, bgColor }) => (
  <div className={`p-6 rounded-lg ${bgColor} flex items-center justify-between`}>
    <div>
      <h3 className="text-sm font-medium text-gray-300 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-white">{value}</p>
    </div>
    {icon}
  </div>
);

export const getStatCardData = (stats) => [
  { 
    title: "Tổng Người Dùng", 
    value: stats.userCount, 
    icon: <FaUsers className="text-3xl text-blue-400" />, 
    bgColor: "bg-blue-800 bg-opacity-20"
  },
  { 
    title: "Tổng Bài Hát", 
    value: stats.songCount, 
    icon: <FaMusic className="text-3xl text-purple-400" />, 
    bgColor: "bg-purple-800 bg-opacity-20"
  },
  { 
    title: "Người Dùng Premium", 
    value: stats.premiumUsers, 
    icon: <FaMoneyBillWave className="text-3xl text-green-400" />, 
    bgColor: "bg-green-800 bg-opacity-20"
  }
]; 