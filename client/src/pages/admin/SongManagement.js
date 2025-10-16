import React, { useState, useEffect } from 'react';
import { FaEdit, FaTrash, FaPlus, FaEye, FaSearch, FaSync } from 'react-icons/fa';
import adminApi from '../../services/adminApi';
import { useNavigate } from 'react-router-dom';

const SongManagement = () => {
  const [songs, setSongs] = useState([]);
  const [filteredSongs, setFilteredSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [songToDelete, setSongToDelete] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        console.log('Fetching admin songs...');
        const response = await adminApi.getSongs();
        console.log('Admin songs response:', response);
        
        if (response && response.data) {
          const songsData = response.data.data || [];
          console.log('Songs data:', songsData);
          setSongs(songsData);
          setFilteredSongs(songsData);
          
          if (songsData.length === 0) {
            setError('Chưa có bài hát nào được upload. Hãy thêm bài hát mới!');
          }
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
        setError('Không thể tải danh sách bài hát: ' + (error.response?.data?.message || error.message));
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, []);

  // Refresh function để có thể gọi lại từ component khác
  const refreshSongs = async () => {
    setLoading(true);
    try {
      const response = await adminApi.getSongs();
      if (response && response.data) {
        const songsData = response.data.data || [];
        setSongs(songsData);
        setFilteredSongs(songsData);
      }
    } catch (error) {
      console.error('Error refreshing songs:', error);
      setError('Không thể làm mới danh sách bài hát');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredSongs(songs);
    } else {
      const filtered = songs.filter(song => 
        song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (song.artist && song.artist.name && song.artist.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredSongs(filtered);
    }
  }, [searchTerm, songs]);

  const handleAddSong = () => {
    navigate('/admin/songs/add');
  };

  const handleEditSong = (id) => {
    navigate(`/admin/songs/edit/${id}`);
  };

  const handleViewSong = (id) => {
    navigate(`/admin/songs/view/${id}`);
  };

  const handleDeleteClick = (song) => {
    setSongToDelete(song);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!songToDelete) return;
    
    try {
      await adminApi.deleteSong(songToDelete._id);
      setSongs(songs.filter(song => song._id !== songToDelete._id));
      setFilteredSongs(filteredSongs.filter(song => song._id !== songToDelete._id));
      setShowDeleteModal(false);
      setSongToDelete(null);
    } catch (err) {
      console.error('Error deleting song:', err);
      setError('Không thể xóa bài hát. Vui lòng thử lại.');
    }
  };

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Danh sách bài hát</h2>
          <div className="flex space-x-2">
            <button
              onClick={refreshSongs}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-500 text-white py-2 px-4 rounded flex items-center disabled:opacity-50"
            >
              <FaSync className={`mr-2 ${loading ? 'animate-spin' : ''}`} /> Làm mới
            </button>
            <button
              onClick={handleAddSong}
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded flex items-center"
            >
              <FaPlus className="mr-2" /> Thêm bài hát
            </button>
          </div>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm bài hát..."
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
                    Bài hát
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Nghệ sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Playlist
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Thể loại
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
                {filteredSongs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-400">
                      Không có bài hát nào
                    </td>
                  </tr>
                ) : (
                  filteredSongs.map(song => (
                    <tr key={song._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded" 
                              src={song.imageUrl || 'https://via.placeholder.com/40'} 
                              alt={song.title} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{song.title}</div>
                            <div className="text-sm text-gray-400">{song.duration ? `${Math.floor(song.duration / 60)}:${(song.duration % 60).toString().padStart(2, '0')}` : 'N/A'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {song.artist?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {song.playlist?.name || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{song.genre || 'N/A'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${song.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {song.isActive ? 'Đang phát hành' : 'Đã ẩn'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleViewSong(song._id)}
                          className="text-blue-400 hover:text-blue-300 mx-1"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditSong(song._id)}
                          className="text-yellow-400 hover:text-yellow-300 mx-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(song)}
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
              Bạn có chắc chắn muốn xóa bài hát "{songToDelete?.title}"? Thao tác này không thể hoàn tác.
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

export default SongManagement; 