import React, { useState, useEffect, useContext } from 'react';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSearch, FaSync } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const PlaylistManagement = () => {
  const { currentUser } = useContext(AuthContext);
  const [playlists, setPlaylists] = useState([]);
  const [filteredPlaylists, setFilteredPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [playlistToDelete, setPlaylistToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlaylists = async () => {
      try {
        setLoading(true);
        const response = await adminApi.getPlaylists();
        
        if (response && response.data) {
          const playlistsData = response.data.data || [];
          setPlaylists(playlistsData);
          setFilteredPlaylists(playlistsData);
          
          if (playlistsData.length === 0) {
            setError('Chưa có playlist nào được tạo. Hãy thêm playlist mới!');
          }
        }
      } catch (error) {
        console.error('Error fetching playlists:', error);
        setError('Không thể tải danh sách playlist: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchPlaylists();
  }, []);

  const refreshPlaylists = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getPlaylists();
      if (response && response.data) {
        const playlistsData = response.data.data || [];
        setPlaylists(playlistsData);
        setFilteredPlaylists(playlistsData);
      }
    } catch (error) {
      console.error('Error refreshing playlists:', error);
      setError('Không thể làm mới danh sách playlist');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPlaylists(playlists);
    } else {
      const filtered = playlists.filter(pl => 
        pl.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pl.description && pl.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredPlaylists(filtered);
    }
  }, [searchTerm, playlists]);

  const handleAddPlaylist = () => {
    navigate('/admin/playlists/add');
  };

  const handleEditPlaylist = (id) => {
    navigate(`/admin/playlists/edit/${id}`);
  };

  const handleDeleteClick = (playlist) => {
    setPlaylistToDelete(playlist);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!playlistToDelete) return;
    
    try {
      await adminApi.deletePlaylist(playlistToDelete._id);
      const updatedPlaylists = playlists.filter(pl => pl._id !== playlistToDelete._id);
      setPlaylists(updatedPlaylists);
      setFilteredPlaylists(updatedPlaylists);
      setShowDeleteModal(false);
      setPlaylistToDelete(null);
    } catch (err) {
      console.error('Error deleting playlist:', err);
      setError('Không thể xóa playlist. Vui lòng thử lại.');
    }
  };

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Danh sách Playlist</h2>
          <div className="flex space-x-2">
            <button
              onClick={refreshPlaylists}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded flex items-center disabled:opacity-50"
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
            <button
              onClick={handleAddPlaylist}
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Thêm Playlist
            </button>
          </div>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm playlist..."
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
                    Playlist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Mô tả
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Số bài hát
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredPlaylists.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                      Không có playlist nào
                    </td>
                  </tr>
                ) : (
                  filteredPlaylists.map(pl => (
                    <tr key={pl._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded" 
                              src={pl.coverImage || 'https://via.placeholder.com/40'} 
                              alt={pl.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{pl.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {pl.description || 'Không có mô tả'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {pl.songs?.length || 0} bài hát
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${pl.isPublic ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {pl.isPublic ? 'Công khai' : 'Riêng tư'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditPlaylist(pl._id)}
                          className="text-yellow-400 hover:text-yellow-300 mx-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(pl)}
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
              Bạn có chắc chắn muốn xóa playlist "{playlistToDelete?.name}"? Thao tác này không thể hoàn tác.
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

export default PlaylistManagement; 