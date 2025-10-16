import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaEdit, FaTrash, FaEye, FaSearch, FaCheck, FaTimes } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';

const JobManagement = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await adminApi.getJobs();
        setJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteJob(id);
      setJobs(jobs.filter(job => job._id !== id));
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const confirmDelete = (job) => {
    setJobToDelete(job);
    setIsDeleteModalOpen(true);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  const handleStatusChange = (e) => {
    setSelectedStatus(e.target.value);
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filter jobs based on search term and status
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedStatus === 'all') return matchesSearch;
    if (selectedStatus === 'active') return matchesSearch && job.isActive;
    if (selectedStatus === 'inactive') return matchesSearch && !job.isActive;
    return matchesSearch;
  });

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Quản lý tin tuyển dụng</h2>
          <p className="text-gray-400">Quản lý tất cả các tin tuyển dụng trên hệ thống</p>
        </div>
        
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Tìm kiếm tin tuyển dụng..."
              className="w-full bg-dark border border-gray-700 rounded-md py-2 px-4 pl-10 text-white focus:outline-none focus:border-secondary"
              value={searchTerm}
              onChange={handleSearch}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
          </div>
          
          <select
            className="bg-dark border border-gray-700 rounded-md py-2 px-4 text-white focus:outline-none focus:border-secondary"
            value={selectedStatus}
            onChange={handleStatusChange}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hiển thị</option>
            <option value="inactive">Đã hết hạn</option>
          </select>
        </div>
        
        {/* Jobs list */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="spinner"></div>
            <p className="ml-3 text-white">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-dark bg-opacity-50 rounded-lg overflow-hidden">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="py-3 px-4 text-left text-gray-300">Tiêu đề</th>
                    <th className="py-3 px-4 text-left text-gray-300">Công ty</th>
                    <th className="py-3 px-4 text-left text-gray-300">Địa điểm</th>
                    <th className="py-3 px-4 text-left text-gray-300">Ngày đăng</th>
                    <th className="py-3 px-4 text-left text-gray-300">Trạng thái</th>
                    <th className="py-3 px-4 text-left text-gray-300">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {filteredJobs.map(job => (
                    <tr key={job._id} className="hover:bg-gray-800">
                      <td className="py-3 px-4">
                        <div className="font-medium text-white">{job.title}</div>
                      </td>
                      <td className="py-3 px-4 text-white">{job.company}</td>
                      <td className="py-3 px-4 text-white">{job.location}</td>
                      <td className="py-3 px-4 text-white">{formatDate(job.createdAt)}</td>
                      <td className="py-3 px-4">
                        {job.isActive ? (
                          <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">
                            Đang hiển thị
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs">
                            Đã hết hạn
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex space-x-2">
                          <Link 
                            to={`/jobs/${job._id}`} 
                            className="text-blue-400 hover:text-blue-300"
                            title="Xem"
                          >
                            <FaEye />
                          </Link>
                          <Link 
                            to={`/admin/jobs/edit/${job._id}`} 
                            className="text-yellow-400 hover:text-yellow-300"
                            title="Sửa"
                          >
                            <FaEdit />
                          </Link>
                          <button 
                            onClick={() => confirmDelete(job)} 
                            className="text-red-400 hover:text-red-300"
                            title="Xóa"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredJobs.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-400">Không tìm thấy tin tuyển dụng nào</p>
              </div>
            )}
          </>
        )}
      </div>
      
      {/* Delete confirmation modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md">
            <h3 className="text-xl font-bold mb-4 text-white">Xác nhận xóa</h3>
            <p className="mb-6 text-gray-300">
              Bạn có chắc chắn muốn xóa tin tuyển dụng "{jobToDelete?.title}"? 
              Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-4">
              <button 
                className="px-4 py-2 bg-gray-600 rounded-md hover:bg-gray-700 text-white"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                Hủy
              </button>
              <button 
                className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-700 text-white"
                onClick={() => handleDelete(jobToDelete._id)}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default JobManagement; 