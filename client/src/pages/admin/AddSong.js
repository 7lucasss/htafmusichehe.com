import React, { useState, useEffect, useContext } from 'react'; // Import useContext
import { useNavigate } from 'react-router-dom';
import { FaMusic, FaSave, FaTimes, FaUpload, FaPlus } from 'react-icons/fa';
import AdminLayout from '../../components/layout/AdminLayout';
import adminApi from '../../services/adminApi';
import { AuthContext } from '../../context/AuthContext'; // Import AuthContext

const AddSong = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [artists, setArtists] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const [genres, setGenres] = useState([]); // Thêm state cho genres
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    playlist: '',
    genre: '',
    price: {
      mp3: 0.99,
      flac: 1.99,
      wav: 2.99
    },
    audioUrl: '',
    imageUrl: '',
    lyrics: '',
    duration: 0, // Lưu dưới dạng giây
    durationDisplay: '0:00', // Thêm state để hiển thị MM:SS
    isActive: true,
    // audioInfo: { format: '' } // Thêm audioInfo với format ban đầu trống
  });
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [audioUploading, setAudioUploading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [imageUploadProgress, setImageUploadProgress] = useState(0);
  const [showNewArtist, setShowNewArtist] = useState(false);
  const [showNewPlaylist, setShowNewPlaylist] = useState(false);
  const [showNewGenre, setShowNewGenre] = useState(false); // Thêm state cho modal thêm thể loại mới
  const [newArtist, setNewArtist] = useState({
    name: '',
    bio: '',
    imageUrl: ''
  });
  const [newPlaylist, setNewPlaylist] = useState({
    name: '',
    description: '',
    coverUrl: ''
  });
  const [newGenre, setNewGenre] = useState({ // Thêm state cho dữ liệu thể loại mới
    name: '',
    description: '',
    color: '#6366f1'
  });

  const { currentUser, canUploadMusic } = useContext(AuthContext); // Use AuthContext

  // Tải danh sách nghệ sĩ, thể loại khi component được tải
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [artistsRes, genresRes, playlistsRes] = await Promise.all([
          adminApi.getArtists(),
          adminApi.getGenres(), // Lấy danh sách genres
          adminApi.getPlaylists() // Lấy danh sách playlists
        ]);
        
        setArtists(artistsRes.data.data || []);
        setGenres(genresRes.data.data || []); // Cập nhật state cho genres
        setPlaylists(playlistsRes.data.data || []); // Cập nhật state cho playlists
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Không thể tải danh sách nghệ sĩ, thể loại hoặc playlist');
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Xử lý các trường nested như price
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: parseFloat(value)
        }
      }));
    } else if (name === 'isActive') {
      setFormData(prev => ({ ...prev, [name]: e.target.checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Validate form
      if (!formData.title || !formData.artist || !formData.genre || !formData.audioUrl) {
        throw new Error('Vui lòng điền đầy đủ thông tin (*), tải lên file nhạc và ảnh bìa.');
      }

      // Dữ liệu đã bao gồm audioUrl và imageUrl từ state
      const songData = {
        title: formData.title,
        artist: formData.artist,
        genre: formData.genre,
        price: formData.price,
        audioUrl: formData.audioUrl,
        imageUrl: formData.imageUrl,
        lyrics: formData.lyrics,
        duration: formData.duration,
        isActive: formData.isActive,
        // audioInfo: formData.audioInfo // Thêm audioInfo vào đây
      };
      
      console.log("Submitting song data:", songData);
      const response = await adminApi.createSong(songData);
      
      console.log("Song created successfully:", response);
      setSuccess('Thêm bài hát thành công!');
      
      // Reset form
      setFormData({
        title: '',
        artist: '',
        playlist: '',
        genre: '',
        price: {
          mp3: 0.99,
          flac: 1.99,
          wav: 2.99
        },
        audioUrl: '',
        imageUrl: '',
        lyrics: '',
        duration: 0,
        durationDisplay: '0:00',
        isActive: true
      });
      setAudioFile(null);
      setImageFile(null);
      setUploadProgress(0);
      setImageUploadProgress(0);

      setTimeout(() => {
        navigate('/admin/songs');
      }, 2000);
    } catch (err) {
      console.error('Error creating song:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Có lỗi xảy ra, vui lòng thử lại';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Helper để hiển thị thời lượng dưới dạng MM:SS
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Thêm function xử lý file audio được chọn
  const handleAudioFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setAudioFile(file);
      
      // Tự động lấy thời lượng bài hát
      const audio = document.createElement('audio');
      audio.src = URL.createObjectURL(file);
      audio.onloadedmetadata = () => {
        const totalSeconds = Math.round(audio.duration);
        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;
        const durationString = `${mins}:${secs.toString().padStart(2, '0')}`;
        
        setFormData(prev => ({
          ...prev,
          duration: totalSeconds,
          durationDisplay: durationString
        }));
        
        // Giải phóng bộ nhớ
        URL.revokeObjectURL(audio.src);
      };
    }
  };

  // Thêm function xử lý file ảnh được chọn
  const handleImageFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
      
      // Preview ảnh (tùy chọn)
      const reader = new FileReader();
      reader.onload = (e) => {
        // Thêm state preview nếu muốn hiển thị ảnh xem trước
        // setImagePreview(e.target.result);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  // Function xử lý upload file audio
  const handleAudioUpload = async () => {
    if (!audioFile) {
      setError('Vui lòng chọn file nhạc để tải lên');
      return;
    }
    
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/flac'];
    const maxSize = 100 * 1024 * 1024; // 100MB

    if (!allowedTypes.includes(audioFile.type) || audioFile.size > maxSize) {
      setError('File không hợp lệ. Chỉ chấp nhận file MP3, WAV, FLAC và dung lượng < 100MB.');
      return;
    }

    setAudioUploading(true);
    setError('');
    
    try {
      const response = await adminApi.uploadAudio(audioFile, (progress) => {
        setUploadProgress(progress);
      });
      
      // Sửa lỗi ở đây: Truy cập đúng đường dẫn của URL
      setFormData(prev => ({
        ...prev,
        audioUrl: response.data.data.url,
        // audioInfo: { format: response.data.data.format } // Thêm format từ response
      }));

    } catch (err) {
      console.error('Error uploading audio:', err);
      setError('Tải file nhạc thất bại.');
    } finally {
      setAudioUploading(false);
    }
  };

  // Function xử lý upload file ảnh
  const handleImageUpload = async () => {
    if (!imageFile) {
      setError('Vui lòng chọn file ảnh để tải lên');
      return;
    }

    setImageUploading(true);
    setError('');

    try {
      const response = await adminApi.uploadImage(imageFile, (progress) => {
        setImageUploadProgress(progress);
      });

      // Sửa lỗi ở đây: Truy cập đúng đường dẫn của URL
      setFormData(prev => ({
        ...prev,
        imageUrl: response.data.data.url // Đã sửa
      }));

    } catch (err) {
      console.error('Error uploading image:', err);
      setError('Tải file ảnh thất bại.');
    } finally {
      setImageUploading(false);
    }
  };

  // Xử lý thêm nghệ sĩ mới
  const handleAddNewArtist = async (e) => {
    e.preventDefault();
    try {
      const artistData = {
        name: newArtist.name,
        bio: newArtist.bio || ''
      };
      
      console.log('Sending data:', artistData);

      const response = await fetch('http://localhost:5000/api/artists', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(artistData)
      });

      // Log response details
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      const text = await response.text();
      console.log('Raw response:', text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error(`Invalid JSON response: ${text}`);
      }

      if (data.success) {
        const updatedArtists = [...artists, data.data];
        setArtists(updatedArtists);
        setFormData({
          ...formData,
          artist: data.data._id
        });
        setShowNewArtist(false);
        setNewArtist({ name: '', bio: '' });
      } else {
        throw new Error(data.message || 'Failed to create artist');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Không thể tạo nghệ sĩ mới: ' + error.message);
    }
  };

  // Xử lý thêm playlist mới
  const handleCreatePlaylist = async (e) => {
    e.preventDefault();
    try {
      const playlistData = {
        name: newPlaylist.name,
        description: newPlaylist.description || '',
        coverUrl: newPlaylist.coverUrl || ''
      };

      console.log('Creating playlist with data:', playlistData);

      const response = await adminApi.createPlaylist(playlistData);

      if (response.data && response.data.success) {
        const updatedPlaylists = [...playlists, response.data.data];
        setPlaylists(updatedPlaylists);
        setFormData({
          ...formData,
          playlist: response.data.data._id
        });
        setShowNewPlaylist(false);
        setNewPlaylist({ name: '', description: '', coverUrl: '' }); // Reset form
      } else {
        throw new Error(response.data?.message || 'Failed to create playlist');
      }
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Không thể tạo playlist mới: ' + error.message);
    }
  };

  // Xử lý thêm thể loại mới
  const handleCreateGenre = async (e) => {
    e.preventDefault();
    try {
      const genreData = {
        name: newGenre.name,
        description: newGenre.description || '',
        color: newGenre.color
      };

      console.log('Creating genre with data:', genreData);

      const response = await adminApi.createGenre(genreData);

      if (response.data && response.data.success) {
        const updatedGenres = [...genres, response.data.data];
        setGenres(updatedGenres);
        setFormData({
          ...formData,
          genre: response.data.data.name
        });
        setShowNewGenre(false);
        setNewGenre({ name: '', description: '', color: '#6366f1' }); // Reset form
      } else {
        throw new Error(response.data?.message || 'Failed to create genre');
      }
    } catch (error) {
      console.error('Error creating genre:', error);
      alert('Không thể tạo thể loại mới: ' + error.message);
    }
  };

  return (
    <AdminLayout title="Thêm Bài Hát Mới">
      {/* Kiểm tra quyền tải nhạc */}
      {(!currentUser || (!canUploadMusic() && currentUser.role !== 'admin')) ? (
        <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
          <p className="text-center">Bạn không có quyền tải nhạc lên. Vui lòng liên hệ quản trị viên để được cấp quyền.</p>
        </div>
      ) : (
        <div className="bg-primary bg-opacity-20 rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white flex items-center">
              <FaMusic className="mr-2" /> Thêm Bài Hát Mới
            </h2>
            <button
              onClick={() => navigate('/admin/songs')}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded flex items-center"
            >
              <FaTimes className="mr-2" /> Hủy
            </button>
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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">
                    Tên bài hát <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="artist" className="block text-sm font-medium text-gray-300 mb-1">
                    Nghệ sĩ <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="artist"
                      name="artist"
                      value={formData.artist}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                      required
                    >
                      <option value="">-- Chọn nghệ sĩ --</option>
                      {artists.map(artist => (
                        <option key={artist._id} value={artist._id}>{artist.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="bg-secondary p-2 rounded"
                      onClick={() => setShowNewArtist(true)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                {/* Playlist Selection */}
                <div className="mb-4">
                  <label htmlFor="playlist" className="block text-sm font-medium text-gray-300 mb-1">
                    Playlist <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="playlist"
                      name="playlist"
                      value={formData.playlist}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                      required
                    >
                      <option value="">-- Chọn playlist --</option>
                      {playlists.map(playlist => (
                        <option key={playlist._id} value={playlist._id}>
                          {playlist.name}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="bg-secondary p-2 rounded"
                      onClick={() => setShowNewPlaylist(true)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="genre" className="block text-sm font-medium text-gray-300 mb-1">
                    Thể loại <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <select
                      id="genre"
                      name="genre"
                      value={formData.genre}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                      required
                    >
                      <option value="">-- Chọn thể loại --</option>
                      {genres.map(genre => (
                        <option key={genre._id} value={genre.name}>{genre.name}</option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="bg-secondary p-2 rounded"
                      onClick={() => setShowNewGenre(true)}
                    >
                      <FaPlus />
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="durationDisplay" className="block text-sm font-medium text-gray-300 mb-1">
                    Thời lượng (MM:SS) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="durationDisplay"
                    name="durationDisplay"
                    value={formData.durationDisplay}
                    onChange={handleChange}
                    placeholder="Sẽ tự động điền khi chọn file"
                    className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                    readOnly // Để người dùng không tự sửa
                  />
                </div>
              </div>

              {/* Giá và thông tin bổ sung */}
              <div className="space-y-4">
                <div>
                  <label htmlFor="audioFile" className="block text-sm font-medium text-gray-300 mb-1">
                    File nhạc <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col md:flex-row">
                    <label className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 cursor-pointer rounded-md md:rounded-r-none">
                      <input
                        type="file"
                        id="audioFile"
                        accept="audio/mp3,audio/wav,audio/flac"
                        onChange={handleAudioFileChange}
                        className="hidden"
                      />
                      Chọn file
                    </label>
                    <button
                      type="button"
                      onClick={handleAudioUpload}
                      disabled={!audioFile || audioUploading}
                      className="ml-3 px-4 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:bg-secondary-dark disabled:bg-gray-500 flex items-center"
                    >
                      {audioUploading ? (
                        <div className="spinner-sm mr-2"></div>
                      ) : (
                        <FaUpload className="mr-2" />
                      )}
                      Tải lên
                    </button>
                  </div>
                  {audioFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      File đã chọn: {audioFile.name}
                    </p>
                  )}
                  {audioUploading && uploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300" 
                          style={{width: `${uploadProgress}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Đang tải lên: {uploadProgress}%</p>
                    </div>
                  )}
                  {formData.audioUrl && (
                    <p className="text-xs text-green-400 mt-1">
                      URL nhạc đã tải lên: <a href={formData.audioUrl} target="_blank" rel="noopener noreferrer" className="underline">{formData.audioUrl.substring(0, 50)}...</a>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Tải lên file MP3, WAV hoặc FLAC. Tối đa 100MB</p>
                </div>

                <div>
                  <label htmlFor="imageFile" className="block text-sm font-medium text-gray-300 mb-1">
                    Ảnh bìa
                  </label>
                  <div className="flex flex-col md:flex-row">
                    <label className="bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 cursor-pointer rounded-md md:rounded-r-none">
                      <input
                        type="file"
                        id="imageFile"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handleImageFileChange}
                        className="hidden"
                      />
                      Chọn file
                    </label>
                    <button
                      type="button"
                      onClick={handleImageUpload}
                      disabled={!imageFile || imageUploading}
                      className="ml-3 px-4 py-2 bg-secondary text-white rounded-md text-sm font-medium hover:bg-secondary-dark disabled:bg-gray-500 flex items-center"
                    >
                      {imageUploading ? `Đang tải... ${imageUploadProgress}%` : 'Tải lên'}
                    </button>
                  </div>
                  {imageFile && (
                    <p className="text-xs text-gray-400 mt-1">
                      File đã chọn: {imageFile.name}
                    </p>
                  )}
                  {imageUploading && imageUploadProgress > 0 && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300" 
                          style={{width: `${imageUploadProgress}%`}}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">Đang tải lên: {imageUploadProgress}%</p>
                    </div>
                  )}
                  {formData.imageUrl && (
                    <p className="text-xs text-green-400 mt-1">
                      URL ảnh bìa đã tải lên: <a href={formData.imageUrl} target="_blank" rel="noopener noreferrer" className="underline">{formData.imageUrl.substring(0, 50)}...</a>
                    </p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Tải lên ảnh JPG, PNG hoặc WEBP. Tối đa 10MB</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label htmlFor="price.mp3" className="block text-sm font-medium text-gray-300 mb-1">
                      Giá MP3 ($)
                    </label>
                    <input
                      type="number"
                      id="price.mp3"
                      name="price.mp3"
                      value={formData.price.mp3}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label htmlFor="price.flac" className="block text-sm font-medium text-gray-300 mb-1">
                      Giá FLAC ($)
                    </label>
                    <input
                      type="number"
                      id="price.flac"
                      name="price.flac"
                      value={formData.price.flac}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                  <div>
                    <label htmlFor="price.wav" className="block text-sm font-medium text-gray-300 mb-1">
                      Giá WAV ($)
                    </label>
                    <input
                      type="number"
                      id="price.wav"
                      name="price.wav"
                      value={formData.price.wav}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="lyrics" className="block text-sm font-medium text-gray-300 mb-1">
                    Lời bài hát
                  </label>
                  <textarea
                    id="lyrics"
                    name="lyrics"
                    value={formData.lyrics}
                    onChange={handleChange}
                    rows="4"
                    className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                    placeholder="Nhập lời bài hát ở đây..."
                  ></textarea>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded text-secondary focus:ring-secondary border-gray-600 bg-gray-700"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-300">
                    Hiển thị bài hát ngay sau khi tạo
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => navigate('/admin/songs')}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded mr-3"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={loading}
                className="bg-secondary hover:bg-secondary-dark text-primary py-2 px-4 rounded flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <FaSave className="mr-2" />
                {loading ? 'Đang xử lý...' : 'Lưu bài hát'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal thêm nghệ sĩ mới */}
      {showNewArtist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark p-6 rounded-lg w-96">
            <h3 className="text-xl text-white mb-4">Thêm Nghệ Sĩ Mới</h3>
            <form onSubmit={handleAddNewArtist}>
              <div className="mb-4">
                <label className="block text-white mb-2">Tên nghệ sĩ</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white rounded p-2"
                  value={newArtist.name}
                  onChange={(e) => setNewArtist({...newArtist, name: e.target.value})}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Tiểu sử</label>
                <textarea
                  className="w-full bg-gray-800 text-white rounded p-2"
                  value={newArtist.bio}
                  onChange={(e) => setNewArtist({...newArtist, bio: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowNewArtist(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-white px-4 py-2 rounded"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal thêm playlist mới */}
      {showNewPlaylist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-dark p-6 rounded-lg w-96">
            <h3 className="text-xl text-white mb-4">Thêm Playlist Mới</h3>
            <form onSubmit={handleCreatePlaylist}>
              <div className="mb-4">
                <label className="block text-white mb-2">Tên Playlist</label>
                <input
                  type="text"
                  className="w-full bg-gray-800 text-white rounded p-2"
                  value={newPlaylist.name}
                  onChange={(e) => setNewPlaylist({...newPlaylist, name: e.target.value})}
                />
              </div>
              <div className="mb-4">
                <label className="block text-white mb-2">Mô tả</label>
                <textarea
                  className="w-full bg-gray-800 text-white rounded p-2"
                  value={newPlaylist.description}
                  onChange={(e) => setNewPlaylist({...newPlaylist, description: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="bg-gray-600 text-white px-4 py-2 rounded"
                  onClick={() => setShowNewPlaylist(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-secondary text-white px-4 py-2 rounded"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Thêm Thể loại mới */}
      {showNewGenre && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-primary p-8 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-2xl font-bold text-white mb-6">Thêm Thể Loại Mới</h3>
            <form onSubmit={handleCreateGenre} className="space-y-4">
              <div>
                <label htmlFor="newGenreName" className="block text-sm font-medium text-gray-300 mb-1">
                  Tên thể loại <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="newGenreName"
                  name="name"
                  value={newGenre.name}
                  onChange={(e) => setNewGenre({...newGenre, name: e.target.value})}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                  required
                />
              </div>
              <div>
                <label htmlFor="newGenreDescription" className="block text-sm font-medium text-gray-300 mb-1">
                  Mô tả
                </label>
                <textarea
                  id="newGenreDescription"
                  name="description"
                  value={newGenre.description}
                  onChange={(e) => setNewGenre({...newGenre, description: e.target.value})}
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                  rows="3"
                ></textarea>
              </div>
              <div>
                <label htmlFor="newGenreColor" className="block text-sm font-medium text-gray-300 mb-1">
                  Màu sắc (Hex code)
                </label>
                <input
                  type="text"
                  id="newGenreColor"
                  name="color"
                  value={newGenre.color}
                  onChange={(e) => setNewGenre({...newGenre, color: e.target.value})}
                  placeholder="#RRGGBB"
                  className="w-full px-3 py-2 bg-dark border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary"
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewGenre(false)}
                  className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-md"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="bg-secondary hover:bg-secondary-dark text-primary py-2 px-4 rounded-md"
                >
                  Tạo thể loại
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AddSong; 