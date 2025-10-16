import React, { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';
import ArtistForm from '../../components/admin/ArtistForm'; // Import ArtistForm

const ArtistManagement = () => {
  const [artists, setArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  
  // State for modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [artistToDelete, setArtistToDelete] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [artistToEdit, setArtistToEdit] = useState(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await adminApi.getArtists();
      setArtists(response.data.data || []);
    } catch (err) {
      console.error('Error fetching artists:', err);
      setError('Không thể tải danh sách nghệ sĩ');
    } finally {
      setLoading(false);
    }
  };

  // --- Modal Handlers ---
  const handleAddClick = () => {
    setArtistToEdit(null);
    setShowFormModal(true);
  };
  
  const handleEditClick = (artist) => {
    setArtistToEdit(artist);
    setShowFormModal(true);
  };
  
  const handleFormCancel = () => {
    setShowFormModal(false);
    setArtistToEdit(null);
  };

  const handleFormSave = (savedArtist) => {
    if (artistToEdit) {
      // Update existing artist in the list
      setArtists(artists.map(artist => 
        artist._id === savedArtist.data._id ? savedArtist.data : artist
      ));
    } else {
      // Add new artist to the list
      setArtists([savedArtist.data, ...artists]);
    }
    setShowFormModal(false);
    setArtistToEdit(null);
  };

  const handleDeleteClick = (artist) => {
    setArtistToDelete(artist);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!artistToDelete) return;
    
    try {
      await adminApi.deleteArtist(artistToDelete._id);
      setArtists(artists.filter(artist => artist._id !== artistToDelete._id));
      setShowDeleteModal(false);
      setArtistToDelete(null);
    } catch (err) {
      console.error('Error deleting artist:', err);
      setError('Không thể xóa nghệ sĩ. Vui lòng thử lại.');
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.bio?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    // Remove AdminLayout wrapper as it's already provided by App.js
    <>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Danh sách Nghệ sĩ</h2>
          <button
            onClick={handleAddClick}
            className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded flex items-center"
          >
            <FaPlus className="mr-2" /> Thêm Nghệ sĩ
          </button>
        </div>
        
        <div className="relative mb-6">
          <input
            type="text"
            placeholder="Tìm kiếm nghệ sĩ..."
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
                    Nghệ sĩ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Tiểu sử
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
                {filteredArtists.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-400">
                      Không có nghệ sĩ nào
                    </td>
                  </tr>
                ) : (
                  filteredArtists.map(artist => (
                    <tr key={artist._id} className="hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img 
                              className="h-10 w-10 rounded-full" 
                              src={artist.imageUrl || 'https://via.placeholder.com/40'} 
                              alt={artist.name} 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-white">{artist.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-300 max-w-xs truncate">
                          {artist.bio || 'Chưa có tiểu sử'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{artist.songCount || 0}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {new Date(artist.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {/* TODO: View artist */}}
                          className="text-blue-400 hover:text-blue-300 mx-1"
                        >
                          <FaEye />
                        </button>
                        <button
                          onClick={() => handleEditClick(artist)}
                          className="text-yellow-400 hover:text-yellow-300 mx-1"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(artist)}
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
      
      {/* Artist Form Modal */}
      {showFormModal && (
        <ArtistForm
          artist={artistToEdit}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-xl font-semibold text-white mb-4">Xác nhận xóa</h3>
            <p className="text-gray-300 mb-6">
              Bạn có chắc chắn muốn xóa nghệ sĩ "{artistToDelete?.name}"? Thao tác này không thể hoàn tác.
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

export default ArtistManagement; 