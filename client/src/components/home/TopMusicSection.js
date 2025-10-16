import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaHeart, FaComment, FaArrowRight, FaRegThumbsUp, FaRegThumbsDown, FaRegComment, FaVolumeUp, FaDownload, FaPlus, FaShareAlt, FaMusic, FaPause } from 'react-icons/fa';
import API from '../../services/api';
import { usePlaylistManager } from '../../context/PlaylistManagerContext';

const TopMusicSection = () => {
  const [hoveredSong, setHoveredSong] = useState(null);
  const [newSongs, setNewSongs] = useState([]);
  const [topSongs, setTopSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { 
    currentSong, 
    isPlaying, 
    playSong, 
    pauseSong, 
    setPlaylist,
  } = usePlaylistManager();
  
  useEffect(() => {
    const fetchSongs = async () => {
      try {
        setLoading(true);
        // Lấy danh sách bài hát mới nhất
        const response = await API.getAllMusic({ 
          page: 1, 
          limit: 10, 
          sort: '-createdAt' 
        });
        
        // Sửa lỗi ở đây: Lấy data từ response.data.data
        if (response && response.data && response.data.data) { 
          const songs = response.data.data;
          setNewSongs(songs);
          setTopSongs(songs.slice(0, 5)); 
        }
      } catch (error) {
        console.error('Error fetching songs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSongs();
  }, [setPlaylist]); 

  // Handle play/pause song
  const handlePlaySong = (song) => {
    if (currentSong && currentSong._id === song._id && isPlaying) {
      pauseSong(); 
    } else {
      setPlaylist(newSongs); 
      playSong(song);      
      if (song._id) {
        try {
          API.songApi.incrementPlayCount(song._id);
          console.log(`Play count incremented for ${song.title}`);
        } catch (err) {
          console.warn('Failed to increment play count in TopMusicSection:', err);
        }
      }
    }
  };

  // Check if song is currently playing
  const isSongPlaying = (song) => {
    return currentSong && currentSong._id === song._id && isPlaying;
  };
  
  return (
    <div className="bg-dark text-white py-8">
      {/* Top 10 Songs Section */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="text-secondary mr-2">Top 10</span> bài hát hôm nay
          </h2>
          <Link to="/music" className="text-secondary hover:underline flex items-center group">
            <span className="group-hover:mr-2 transition-all duration-300">Xem thêm</span> 
            <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        
        {/* Songs Showcase Slider */}
        <div className="relative overflow-hidden">
          <div className="flex space-x-4 overflow-x-auto pb-5 -mx-4 px-4 scrollbar-hide">
            {/* First Featured Song with large display */}
            {topSongs.length > 0 ? (
              <div className="w-full md:w-1/3 flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <img src={topSongs[0].imageUrl || "https://placehold.co/300x400/1a1a2e/ffffff?text=Hit+Song+1"} alt="Top Song" className="w-full h-80 object-cover rounded-lg shadow-md group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]" />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-dark to-transparent">
                  <h3 className="text-xl font-bold mb-1 group-hover:text-secondary transition-colors duration-300">{topSongs[0].title}</h3>
                  <p className="text-gray-300">{topSongs[0].artist?.name || topSongs[0].artist}</p>
                </div>
                <div className="absolute top-2 right-2 bg-secondary text-primary px-2 py-1 rounded text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  #1
                </div>
                <Link to={`/music/${topSongs[0]._id}`} className="absolute inset-0 z-20">
                  <span className="sr-only">Xem chi tiết bài hát "{topSongs[0].title}"</span>
                </Link>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePlaySong(topSongs[0]);
                    }}
                    className="bg-secondary hover:bg-secondary/80 text-primary p-4 rounded-full shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300"
                  >
                    {isSongPlaying(topSongs[0]) ? (
                      <FaPause className="text-xl" />
                    ) : (
                      <FaPlay className="text-xl" />
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full md:w-1/3 flex-shrink-0 relative group">
                <div className="w-full h-80 bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400">Chưa có bài hát nào</p>
                </div>
              </div>
            )}
            
            {/* Other Featured Songs */}
            {topSongs.slice(1, 5).map((song, index) => (
              <div key={song._id} className="w-full md:w-1/6 flex-shrink-0 relative group">
                <div className="absolute inset-0 bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                <img src={song.imageUrl || `https://placehold.co/300x400/1a1a2e/ffffff?text=Song+${index + 2}`} alt={song.title} className="w-full h-80 object-cover rounded-lg shadow-md group-hover:shadow-2xl transition-all duration-300 transform group-hover:scale-[1.02]" />
                <div className="absolute bottom-0 left-0 w-full p-4 bg-gradient-to-t from-dark to-transparent">
                  <h3 className="text-md font-bold mb-1 group-hover:text-secondary transition-colors duration-300">{song.title}</h3>
                  <p className="text-gray-300 text-sm">{song.artist?.name || song.artist}</p>
                </div>
                <div className="absolute top-2 right-2 bg-secondary text-primary px-2 py-1 rounded text-sm font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                  #{index + 2}
                </div>
                <Link to={`/music/${song._id}`} className="absolute inset-0 z-20">
                  <span className="sr-only">Xem chi tiết bài hát "{song.title}"</span>
                </Link>
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePlaySong(song);
                    }}
                    className="bg-secondary hover:bg-secondary/80 text-primary p-3 rounded-full shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300"
                  >
                    {isSongPlaying(song) ? (
                      <FaPause className="text-md" />
                    ) : (
                      <FaPlay className="text-md" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Slider Controls */}
          <button className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-primary bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-80 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-primary bg-opacity-50 rounded-full p-2 text-white hover:bg-opacity-80 transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Category and Rankings Section */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Trending Section - Replace with real data if available, otherwise remove/refactor*/}
          <div className="bg-primary bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <FaPlay className="text-secondary mr-2" /> THỊNH HÀNH NHẤT
              </h3>
              <Link to="/music?category=trending" className="text-secondary hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {/* Placeholder for trending songs */}
              <p className="text-gray-400 text-sm text-center py-4">Đang tải dữ liệu thịnh hành...</p>
            </div>
          </div>
          
          {/* Most Loved Section - Replace with real data if available, otherwise remove/refactor*/}
          <div className="bg-primary bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <FaHeart className="text-secondary mr-2" /> YÊU THÍCH NHẤT
              </h3>
              <Link to="/music?category=favorite" className="text-secondary hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-3">
              {/* Placeholder for most loved songs */}
              <p className="text-gray-400 text-sm text-center py-4">Đang tải dữ liệu yêu thích...</p>
            </div>
          </div>
          
          {/* Hot Genres Section - Replace with real data if available, otherwise remove/refactor*/}
          <div className="bg-primary bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <FaMusic className="text-secondary" /> THỂ LOẠI HOT
              </h3>
              <Link to="/music" className="text-secondary hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {/* Placeholder for hot genres buttons */}
              <p className="text-gray-400 text-sm text-center py-4 w-full">Đang tải thể loại...</p>
            </div>
            <div className="space-y-3 mt-6">
              {/* Placeholder for genre songs */}
              {/* <p className="text-gray-400 text-sm text-center py-4">Đang tải bài hát theo thể loại...</p> */}
            </div>
          </div>
          
          {/* Recent Comments Section - Replace with real data if available, otherwise remove/refactor*/}
          <div className="bg-primary bg-opacity-20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold flex items-center">
                <FaComment className="text-secondary mr-2" /> BÌNH LUẬN MỚI
              </h3>
              <Link to="/music" className="text-secondary hover:underline text-sm">
                Xem tất cả
              </Link>
            </div>
            <div className="space-y-4">
              {/* Placeholder for recent comments */}
              <p className="text-gray-400 text-sm text-center py-4">Đang tải bình luận...</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* New Updates Section */}
      <div className="max-w-7xl mx-auto px-4 mt-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            <span className="text-secondary mr-2">Nhạc mới</span> cập nhật
          </h2>
          <Link to="/music?category=new-releases" className="text-secondary hover:underline flex items-center group">
            <span className="group-hover:mr-2 transition-all duration-300">Xem thêm</span> 
            <FaArrowRight className="ml-1 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                     {loading ? (
             Array.from({length: 10}, (_, i) => (
               <div key={i} className="bg-gray-700 animate-pulse rounded-lg">
                 <div className="w-full aspect-square bg-gray-600 rounded-t-lg"></div>
                 <div className="p-3">
                   <div className="h-4 bg-gray-600 rounded mb-2"></div>
                   <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                 </div>
               </div>
             ))
           ) : newSongs.length === 0 ? (
             <div className="col-span-full text-center text-gray-400 py-8">
               <FaMusic className="text-4xl mx-auto mb-4 opacity-50" />
               <p>Chưa có bài hát nào được upload. Hãy là người đầu tiên!</p>
             </div>
           ) : (
             newSongs.map((song, index) => (
               <div key={song._id} className="bg-primary bg-opacity-30 rounded-lg overflow-hidden group relative">
                 <Link to={`/music/${song._id}`}>
                   <img 
                     src={song.imageUrl || `https://placehold.co/300/1a1a2e/ffffff?text=${song.title}`} 
                     alt={song.title} 
                     className="w-full aspect-square object-cover group-hover:scale-110 transition-transform duration-500" 
                   />
                 </Link>
                 <div 
                   className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-3"
                   onMouseEnter={() => setHoveredSong(song._id)}
                   onMouseLeave={() => setHoveredSong(null)}
                 >
                   <div className="flex space-x-2 mb-2">
                     <button 
                       onClick={(e) => {
                         e.preventDefault();
                         handlePlaySong(song);
                       }}
                       className="bg-secondary text-primary p-2 rounded-full hover:scale-110 transition-transform"
                     >
                       {isSongPlaying(song) ? <FaPause /> : <FaPlay />}
                     </button>
                     <button className="bg-white bg-opacity-20 p-2 rounded-full hover:scale-110 transition-transform">
                       <FaVolumeUp />
                     </button>
                     <button className="bg-white bg-opacity-20 p-2 rounded-full hover:scale-110 transition-transform">
                       <FaHeart />
                     </button>
                   </div>
                   <div className="flex justify-between items-center">
                     <div className="flex items-center space-x-3">
                       <button className="text-white hover:text-secondary transition-colors duration-300 hover:scale-110 transform">
                         <FaDownload />
                       </button>
                       <button className="text-white hover:text-pink-500 transition-colors duration-300 hover:scale-110 transform">
                         <FaHeart />
                       </button>
                     </div>
                     <div className="flex items-center space-x-3">
                       <button className="text-white hover:text-blue-400 transition-colors duration-300 hover:scale-110 transform">
                         <FaDownload />
                       </button>
                       <button className="text-white hover:text-yellow-400 transition-colors duration-300 hover:scale-110 transform">
                         <FaShareAlt />
                       </button>
                     </div>
                   </div>
                   <div className="mt-2 text-xs text-gray-400">
                     <span className="mr-3">{song.playCount || 0} lượt nghe</span>
                     <span>{song.likes?.length || 0} lượt thích</span>
                   </div>
                 </div>
                 
                 <div className="p-3">
                   <Link to={`/music/${song._id}`} className="block">
                     <h4 className="font-medium hover:text-secondary transition-colors line-clamp-1">{song.title}</h4>
                     <p className="text-gray-400 text-sm line-clamp-1">{song.artist?.name || song.artist}</p>
                   </Link>
                 </div>
                 
                 {/* New label */}
                 {index < 3 && (
                   <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full transform rotate-0 group-hover:-rotate-12 transition-transform duration-300 shadow-md">
                     MỚI
                   </div>
                 )}
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
};

// Helper functions to provide data (ALL REMOVED)

export default TopMusicSection; 