import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';

const AlbumManagement = () => {
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [albumToDelete, setAlbumToDelete] = useState(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getAlbums();
      setAlbums(response.data.data || []);
    } catch (err) {
      console.error('Error fetching albums:', err);
      setError('Không thể tải danh sách album');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (album) => {
    setAlbumToDelete(album);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!albumToDelete) return;
    
    try {
      await adminApi.deleteAlbum(albumToDelete._id);
      setAlbums(albums.filter(album => album._id !== albumToDelete._id));
      setShowDeleteModal(false);
      setAlbumToDelete(null);
    } catch (err) {
      console.error('Error deleting album:', err);
      setError('Không thể xóa album. Vui lòng thử lại.');
    }
  };

  const filteredAlbums = albums.filter(album =>
    album.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    album.artist?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Danh sách Album</h2>
          <button
            onClick={() => {/* TODO: Navigate to add album */}}
            className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Thêm Album
          </button>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm album..."
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
            <p className="mt-2 text-gray-400">Đang tải dữ liệu...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-dark bg-opacity-50 rounded-lg overflow-hidden">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Album
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nghệ sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Số bài hát
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Ngày tạo
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredAlbums.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                      Không có album nào
                    </td>
                  </tr>
                ) : (
                  filteredAlbums.map(album => (
                    <tr key={album._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded" 
                              src={album.coverUrl || 'https://via.placeholder.com/40'} 
                              alt={album.title} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{album.title}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {album.artist?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{album.songCount || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(album.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {/* TODO: View album */}}
                          className="text-blue-400 hover:text-blue-300 mx-1"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => {/* TODO: Edit album */}}
                          className="text-yellow-400 hover:text-yellow-300 mx-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(album)}
                          className="text-red-400 hover:text-red-300 mx-1"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Xác nhận xóa</h3>
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa album "{albumToDelete?.title}"? Thao tác này không thể hoàn tác.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
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

export default AlbumManagement; 