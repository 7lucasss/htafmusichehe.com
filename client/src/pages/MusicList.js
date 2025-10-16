import React, { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaSearch, FaShoppingCart, FaPlay, FaPause, FaHeart, FaRegHeart, FaFilter, FaSort, FaMusic, FaHeadphones, FaDownload, FaPlus, FaInfoCircle } from 'react-icons/fa';
import API from '../services/api';
import { usePlaylistManager } from '../context/PlaylistManagerContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import SongCard from '../components/common/SongCard';
import Pagination from '../components/common/Pagination';

const MusicList = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 100]);
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [favoriteTracks, setFavoriteTracks] = useState([]);
  
  // New states for API data
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Lấy các hàm từ PlaylistContext
  const {
    currentSong,
    isPlaying,
    playSong,
    pauseSong, // Đảm bảo pauseSong được destructure tại đây
    setPlaylist,
  } = usePlaylistManager();


  // Fetch songs when filters change
  useEffect(() => {
    fetchSongs();
  }, [selectedCategory, selectedGenres, page, searchQuery]);

  const fetchSongs = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        page,
        limit: 12, // Tăng giới hạn để lấp đầy grid
        genre: selectedGenres.length > 0 ? selectedGenres.join(',') : undefined,
        sort: getSortParam(),
        search: searchQuery || undefined,
      };

      // Gọi API đúng
      const response = await API.getAllMusic(params);
      
      // Sửa lỗi ở đây: Đảm bảo songs luôn là một mảng
      if (response && response.data) {
        setSongs(response.data.data || []); // Nếu songs không tồn tại, dùng mảng rỗng
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setSongs([]);
        setTotalPages(1);
      }
    } catch (err) {
      setError('Có lỗi xảy ra khi tải danh sách bài hát');
      console.error('Error fetching songs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getSortParam = () => {
    switch (selectedCategory) {
      case 'new-releases':
        return '-createdAt';
      case 'top-charts':
        return '-playCount';
      case 'trending':
        return '-playCount';
      default:
        return '-createdAt';
    }
  };

  // Toggle play/pause - Sử dụng logic từ Context
  const handlePlaySong = (song) => {
    // Nếu bài hát được chọn đã có trong playlist hiện tại và đang được phát
    if (currentSong && currentSong._id === song._id && isPlaying) {
      pauseSong(); // Sử dụng pauseSong trực tiếp
    } else {
      // Nếu không, bắt đầu phát bài hát này
      setPlaylist(songs); // Đặt toàn bộ danh sách bài hát làm playlist hiện tại
      playSong(song); // Phát bài hát được chọn
      if (song._id) {
        try {
          API.songApi.incrementPlayCount(song._id);
          console.log(`Play count incremented for ${song.title}`);
        } catch (err) {
          console.warn('Failed to increment play count in MusicList:', err);
        }
      }
    }
  };

  const isSongPlaying = (song) => {
    return currentSong && currentSong._id === song._id && isPlaying;
  };
  
  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1); // Reset to first page
    fetchSongs();
  };

  // Thêm hàm toggleGenre
  const toggleGenre = (genre) => {
    setSelectedGenres((prev) =>
      prev.includes(genre)
        ? prev.filter((g) => g !== genre)
        : [...prev, genre]
    );
  };

  return (
    <div className="bg-dark text-white min-h-screen">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-primary to-dark py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Kho Nhạc Chất Lượng Cao</h1>
          <p className="text-lg md:text-xl opacity-90 mb-8 max-w-3xl mx-auto">
            Khám phá và sở hữu những bản nhạc chất lượng cao từ các nghệ sĩ hàng đầu. Tải nhạc Lossless, FLAC, và MP3 320kbps.
          </p>
          
          {/* Search bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto mb-4">
            <input
              type="text"
              placeholder="Tìm kiếm bài hát, nghệ sĩ hoặc album..."
              className="w-full px-5 py-3 rounded-full bg-white bg-opacity-10 border border-gray-600 focus:border-secondary focus:ring-2 focus:ring-secondary outline-none text-white pr-12 transition-all duration-300 focus:bg-opacity-20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-secondary">
              <FaSearch />
            </button>
          </form>
          
          {/* Filter toggle */}
          <button 
            onClick={() => setShowFilters(!showFilters)} 
            className="flex items-center mx-auto gap-2 bg-secondary bg-opacity-20 hover:bg-opacity-30 px-4 py-2 rounded-full transition-all duration-300"
          >
            <FaFilter /> 
            <span>{showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc'}</span>
          </button>
        </div>
      </div>
      
      {/* Filters section */}
      {showFilters && (
        <div className="bg-primary bg-opacity-60 py-6 px-4 border-t border-b border-gray-700">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaMusic className="text-secondary" /> Thể loại
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Pop', 'Rock', 'Hip-hop', 'EDM', 'R&B', 'Jazz', 'Classical', 'Folk'].map(genre => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-1 rounded-full text-sm transition-all duration-300 ${
                      selectedGenres.includes(genre)
                        ? 'bg-secondary text-primary'
                        : 'bg-gray-700 hover:bg-gray-600'
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaSort className="text-secondary" /> Sắp xếp theo
              </h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 rounded-full text-sm bg-secondary text-primary">
                  Mới nhất
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-700 hover:bg-gray-600 transition-all duration-300">
                  Phổ biến nhất
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-700 hover:bg-gray-600 transition-all duration-300">
                  Giá: Thấp đến cao
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-700 hover:bg-gray-600 transition-all duration-300">
                  Giá: Cao đến thấp
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaHeadphones className="text-secondary" /> Định dạng
              </h3>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1 rounded-full text-sm bg-secondary text-primary">
                  Tất cả
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-700 hover:bg-gray-600 transition-all duration-300">
                  FLAC
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-700 hover:bg-gray-600 transition-all duration-300">
                  MP3 320kbps
                </button>
                <button className="px-3 py-1 rounded-full text-sm bg-gray-700 hover:bg-gray-600 transition-all duration-300">
                  WAV
                </button>
              </div>
            </div>
            
            <div className="md:col-span-3">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FaDownload className="text-secondary" /> Khoảng giá
              </h3>
              <div className="px-3">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-secondary"
                />
                <div className="flex justify-between mt-1 text-sm">
                  <span>0đ</span>
                  <span>50.000đ</span>
                  <span>100.000đ+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main content section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Category tabs */}
        <div className="flex overflow-x-auto scrollbar-hide space-x-2 mb-8 pb-2">
          {['all', 'trending', 'new-releases', 'top-charts', 'recommended', 'playlists'].map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-md whitespace-nowrap transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-secondary text-primary font-semibold'
                  : 'bg-primary bg-opacity-40 hover:bg-opacity-60'
              }`}
            >
              {getCategoryLabel(category)}
            </button>
          ))}
        </div>

        {/* View mode toggle */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {getCategoryLabel(selectedCategory)} 
            <span className="text-gray-400 text-sm ml-2">({songs.length} bài hát)</span>
          </h2>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-700 text-secondary' : 'text-gray-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-700 text-secondary' : 'text-gray-400'}`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Loading state */}
        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary"></div>
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="text-red-500 text-center py-8">
            {error}
          </div>
        )}

        {/* Music grid view */}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 p-4">
            {songs.map((song, index) => (
              <div key={song._id} className="bg-primary bg-opacity-30 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
                <div className="relative">
                  {/* Album cover */}
                  <img 
                    src={song.imageUrl} 
                    alt={song.title} 
                    className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center justify-center">
                    <button
                      onClick={() => handlePlaySong(song)}
                      className="text-white text-4xl p-2 rounded-full bg-secondary-dark hover:bg-secondary transition-colors"
                    >
                      {isSongPlaying(song) ? <FaPause size={20} /> : <FaPlay size={20} />}
                    </button>
                  </div>
                </div>
                
                {/* Track info */}
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-1 truncate">{song.title}</h3>
                  <p className="text-gray-400 text-sm mb-2 truncate">{song.artist.name}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary font-medium">
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(song.price.mp3)}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-400">{formatDuration(song.duration)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2 py-4">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded bg-primary disabled:opacity-50"
            >
              Trước
            </button>
            <span className="px-4 py-2">
              Trang {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 rounded bg-primary disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        )}
      </div>
      
      {/* Now playing bar */}
      {/* Removed: Duplicated by AudioPlayer component with pop-out functionality */}
    </div>
  );
};

// Helper functions

// Format price to Vietnamese Dong
function formatPrice(price) {
  return `${price.toLocaleString('vi-VN')}đ`;
}

// Helper function to format duration
const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

// Helper function to get category labels
function getCategoryLabel(category) {
  const labels = {
    'all': 'Tất cả',
    'trending': 'Thịnh hành',
    'new-releases': 'Mới phát hành',
    'top-charts': 'Bảng xếp hạng',
    'recommended': 'Đề xuất cho bạn',
    'playlists': 'Playlist'
  };
  
  return labels[category] || 'Tất cả';
}

export default MusicList; 