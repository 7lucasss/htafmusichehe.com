import React, { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaRegHeart, FaShoppingCart, FaDownload, FaShareAlt, FaPlus, FaMusic, FaVolumeMute, FaVolumeUp, FaCreditCard, FaArrowLeft, FaListUl } from 'react-icons/fa';
import API from '../services/api';
import { usePlaylistManager } from '../context/PlaylistManagerContext';
import { AuthContext } from '../context/AuthContext'; // Import AuthContext

const MusicDetail = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext); // Use useContext to get currentUser

  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('mp3');

  // Sử dụng context của trình phát nhạc
  const {
    currentSong,
    isPlaying,
    isPaused,
    playSong,
    pauseSong,
    resumeSong,
    setVolume,
    toggleMute, // Đảm bảo toggleMute được destructured
    volume,     // Đảm bảo volume được destructured
  } = usePlaylistManager();

  useEffect(() => {
    const fetchSongDetails = async () => {
      try {
        setLoading(true);
        const response = await API.songApi.getSongById(id);
        setTrack(response.data.data); 
        
        // Kiểm tra xem bài hát có trong danh sách yêu thích của người dùng không
        if (currentUser && response.data.data.likes.includes(currentUser._id)) {
          setIsFavorite(true);
        } else {
          setIsFavorite(false);
        }

        setLoading(false);
      } catch (err) {
        console.error('Error fetching song details:', err);
        setError('Failed to load song details.');
        setLoading(false);
      }
    };
    fetchSongDetails();
  }, [id, currentUser]); // Thêm currentUser vào dependency array

  // Handle Play/Pause based on current song in context
  const handlePlayPause = useCallback(() => {
    if (!track) return;

    if (currentSong && currentSong._id === track._id) {
      if (isPlaying) {
        pauseSong();
      } else if (isPaused) {
        resumeSong();
      } else {
        playSong(track); // If it's the same song but stopped, play it.
        if (track._id) {
          try {
            API.songApi.incrementPlayCount(track._id);
            console.log(`Play count incremented for ${track.title}`);
          } catch (err) {
            console.warn('Failed to increment play count in MusicDetail:', err);
          }
        }
      }
    } else {
      playSong(track); // If it's a different song, play this one.
      if (track._id) {
        try {
          API.songApi.incrementPlayCount(track._id);
          console.log(`Play count incremented for ${track.title}`);
        } catch (err) {
          console.warn('Failed to increment play count in MusicDetail:', err);
        }
      }
    }
  }, [currentSong, isPlaying, isPaused, playSong, pauseSong, resumeSong, track]);

  const handleToggleFavorite = useCallback(async () => {
    if (!currentUser) {
      alert('Bạn cần đăng nhập để thực hiện chức năng này.');
      return;
    }
    if (!track) return;

    try {
      const response = await API.songApi.toggleLike(track._id);
      // Cập nhật state isFavorite dựa trên phản hồi của API
      setIsFavorite(response.data.data.liked);
      // Cập nhật lượt thích hiển thị trên UI
      setTrack(prevTrack => ({
        ...prevTrack,
        likes: response.data.data.liked ? [...prevTrack.likes, currentUser._id] : prevTrack.likes.filter(id => id !== currentUser._id),
        likesCount: response.data.data.likesCount
      }));
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Không thể cập nhật trạng thái yêu thích.');
    }
  }, [currentUser, track]);

  const isCurrentSongPlaying = currentSong && currentSong._id === track?._id && isPlaying;

  if (loading) {
    return (
      <div className="bg-dark text-white min-h-screen py-12 px-4 flex items-center justify-center">
        <p>Loading song details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-dark text-white min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Error Loading Song</h1>
          <p className="mb-8">{error}</p>
          <Link to="/music" className="inline-block bg-secondary text-primary px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all">
            <FaArrowLeft className="inline mr-2" /> Back to Music List
          </Link>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="bg-dark text-white min-h-screen py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Song Not Found</h1>
          <p className="mb-8">The song you are looking for does not exist or has been removed.</p>
          <Link to="/music" className="inline-block bg-secondary text-primary px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-all">
            <FaArrowLeft className="inline mr-2" /> Back to Music List
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-primary bg-opacity-20 rounded-lg p-6 max-w-5xl mx-auto my-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Song Image and Main Controls */}
        <div className="md:w-1/3 flex flex-col items-center justify-center p-4 bg-dark-light rounded-lg shadow-lg">
          <img
            src={track.imageUrl || 'https://placehold.co/300/1a1a2e/ffffff?text=Music'}
            alt={track.title}
            className="w-full max-w-xs rounded-lg shadow-xl mb-6"
          />
          <h1 className="text-3xl font-bold text-white text-center mb-2">{track.title}</h1>
          <Link to={`/artists/${track.artist._id}`} className="text-secondary text-lg hover:underline mb-4">
            {track.artist?.name || 'Unknown Artist'}
          </Link>
          
          <div className="flex items-center mb-6">
            <button className="p-2 mx-1 text-gray-400 hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0019 16V8a1 1 0 00-1.6-.8l-5.334 4zM4.066 11.2a1 1 0 000 1.6l5.334 4A1 1 0 0011 16V8a1 1 0 00-1.6-.8l-5.334 4z" />
              </svg>
            </button>
            
            <button
              onClick={handlePlayPause} // Sử dụng hàm từ context
              className="p-4 bg-secondary text-primary rounded-full hover:bg-opacity-90 transition-all mx-2"
            >
              {isCurrentSongPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg" />}
            </button>
            
            <button className="p-2 mx-1 text-gray-400 hover:text-white transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.933 12.8a1 1 0 000-1.6L6.6 7.2A1 1 0 005 8v8a1 1 0 001.6.8l5.333-4zM19.933 12.8a1 1 0 000-1.6l-5.333-4A1 1 0 0013 8v8a1 1 0 001.6.8l5.333-4z" />
              </svg>
            </button>
          </div>
          
          {/* Volume Control */}
          <div className="flex items-center w-full px-4 mb-6">
            <button
              onClick={toggleMute}
              className="p-2 hover:scale-110 transition-transform duration-300 mr-2 text-gray-400 hover:text-white"
            >
              {volume === 0 ? <FaVolumeMute className="text-xl" /> : <FaVolumeUp className="text-xl" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume} // Display 0 if muted
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-full h-1 bg-gray-700 rounded-full appearance-none cursor-pointer slider"
            />
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <button
              onClick={handleToggleFavorite}
              className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center"
            >
              {isFavorite ? <FaHeart className="mr-2 text-red-500" /> : <FaRegHeart className="mr-2" />}
              Favorite
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center">
              <FaShoppingCart className="mr-2" /> Add to Cart
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center">
              <FaDownload className="mr-2" /> Download
            </button>
            <button className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex items-center">
              <FaShareAlt className="mr-2" /> Share
            </button>
          </div>
        </div>

        {/* Song Details */}
        <div className="md:w-2/3 p-4">
          <h2 className="text-2xl font-bold text-white mb-4">Song Details</h2>
          <div className="space-y-3 text-gray-300">
            <p><strong>Genre:</strong> {track.genre?.name || 'Unknown'}</p>
            <p><strong>Duration:</strong> {track.durationFormatted || track.duration} (MM:SS)</p>
            <p><strong>Release Date:</strong> {new Date(track.releaseDate).toLocaleDateString()}</p>
            <p><strong>Play Count:</strong> {track.playCount}</p>
            <p><strong>Likes:</strong> {track.likesCount}</p>
            <p><strong>Downloads:</strong> {track.downloads}</p>
          </div>

          <div className="mt-6">
            <h3 className="text-xl font-bold text-white mb-3">Lyrics</h3>
            {track.lyrics ? (
              <div
                className="bg-dark-light p-4 rounded-md overflow-y-auto max-h-60 text-gray-300 whitespace-pre-wrap"
              >
                {track.lyrics}
              </div>
            ) : (
              <p className="text-gray-400">No lyrics available for this song.</p>
            )}
          </div>

          {/* Pricing Section */}
          <div className="mt-6">
            <h3 className="text-xl font-bold text-white mb-3">Purchase Options</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-light p-4 rounded-md">
                <p className="font-bold text-lg text-white mb-2">MP3</p>
                <p className="text-gray-300">High Quality (320kbps)</p>
                <p className="text-secondary text-2xl font-bold mt-2">${track.price?.mp3 || '0.00'}</p>
                <button className="mt-4 w-full bg-secondary hover:bg-secondary-dark text-primary py-2 rounded-md flex items-center justify-center">
                  <FaCreditCard className="mr-2" /> Buy MP3
                </button>
              </div>
              <div className="bg-dark-light p-4 rounded-md">
                <p className="font-bold text-lg text-white mb-2">FLAC</p>
                <p className="text-gray-300">Lossless Audio</p>
                <p className="text-secondary text-2xl font-bold mt-2">${track.price?.flac || '0.00'}</p>
                <button className="mt-4 w-full bg-secondary hover:bg-secondary-dark text-primary py-2 rounded-md flex items-center justify-center">
                  <FaCreditCard className="mr-2" /> Buy FLAC
                </button>
              </div>
              <div className="bg-dark-light p-4 rounded-md">
                <p className="font-bold text-lg text-white mb-2">WAV</p>
                <p className="text-gray-300">Uncompressed Audio</p>
                <p className="text-secondary text-2xl font-bold mt-2">${track.price?.wav || '0.00'}</p>
                <button className="mt-4 w-full bg-secondary hover:bg-secondary-dark text-primary py-2 rounded-md flex items-center justify-center">
                  <FaCreditCard className="mr-2" /> Buy WAV
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicDetail; 