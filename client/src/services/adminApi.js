import API from './api';

// Dashboard
export const getDashboardData = () => {
  return API.getAdminDashboard();
};

// User Management
export const getUsers = () => {
  return API.getAdminUsers();
};

export const getUser = (userId) => {
  return API.get(`/admin/users/${userId}`);
};

export const updateUser = (userId, userData) => {
  return API.updateUser(userId, userData);
};

export const deleteUser = (userId) => {
  return API.deleteUser(userId);
};

// Song Management
export const getSongs = () => {
  return API.getAdminSongs();
};

export const getSong = (songId) => {
  return API.get(`/admin/songs/${songId}`);
};

export const createSong = (songData) => {
  return API.createAdminSong(songData);
};

export const updateSong = (songId, songData) => {
  return API.updateAdminSong(songId, songData);
};

export const deleteSong = (songId) => {
  return API.deleteAdminSong(songId);
};

// Playlist Management
export const getPlaylists = () => {
  return API.getAdminPlaylists();
};

export const getPlaylist = (playlistId) => {
  return API.getAdminPlaylistById(playlistId);
};

export const createPlaylist = (playlistData) => {
  return API.createAdminPlaylist(playlistData);
};

export const updatePlaylist = (playlistId, playlistData) => {
  return API.updateAdminPlaylist(playlistId, playlistData);
};

export const deletePlaylist = (playlistId) => {
  return API.deleteAdminPlaylist(playlistId);
};

// Stats and Reports
export const getSalesReport = (period) => {
  return API.get(`/admin/reports/sales?period=${period}`);
};

export const getUserStats = () => {
  return API.get('/admin/reports/users');
};

export const getMusicStats = () => {
  return API.get('/admin/reports/music');
};

// Artist Management  
export const getArtists = () => {
  return API.getAdminArtists();
};

export const getArtist = (artistId) => {
  return API.getAdminArtistById(artistId);
};

export const createArtist = (artistData) => {
  return API.createAdminArtist(artistData);
};

export const updateArtist = (artistId, artistData) => {
  return API.updateAdminArtist(artistId, artistData);
};

export const deleteArtist = (artistId) => {
  return API.deleteAdminArtist(artistId);
};

// Genre Management
export const getGenres = () => {
  return API.getAdminGenres();
};

export const getPopularGenres = (limit = 10) => {
  return API.get(`/genres/popular?limit=${limit}`);
};

export const getGenre = (genreId) => {
  return API.get(`/admin/genres/${genreId}`); // TODO: Create getAdminGenreById in api.js
};

export const createGenre = (genreData) => {
  return API.createAdminGenre(genreData);
};

export const updateGenre = (genreId, genreData) => {
  return API.updateAdminGenre(genreId, genreData);
};

export const deleteGenre = (genreId) => {
  return API.deleteAdminGenre(genreId);
};

// API để cập nhật quyền đăng tin tuyển dụng
const updateUserJobPermission = (userId, canPostJobs) => {
  return API.put(`/admin/users/${userId}/job-permission`, { canPostJobs });
};

// Upload services
export const uploadImage = (file, onProgress) => {
  return API.uploadImage(file, onProgress);
};

export const uploadAudio = (file, onProgress) => {
  return API.uploadAudio(file, onProgress);
};

// Job Management
export const getJobs = () => {
  return API.getJobs();
};

export const deleteJob = (jobId) => {
  return API.deleteJob(jobId);
};

// Admin Management
export const createAdmin = (adminData) => {
  return API.createAdmin(adminData);
};

export default {
  // Dashboard
  getDashboardData,
  
  // User Management
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  updateUserJobPermission,
  updateUserMusicUploadPermission: (id, canUploadMusic) => API.put(`/admin/users/${id}/music-upload-permission`, { canUploadMusic }),
  
  // Song Management
  getSongs,
  getSong,
  createSong,
  updateSong,
  deleteSong,
  
  // Playlist Management
  getPlaylists,
  getPlaylist,
  createPlaylist,
  updatePlaylist,
  deletePlaylist,
  
  // Stats & Reports
  getSalesReport,
  getUserStats,
  getMusicStats,

  // Artist Management
  getArtists,
  getArtist,
  createArtist,
  updateArtist,
  deleteArtist,
  
  // Genre Management
  getGenres,
  getPopularGenres,
  getGenre,
  createGenre,
  updateGenre,
  deleteGenre,
  
  // Upload Services
  uploadImage,
  uploadAudio,

  // Job Management
  getJobs,
  deleteJob,

  // Admin Management
  createAdmin,
}; 