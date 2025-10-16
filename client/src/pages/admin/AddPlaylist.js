import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaPlus, FaTrash, FaImage } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';
import { AuthContext } from '../../context/AuthContext';

const AddPlaylist = () => {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Lấy ID playlist nếu đang chỉnh sửa
  const isEditMode = !!id;

  const [playlistData, setPlaylistData] = useState({
    name: '',
    description: '',
    coverImage: null,
    isPublic: true,
    songs: []
  });

  const [songs, setSongs] = useState([]);
  const [selectedSongs, setSelectedSongs] = useState([]);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Tải danh sách bài hát và thông tin playlist (nếu đang chỉnh sửa)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Tải danh sách bài hát
        const songsResponse = await adminApi.getSongs();
        setSongs(songsResponse.data.data || []);

        // Nếu đang chỉnh sửa, tải thông tin playlist
        if (isEditMode) {
          const playlistResponse = await adminApi.getPlaylist(id);
          const playlist = playlistResponse.data;
          
          setPlaylistData({
            name: playlist.name,
            description: playlist.description || '',
            coverImage: playlist.coverImage,
            isPublic: playlist.isPublic !== undefined ? playlist.isPublic : true,
            songs: playlist.songs || []
          });

          // Thiết lập ảnh preview
          if (playlist.coverImage) {
            setImagePreview(playlist.coverImage);
          }

          // Thiết lập các bài hát đã chọn
          setSelectedSongs(playlist.songs.map(song => song._id));
        }
      } catch (err) {
        console.error('Lỗi tải dữ liệu:', err);
        setError('Không thể tải dữ liệu. Vui lòng thử lại.');
      }
    };

    fetchData();
  }, [id, isEditMode]);

  // Xử lý thay đổi input
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setPlaylistData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Xử lý tải ảnh
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);

        // Upload ảnh
        const uploadResponse = await adminApi.uploadImage(file);
        setPlaylistData(prev => ({
          ...prev,
          coverImage: uploadResponse.data.url
        }));
      } catch (err) {
        console.error('Lỗi tải ảnh:', err);
        setError('Không thể tải ảnh. Vui lòng thử lại.');
      }
    }
  };

  // Xử lý chọn/bỏ chọn bài hát
  const handleSongSelect = (songId) => {
    setSelectedSongs(prev => 
      prev.includes(songId) 
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  // Xử lý submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const submitData = {
        ...playlistData,
        songs: selectedSongs
      };

      if (isEditMode) {
        await adminApi.updatePlaylist(id, submitData);
      } else {
        await adminApi.createPlaylist(submitData);
      }

      // Chuyển hướng sau khi thành công
      navigate('/admin/playlists');
    } catch (err) {
      console.error('Lỗi:', err);
      setError(isEditMode 
        ? 'Không thể cập nhật playlist' 
        : 'Không thể tạo playlist'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout title={isEditMode ? "Chỉnh sửa Playlist" : "Tạo Playlist Mới"}>
      <div className="bg-primary bg-opacity-20 rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Thông tin playlist */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Thông tin Playlist
              </h3>
              
              <div className="mb-4">
                <label className="block text-white mb-2">Tên Playlist</label>
                <input
                  type="text"
                  name="name"
                  value={playlistData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded text-white"
                  placeholder="Nhập tên playlist"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-white mb-2">Mô tả</label>
                <textarea
                  name="description"
                  value={playlistData.description}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded text-white h-32"
                  placeholder="Mô tả về playlist"
                />
              </div>
              
              <div className="mb-4">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={playlistData.isPublic}
                    onChange={handleInputChange}
                    className="form-checkbox text-secondary"
                  />
                  <span className="ml-2 text-white">Playlist công khai</span>
                </label>
              </div>
            </div>
            
            {/* Ảnh bìa */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Ảnh Bìa Playlist
              </h3>
              
              <div className="mb-4 relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="coverImageUpload"
                />
                <label 
                  htmlFor="coverImageUpload" 
                  className="block w-full h-64 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer flex items-center justify-center hover:border-secondary transition"
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Ảnh bìa" 
                      className="w-full h-full object-cover rounded-lg" 
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <FaImage className="mx-auto text-4xl mb-2" />
                      <p>Tải ảnh bìa</p>
                    </div>
                  )}
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview(null);
                      setPlaylistData(prev => ({ ...prev, coverImage: null }));
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <FaTrash />
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Chọn bài hát */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Chọn Bài Hát
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {songs.map(song => (
                <div 
                  key={song._id} 
                  className={`flex items-center p-2 rounded cursor-pointer ${
                    selectedSongs.includes(song._id) 
                      ? 'bg-secondary bg-opacity-30' 
                      : 'bg-dark hover:bg-gray-800'
                  }`}
                  onClick={() => handleSongSelect(song._id)}
                >
                  <input
                    type="checkbox"
                    checked={selectedSongs.includes(song._id)}
                    onChange={() => handleSongSelect(song._id)}
                    className="mr-3"
                  />
                  <img 
                    src={song.imageUrl || 'https://via.placeholder.com/50'} 
                    alt={song.title} 
                    className="w-12 h-12 rounded mr-3" 
                  />
                  <div>
                    <p className="text-white font-medium">{song.title}</p>
                    <p className="text-gray-400 text-sm">{song.artist?.name || 'Unknown Artist'}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Hiển thị lỗi */}
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Nút submit */}
          <div className="flex justify-end space-x-4 mt-6">
            <button
              type="button"
              onClick={() => navigate('/admin/playlists')}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded flex items-center disabled:opacity-50"
            >
              {loading ? 'Đang lưu...' : (isEditMode ? 'Cập nhật' : 'Tạo Playlist')}
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default AddPlaylist; 