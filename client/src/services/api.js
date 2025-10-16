import axios from 'axios';
import { setAuthToken, verifyToken } from './authUtils';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Tạo instance axios
const instance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true, // Quan trọng cho việc gửi cookies
});

// Add auth token to requests
instance.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý lỗi
instance.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    if (error.response) {
      // Server trả về lỗi
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // Không nhận được response
      console.error('No response received');
    }
    return Promise.reject(error);
  }
);

// Auth services
const login = (credentials) => {
  return instance.post('/auth/login', credentials);
};

const register = (userData) => {
  console.log('Calling register API:', userData);
  return instance.post('/users/register', userData);
};

const getCurrentUser = () => {
  return instance.get('/auth/me');
};

// Music services
const getAllMusic = (params) => {
  return instance.get('/songs', { params });
};

const getMusicById = (id) => {
  return instance.get(`/songs/${id}`);
};

const getRankings = () => {
  return instance.get('/rankings');
};

// Purchase services
const addToCart = (songId, format) => {
  return instance.post('/cart', { songId, format });
};

const getCart = () => {
  return instance.get('/cart');
};

const removeFromCart = (itemId) => {
  return instance.delete(`/cart/${itemId}`);
};

const checkout = (paymentInfo) => {
  return instance.post('/payments/checkout', paymentInfo);
};

// User profile services
const getUserProfile = () => {
  return instance.get('/users/profile');
};

const updateUserProfile = (userData) => {
  return instance.put('/users/profile', userData);
};

const uploadAvatar = (formData, onProgress) => {
  return instance.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000, // 1 phút timeout cho ảnh
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
        console.log('Avatar upload progress:', percentCompleted + '%');
      }
    }
  });
};

const getPurchaseHistory = () => {
  return instance.get('/users/purchases');
};

const getFavorites = () => {
  return instance.get('/users/favorites');
};

const toggleFavorite = (songId) => {
  return instance.post('/users/favorites/toggle', { songId });
};

// Thêm các API cho admin
const getAdminDashboard = () => {
  return instance.get('/admin/dashboard');
};

const getAdminUsers = () => {
  return instance.get('/admin/users');
};

const updateUser = (userId, userData) => {
  return instance.put(`/admin/users/${userId}`, userData);
};

const deleteUser = (userId) => {
  return instance.delete(`/admin/users/${userId}`);
};

const getAdminSongs = () => {
  return instance.get('/admin/songs');
};

// Thêm vào danh sách các API admin
const createAdmin = (userData) => {
  return instance.post('/auth/create-admin', userData);
};

const createAdminSong = (songData) => {
  return instance.post('/admin/songs', songData);
};

const updateAdminSong = (songId, songData) => {
  return instance.put(`/admin/songs/${songId}`, songData);
};

const deleteAdminSong = (songId) => {
  return instance.delete(`/admin/songs/${songId}`);
};

// ===== Admin Artist Management =====
const getAdminArtists = () => {
  return instance.get('/admin/artists');
};

const getAdminArtistById = (artistId) => {
  return instance.get(`/admin/artists/${artistId}`);
};

const createAdminArtist = (artistData) => {
  return instance.post('/admin/artists', artistData);
};

const updateAdminArtist = (artistId, artistData) => {
  return instance.put(`/admin/artists/${artistId}`, artistData);
};

const deleteAdminArtist = (artistId) => {
  return instance.delete(`/admin/artists/${artistId}`);
};

// ===== Admin Album Management =====
const getAdminAlbums = () => instance.get('/admin/albums');
const createAdminAlbum = (albumData) => instance.post('/admin/albums', albumData);
const updateAdminAlbum = (albumId, albumData) => instance.put(`/admin/albums/${albumId}`, albumData);
const deleteAdminAlbum = (albumId) => instance.delete(`/admin/albums/${albumId}`);

// ===== Admin Genre Management =====
const getAdminGenres = () => instance.get('/admin/genres');
const createAdminGenre = (genreData) => instance.post('/admin/genres', genreData);
const updateAdminGenre = (genreId, genreData) => instance.put(`/admin/genres/${genreId}`, genreData);
const deleteAdminGenre = (genreId) => instance.delete(`/admin/genres/${genreId}`);

// ===== Admin Playlist Management =====
const getAdminPlaylists = () => instance.get('/admin/playlists');
const getAdminPlaylistById = (playlistId) => instance.get(`/admin/playlists/${playlistId}`);
const createAdminPlaylist = (playlistData) => instance.post('/admin/playlists', playlistData);
const updateAdminPlaylist = (playlistId, playlistData) => instance.put(`/admin/playlists/${playlistId}`, playlistData);
const deleteAdminPlaylist = (playlistId) => instance.delete(`/admin/playlists/${playlistId}`);


// Thêm các phương thức upload
const uploadAudio = (file, onProgress) => {
  const formData = new FormData();
  formData.append('audioFile', file);
  
  return instance.post('/uploads/audio', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 300000, // 5 phút timeout cho file audio lớn
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
        console.log('Audio upload progress:', percentCompleted + '%');
      }
    }
  });
};

const uploadImage = (file, onProgress) => {
  const formData = new FormData();
  formData.append('imageFile', file);
  
  return instance.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    timeout: 60000, // 1 phút timeout cho ảnh
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
        console.log('Image upload progress:', percentCompleted + '%');
      }
    }
  });
};

// Thêm vào các API liên quan đến streaming

const getLiveStreams = () => {
  return instance.get('/streams/live');
};

const getUpcomingStreams = () => {
  return instance.get('/streams/upcoming');
};

const getStreamById = (streamId) => {
  return instance.get(`/streams/${streamId}`);
};

const createStream = (streamData) => {
  return instance.post('/streams', streamData);
};

const updateStream = (streamId, streamData) => {
  return instance.put(`/streams/${streamId}`, streamData);
};

const endStream = (streamId) => {
  return instance.post(`/streams/${streamId}/end`);
};

// API cho tin tuyển dụng
const getJobs = () => {
  return instance.get('/jobs');
};

const getJobById = (jobId) => {
  return instance.get(`/jobs/${jobId}`);
};

const createJob = (jobData) => {
  return instance.post('/jobs', jobData);
};

const updateJob = (jobId, jobData) => {
  return instance.put(`/jobs/${jobId}`, jobData);
};

const deleteJob = (jobId) => {
  return instance.delete(`/jobs/${jobId}`);
};

// Đăng tin tuyển dụng nhanh
const createQuickJob = (formData) => {
  return instance.post('/jobs/quick', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Like/unlike tin tuyển dụng
const toggleLikeJob = (jobId) => {
  return instance.post(`/jobs/${jobId}/like`);
};

// Thêm bình luận
const addJobComment = (jobId, commentText) => {
  return instance.post(`/jobs/${jobId}/comment`, { text: commentText });
};

// Xóa bình luận
const deleteJobComment = (jobId, commentId) => {
  return instance.delete(`/jobs/${jobId}/comment/${commentId}`);
};

// Thêm hàm test connection
const testConnection = () => {
  return instance.get('/');
};

const createArtist = (artistData) => {
  return instance.post('/artists', artistData);
};

const createAlbum = (albumData) => {
  return instance.post('/albums', albumData);
};

const getArtists = () => {
  return instance.get('/artists');
};

const getAlbums = () => {
  return instance.get('/albums');
};

// Genre services
const getGenres = () => {
  return instance.get('/genres');
};

const getPopularGenres = (limit = 10) => {
  return instance.get(`/genres/popular?limit=${limit}`);
};

const getGenre = (genreId) => {
  return instance.get(`/genres/${genreId}`);
};

const createGenre = (genreData) => {
  return instance.post('/genres', genreData);
};

const updateGenre = (genreId, genreData) => {
  return instance.put(`/genres/${genreId}`, genreData);
};

const deleteGenre = (genreId) => {
  return instance.delete(`/genres/${genreId}`);
};

// Songs API
const songApi = {
  // Lấy danh sách bài hát
  getSongs: async (params = {}) => {
    const response = await instance.get('/songs', { params });
    return response.data;
  },

  // Lấy chi tiết bài hát
  getSongById: async (id) => {
    const response = await instance.get(`/songs/${id}`);
    return response.data;
  },

  // Tìm kiếm bài hát
  searchSongs: async (query, page = 1, limit = 10) => {
    const response = await instance.get('/songs/search', {
      params: { q: query, page, limit }
    });
    return response.data;
  },

  // Tăng lượt play
  incrementPlayCount: async (id) => {
    const response = await instance.post(`/songs/${id}/play`);
    return response.data;
  },

  // Lấy top bài hát được thích nhiều
  getTopLikedSongs: async (limit = 10) => {
    const response = await instance.get(`/songs/top/liked?limit=${limit}`);
    return response.data;
  },

  // Toggle like
  toggleLike: async (songId) => {
    const response = await instance.post(`/songs/${songId}/like`);
    return response.data;
  },
};

// Audio API
const audioApi = {
  // Lấy thông tin audio
  getAudioInfo: async (songId) => {
    const response = await instance.get(`/audio/info/${songId}`);
    return response.data;
  },

  // Lấy streaming URL
  getStreamUrl: (songId) => {
    return `${API_URL}/audio/stream/${songId}`;
  },

  // Toggle favorite
  toggleFavorite: async (songId) => {
    const response = await instance.post(`/audio/favorite/${songId}`);
    return response.data;
  },

  // Get download URL
  getDownloadUrl: async (songId, format = 'mp3') => {
    const response = await instance.get(`/audio/download/${songId}`, {
      params: { format }
    });
    return response.data;
  },

  // Get waveform data
  getWaveform: async (songId) => {
    const response = await instance.get(`/audio/waveform/${songId}`);
    return response.data;
  }
};

// Playlist services
const getPlaylists = () => {
  return instance.get('/playlists');
};

const getPlaylistById = (playlistId) => {
  return instance.get(`/playlists/${playlistId}`);
};

const createPlaylist = (playlistData) => {
  return instance.post('/playlists', playlistData);
};

const updatePlaylist = (playlistId, playlistData) => {
  return instance.put(`/playlists/${playlistId}`, playlistData);
};

const deletePlaylist = (playlistId) => {
  return instance.delete(`/playlists/${playlistId}`);
};

const addSongToPlaylist = (playlistId, songId) => {
  return instance.post(`/playlists/${playlistId}/songs`, { songId });
};

const removeSongFromPlaylist = (playlistId, songId) => {
  return instance.delete(`/playlists/${playlistId}/songs/${songId}`);
};

// Thêm lại phương thức getSongs
const getSongs = () => {
  return instance.get('/songs');
};

// Thêm lại phương thức uploadFile
const uploadFile = (formData) => {
  return instance.post('/uploads/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
};

// Export các hàm auth
export { setAuthToken, verifyToken } from './authUtils';

export default {
  // Auth services
  login,
  register,
  getCurrentUser,
  
  // Music services
  getAllMusic,
  getMusicById,
  getRankings,
  getSongs,  // Thêm lại getSongs
  
  // Purchase services
  addToCart,
  getCart,
  removeFromCart,
  checkout,
  
  // User profile services
  getUserProfile,
  updateUserProfile,
  uploadAvatar, // Add uploadAvatar here
  getPurchaseHistory,
  getFavorites,
  toggleFavorite,
  
  // Admin services
  getAdminDashboard,
  getAdminUsers,
  updateUser,
  deleteUser,
  getAdminSongs,
  createAdmin,
  createAdminSong,
  updateAdminSong,
  deleteAdminSong,

  // Admin Artists
  getAdminArtists,
  getAdminArtistById,
  createAdminArtist,
  updateAdminArtist,
  deleteAdminArtist,

  // Admin Albums
  getAdminAlbums,
  createAdminAlbum,
  updateAdminAlbum,
  deleteAdminAlbum,

  // Admin Genres
  getAdminGenres,
  createAdminGenre,
  updateAdminGenre,
  deleteAdminGenre,

  // Admin Playlists
  getAdminPlaylists,
  getAdminPlaylistById,
  createAdminPlaylist,
  updateAdminPlaylist,
  deleteAdminPlaylist,

  // Upload services
  uploadAudio,
  uploadImage,
  uploadFile,  // Thêm lại uploadFile
  uploadAvatar, // Add uploadAvatar here
  
  // Streaming services
  getLiveStreams,
  getUpcomingStreams,
  getStreamById,
  createStream,
  updateStream,
  endStream,
  
  // Job services
  getJobs,
  getJobById,
  createJob,
  updateJob,
  deleteJob,
  createQuickJob,
  toggleLikeJob,
  addJobComment,
  deleteJobComment,
  
  // Playlist services
  getPlaylists,
  getPlaylistById,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
  removeSongFromPlaylist,
  
  // Utility
  testConnection,
  
  // Artist & Album
  createArtist,
  createAlbum,
  getArtists,
  getAlbums,
  
  // Genre services
  getGenres,
  getPopularGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre,
  
  // Set auth token
  setAuthToken,

  // API groups
  songApi,
  audioApi,
}; 