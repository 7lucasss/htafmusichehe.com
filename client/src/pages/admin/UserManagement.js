import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import adminApi from '../../services/adminApi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    role: '',
    status: ''
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getUsers();
      setUsers(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Không thể tải danh sách người dùng. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      role: user.role,
      status: user.status || 'active'
    });
    setShowEditModal(true);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await adminApi.updateUser(selectedUser._id, formData);
      setShowEditModal(false);
      fetchUsers();
    } catch (err) {
      console.error('Error updating user:', err);
      setError('Cập nhật người dùng thất bại. Vui lòng thử lại.');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) return;

    try {
      await adminApi.deleteUser(userId);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Xóa người dùng thất bại. Vui lòng thử lại.');
    }
  };

  const toggleJobPermission = async (userId, newStatus) => {
    try {
      await adminApi.updateUserJobPermission(userId, newStatus);
      setUsers(users.map(user => 
        user._id === userId 
          ? { ...user, canPostJobs: newStatus } 
          : user
      ));
    } catch (error) {
      console.error('Error updating job permission:', error);
    }
  };

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      {error && (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 p-4 rounded mb-6">
          {error}
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <div className="spinner"></div>
          <p className="mt-2 text-gray-400">Đang tải dữ liệu...</p>
        </div>
      ) : (
        <div className="bg-primary bg-opacity-20 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700">
                <th className="p-3 text-left text-gray-300">Tên</th>
                <th className="p-3 text-left text-gray-300">Email</th>
                <th className="p-3 text-left text-gray-300">Vai trò</th>
                <th className="p-3 text-left text-gray-300">Trạng thái</th>
                <th className="p-3 text-left text-gray-300">Ngày đăng ký</th>
                <th className="p-3 text-left text-gray-300">Quyền đăng tin</th>
                <th className="p-3 text-center text-gray-300">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id} className="border-t border-gray-700 hover:bg-gray-700">
                  <td className="p-3 text-white">{user.name}</td>
                  <td className="p-3 text-white">{user.email}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${
                      user.role === 'admin' ? 'bg-purple-500' : 
                      user.role === 'premium' ? 'bg-yellow-500' : 'bg-blue-500'
                    } text-white`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-3">
                    {user.status === 'banned' ? (
                      <span className="flex items-center text-red-400">
                        <FaTimes className="mr-1" /> Bị khóa
                      </span>
                    ) : (
                      <span className="flex items-center text-green-400">
                        <FaCheck className="mr-1" /> Hoạt động
                      </span>
                    )}
                  </td>
                  <td className="p-3 text-white">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="p-3">
                    <div className="flex items-center">
                      <button
                        onClick={() => toggleJobPermission(user._id, !user.canPostJobs)}
                        className={`px-2 py-1 rounded-full text-xs flex items-center ${
                          user.canPostJobs 
                            ? 'bg-green-900 text-green-300' 
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {user.canPostJobs ? (
                          <>
                            <FaCheck className="mr-1" /> Được phép
                          </>
                        ) : (
                          <>
                            <FaTimes className="mr-1" /> Không được phép
                          </>
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 flex justify-center space-x-2">
                    <button 
                      onClick={() => handleEdit(user)}
                      className="p-1 bg-blue-500 rounded hover:bg-blue-600 transition-colors"
                    >
                      <FaEdit />
                    </button>
                    <button 
                      onClick={() => handleDelete(user._id)}
                      className="p-1 bg-red-500 rounded hover:bg-red-600 transition-colors"
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal Chỉnh sửa người dùng */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <h2 className="text-xl font-bold mb-4 text-white">Chỉnh sửa người dùng</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-300 mb-2">Vai trò</label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="user">User</option>
                  <option value="premium">Premium</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-300 mb-2">Trạng thái</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full p-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="active">Hoạt động</option>
                  <option value="banned">Bị khóa</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-700 transition-colors text-white"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-secondary rounded hover:bg-secondary-dark transition-colors text-white"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserManagement; 