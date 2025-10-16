import React, { useState, useEffect } from 'react';
import { FaSave, FaUndo, FaCog, FaDatabase, FaEnvelope, FaLock, FaPalette } from 'react-icons/fa';

const AdminSettings = () => {
  const [settings, setSettings] = useState({
    siteName: 'HTaf Music',
    siteDescription: 'Nền tảng nhạc số hàng đầu Việt Nam',
    adminEmail: 'admin@htafmusic.com',
    maxUploadSize: '100',
    enableRegistration: true,
    enableComments: true,
    maintenanceMode: false,
    primaryColor: '#6366f1',
    secondaryColor: '#10b981',
    emailNotifications: true,
    backupFrequency: 'daily',
    sessionTimeout: '30'
  });
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // TODO: Implement API call to save settings
      // await API.updateSystemSettings(settings);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccess('Cài đặt đã được lưu thành công!');
    } catch (err) {
      console.error('Error saving settings:', err);
      setError('Không thể lưu cài đặt. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Bạn có chắc chắn muốn khôi phục về cài đặt mặc định?')) {
      setSettings({
        siteName: 'HTaf Music',
        siteDescription: 'Nền tảng nhạc số hàng đầu Việt Nam',
        adminEmail: 'admin@htafmusic.com',
        maxUploadSize: '100',
        enableRegistration: true,
        enableComments: true,
        maintenanceMode: false,
        primaryColor: '#6366f1',
        secondaryColor: '#10b981',
        emailNotifications: true,
        backupFrequency: 'daily',
        sessionTimeout: '30'
      });
      setSuccess('Đã khôi phục về cài đặt mặc định');
    }
  };

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FaCog className="mr-2" /> Cài đặt Hệ thống
          </h2>
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* General Settings */}
          <div className="bg-dark bg-opacity-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaCog className="mr-2" /> Cài đặt Chung
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tên Website
                </label>
                <input
                  type="text"
                  name="siteName"
                  value={settings.siteName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email Admin
                </label>
                <input
                  type="email"
                  name="adminEmail"
                  value={settings.adminEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Mô tả Website
                </label>
                <textarea
                  name="siteDescription"
                  value={settings.siteDescription}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                />
              </div>
            </div>
          </div>

          {/* System Settings */}
          <div className="bg-dark bg-opacity-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaDatabase className="mr-2" /> Cài đặt Hệ thống
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Kích thước upload tối đa (MB)
                </label>
                <input
                  type="number"
                  name="maxUploadSize"
                  value={settings.maxUploadSize}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Thời gian session (phút)
                </label>
                <input
                  type="number"
                  name="sessionTimeout"
                  value={settings.sessionTimeout}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tần suất backup
                </label>
                <select
                  name="backupFrequency"
                  value={settings.backupFrequency}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                >
                  <option value="hourly">Mỗi giờ</option>
                  <option value="daily">Mỗi ngày</option>
                  <option value="weekly">Mỗi tuần</option>
                  <option value="monthly">Mỗi tháng</option>
                </select>
              </div>
              
              <div className="flex flex-col space-y-3">
                <label className="block text-sm font-medium text-gray-300">
                  Tùy chọn hệ thống
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableRegistration"
                    checked={settings.enableRegistration}
                    onChange={handleChange}
                    className="rounded border-gray-700 text-secondary focus:ring-secondary"
                  />
                  <span className="ml-2 text-white">Cho phép đăng ký</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="enableComments"
                    checked={settings.enableComments}
                    onChange={handleChange}
                    className="rounded border-gray-700 text-secondary focus:ring-secondary"
                  />
                  <span className="ml-2 text-white">Cho phép bình luận</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onChange={handleChange}
                    className="rounded border-gray-700 text-secondary focus:ring-secondary"
                  />
                  <span className="ml-2 text-white">Chế độ bảo trì</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="emailNotifications"
                    checked={settings.emailNotifications}
                    onChange={handleChange}
                    className="rounded border-gray-700 text-secondary focus:ring-secondary"
                  />
                  <span className="ml-2 text-white">Thông báo email</span>
                </label>
              </div>
            </div>
          </div>

          {/* Theme Settings */}
          <div className="bg-dark bg-opacity-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FaPalette className="mr-2" /> Cài đặt Giao diện
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Màu chủ đạo
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 rounded mr-3"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Màu phụ
                </label>
                <div className="flex items-center">
                  <input
                    type="color"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleChange}
                    className="w-12 h-10 rounded mr-3"
                  />
                  <input
                    type="text"
                    name="secondaryColor"
                    value={settings.secondaryColor}
                    onChange={handleChange}
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleReset}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded flex items-center"
            >
              <FaUndo className="mr-2" /> Khôi phục mặc định
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-6 rounded flex items-center disabled:opacity-70"
            >
              <FaSave className="mr-2" />
              {loading ? 'Đang lưu...' : 'Lưu cài đặt'}
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default AdminSettings; 