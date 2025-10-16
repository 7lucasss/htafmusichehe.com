import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import adminApi from '../../services/adminApi';
import { 
  INITIAL_STATS, 
  StatCard, 
  getStatCardData
} from '../../utils/adminUtils';

const Dashboard = () => {
  const { currentUser } = useContext(AuthContext);
  const [stats, setStats] = useState(INITIAL_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const response = await adminApi.getDashboardData();
        setStats(response.data || INITIAL_STATS);
      } catch (err) {
        console.error('Error fetching admin stats:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="spinner"></div>
        <span className="ml-3 text-white">Đang tải dữ liệu...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {getStatCardData(stats).map((cardData, index) => (
          <StatCard 
            key={index}
            title={cardData.title}
            value={cardData.value}
            icon={cardData.icon}
            bgColor={cardData.bgColor}
          />
        ))}
      </div>

      {/* Thêm các widget dashboard khác */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Biểu đồ hoạt động */}
        <div className="bg-primary bg-opacity-10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Hoạt Động Gần Đây</h3>
          <div className="h-64 flex items-center justify-center text-gray-400">
            Chưa có dữ liệu hoạt động
          </div>
        </div>

        {/* Thống kê nhanh */}
        <div className="bg-primary bg-opacity-10 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Thống Kê Nhanh</h3>
          <ul className="space-y-3">
            <li className="flex justify-between text-white">
              <span>Bài hát mới trong tuần</span>
              <span className="font-bold">12</span>
            </li>
            <li className="flex justify-between text-white">
              <span>Người dùng đăng ký mới</span>
              <span className="font-bold">45</span>
            </li>
            <li className="flex justify-between text-white">
              <span>Lượt nghe</span>
              <span className="font-bold">3,456</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 