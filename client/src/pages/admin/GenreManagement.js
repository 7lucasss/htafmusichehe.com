import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';
import GenreForm from '../../components/admin/GenreForm'; // Sẽ tạo form này ở bước sau

const GenreManagement = () => {
  const [genres, setGenres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [showFormModal, setShowFormModal] = useState(false);
  const [genreToEdit, setGenreToEdit] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [genreToDelete, setGenreToDelete] = useState(null);

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getGenres();
      setGenres(response.data.data || []);
    } catch (err) {
      console.error('Error fetching genres:', err);
      setError('Không thể tải danh sách thể loại');
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setGenreToEdit(null);
    setShowFormModal(true);
  };
  
  const handleEditClick = (genre) => {
    setGenreToEdit(genre);
    setShowFormModal(true);
  };
  
  const handleFormCancel = () => {
    setShowFormModal(false);
    setGenreToEdit(null);
  };

  const handleFormSave = (savedGenre) => {
    if (genreToEdit) {
      setGenres(genres.map(g => g._id === savedGenre.data._id ? savedGenre.data : g));
    } else {
      setGenres([savedGenre.data, ...genres]);
    }
    setShowFormModal(false);
    setGenreToEdit(null);
  };

  const handleDeleteClick = (genre) => {
    setGenreToDelete(genre);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!genreToDelete) return;
    
    try {
      await adminApi.deleteGenre(genreToDelete._id);
      setGenres(genres.filter(g => g._id !== genreToDelete._id));
      setShowDeleteModal(false);
      setGenreToDelete(null);
    } catch (err) {
      console.error('Error deleting genre:', err);
      setError('Không thể xóa thể loại. Vui lòng thử lại.');
    }
  };

  const filteredGenres = genres.filter(genre =>
    genre.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Danh sách Thể loại</h2>
          <button
            onClick={handleAddClick}
            className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Thêm Thể loại
          </button>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm thể loại..."
            className="w-full pl-10 pr-4 py-2 bg-dark border border-gray-700 rounded-md text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        {loading ? (
          <div className="text-center py-10">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-dark bg-opacity-50 rounded-lg">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Tên Thể loại</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase">Mô tả</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredGenres.map(genre => (
                  <tr key={genre._id} className="hover:bg-gray-800">
                    <td className="px-6 py-4 text-white">{genre.name}</td>
                    <td className="px-6 py-4 text-gray-300">{genre.description || 'Chưa có mô tả'}</td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => handleEditClick(genre)} className="text-yellow-400 hover:text-yellow-300 mx-1">
                        <FaEdit />
                      </button>
                      <button onClick={() => handleDeleteClick(genre)} className="text-red-400 hover:text-red-300 mx-1">
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {showFormModal && (
        <GenreForm
          genre={genreToEdit}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Xác nhận xóa</h3>
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa thể loại "{genreToDelete?.name}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(false)} className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">Hủy</button>
              <button onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GenreManagement; 