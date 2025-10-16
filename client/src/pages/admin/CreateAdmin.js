import React, { useState } from 'react';
import adminApi from '../../services/adminApi';

const CreateAdmin = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    adminCode: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await adminApi.createAdmin(formData);
      setSuccess(response.data.message || 'Tạo admin thành công');
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        adminCode: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo admin thất bại');
    } finally {
      setLoading(false);
    }
  };

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Tạo Admin Mới</h2>
          <p className="text-gray-400">Tạo tài khoản admin mới cho hệ thống</p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded mb-6">
            {error}
          </div>
        )}
        
        {success && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 p-4 rounded mb-6">
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="max-w-md">
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Họ tên Admin</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-3 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-3 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Mật khẩu</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-3 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-300 mb-2">Mã xác thực Admin</label>
            <input
              type="password"
              name="adminCode"
              value={formData.adminCode}
              onChange={handleChange}
              required
              className="w-full p-3 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
            />
          </div>
          
          <button
            type="submit"
            disabled={loading}
            className="bg-secondary text-white py-3 px-6 rounded-md hover:bg-secondary-dark transition-colors disabled:opacity-70"
          >
            {loading ? 'Đang xử lý...' : 'Tạo Admin'}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateAdmin; 