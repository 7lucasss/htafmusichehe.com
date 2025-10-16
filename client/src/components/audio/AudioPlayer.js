import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  FaPlay,
  FaPause,
  FaStepBackward,
  FaStepForward,
  FaVolumeUp,
  FaVolumeDown,
  FaVolumeMute,
  FaRandom,
  FaRedoAlt,
  FaList,
  FaHeart,
  FaDownload,
  FaShareAlt,
  FaAccessibleIcon, // Changed from FaExpand/FaCompress
  FaStop, // Add FaStop icon
  FaMusic, // Add FaMusic icon
  FaPlus, // Add FaPlus icon
} from 'react-icons/fa';
import { useAudioPlayer } from '../../context/AudioPlayerContext'; // Use new AudioPlayerContext
import { usePlaylistManager } from '../../context/PlaylistManagerContext'; // Use new PlaylistManagerContext

// Visualizer Component - Defined outside of AudioPlayer to be a proper React component
const Visualizer = React.memo(({ frequencyData }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !frequencyData || frequencyData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    const barWidth = width / frequencyData.length;
    for (let i = 0; i < frequencyData.length; i++) {
      const barHeight = (frequencyData[i] / 255) * height * 0.8;
      const x = i * barWidth;
      const y = height - barHeight;

      const hue = (i / frequencyData.length) * 360;
      ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }, [frequencyData]);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={60}
      className="w-full h-full"
    />
  );
});

const AudioPlayer = ({ className = '' }) => {
  const {
    currentSong,
    isPlaying,
    isPaused,
    currentTime,
    duration,
    progress,
    volume,
    isMuted,
    isLoading,
    error,
    frequencyData,
    playSong,
    pauseSong,
    resumeSong,
    seekTo,
    setVolume,
    toggleMute,
    clearError,
    stopSong,
  } = useAudioPlayer(); // Use AudioPlayerContext

  const {
    isRepeat,
    isShuffle,
    queue,
    playNext,
    playPrevious,
    removeFromQueue,
    toggleRepeat,
    toggleShuffle,
  } = usePlaylistManager(); // Use PlaylistManagerContext for playlist logic

  const [isPopOut, setIsPopOut] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartX, setDragStartX] = useState(0); // Mouse X at start of drag
  const [dragStartY, setDragStartY] = useState(0); // Mouse Y at start of drag
  const [playerStartX, setPlayerStartX] = useState(0); // Player X at start of drag
  const [playerStartY, setPlayerStartY] = useState(0); // Player Y at start of drag

  const [playerX, setPlayerX] = useState(window.innerWidth - 320);
  const [playerY, setPlayerY] = useState(window.innerHeight - 230); // Adjusted for new height of 220px + margin

  const playerRef = useRef(null);
  const [showQueue, setShowQueue] = useState(false);
  
  const progressBarRef = useRef(null);
  const volumeSliderRef = useRef(null);

  // Helper to format time as MM:SS
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle dragging
  const handleMouseDown = useCallback((e) => {
    if (playerRef.current) {
      e.preventDefault(); // Prevent default browser drag behavior (e.g., text selection)
      setIsDragging(true);
      setDragStartX(e.clientX);
      setDragStartY(e.clientY);
      setPlayerStartX(playerX); // Use current playerX/Y from state
      setPlayerStartY(playerY); // Use current playerX/Y from state
    }
  }, [playerX, playerY]); // Depend on playerX, playerY

  const handleMouseMove = useCallback((e) => {
    if (isDragging) {
      const deltaX = e.clientX - dragStartX;
      const deltaY = e.clientY - dragStartY;
      setPlayerX(playerStartX + deltaX);
      setPlayerY(playerStartY + deltaY);
    }
  }, [isDragging, dragStartX, dragStartY, playerStartX, playerStartY]); // Added new dependencies

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global event listeners for dragging
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Update player position on window resize to keep it somewhat in view
  useEffect(() => {
    const handleResize = () => {
      if (isPopOut) {
        setPlayerX(prevX => Math.min(prevX, window.innerWidth - (playerRef.current?.offsetWidth || 300)));
        setPlayerY(prevY => Math.min(prevY, window.innerHeight - (playerRef.current?.offsetHeight || 220))); // Use 220 for fixed height
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isPopOut]);


  // Handle progress bar click/drag
  const handleProgressClick = useCallback((e) => {
    if (!duration || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const newProgress = clickX / rect.width;
    const newTime = newProgress * duration;

    seekTo(newTime);
  }, [duration, seekTo]);

  // Loại bỏ hàm handleProgressDrag
  // const handleProgressDrag = useCallback((e) => {
  //   if (!isDragging || !duration || !progressBarRef.current) return;
  //   const rect = progressBarRef.current.getBoundingClientRect();
  //   const dragX = e.clientX - rect.left;
  //   const newProgress = Math.max(0, Math.min(1, dragX / rect.width));
  //   const newTime = newProgress * duration;
  //   seekTo(newTime);
  // }, [isDragging, duration, seekTo]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
  }, [setVolume]);

  // Play/pause/resume toggle
  // REMOVED_LOGIC: Old handlePlayPause function will be removed here.

  // Visualizer Component - Call the separately defined component
  {isPopOut && (
    <div className="mb-4 h-20 bg-black bg-opacity-30 rounded-lg p-2">
      <Visualizer frequencyData={frequencyData} />
    </div>
  )}

  // Error display
  if (error) {
    return (
      <div className="bg-red-600 text-white p-4 rounded-lg flex items-center justify-between">
        <span>Audio Error: {error}</span>
        <button
          onClick={clearError}
          className="bg-red-700 hover:bg-red-800 px-3 py-1 rounded"
        >
          Dismiss
        </button>
      </div>
    );
  }

  // Only render the player if there's a current song
  // if (!currentSong) {
  //   return null; 
  // }

  return (
    <div 
      ref={playerRef}
      className={`bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-lg shadow-2xl ${isPopOut ? 'absolute p-3 overflow-hidden' : 'fixed bottom-0 left-0 right-0'} ${className}`}
      style={isPopOut ? { top: playerY, left: playerX, width: '300px', height: '220px', zIndex: 1000 } : {}} // Fixed height when pop-out
    >
      {/* Main Player Content */}
      <div className={`${isPopOut ? 'flex flex-col h-full' : 'p-2'}`}> {/* Conditional class for flexbox layout in pop-out mode */}
        {/* Top Section - Song Info (draggable) */}
        <div className="flex items-center justify-between mb-3" onMouseDown={handleMouseDown} style={{ cursor: isPopOut ? 'grab' : 'default' }}>
          {currentSong ? (
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {/* Album Art */}
              <div className="flex-shrink-0">
                <img
                  src={currentSong.imageUrl || 'https://placehold.co/48/1a1a2e/ffffff?text=Music'}
                  alt={currentSong.title}
                  className="w-12 h-12 rounded-md object-cover shadow-lg"
                />
              </div>
              {/* Song Info */}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-md truncate">{currentSong.title}</h3>
                <p className="text-gray-300 text-xs truncate">{currentSong.artist?.name || currentSong.artist}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3 flex-1 min-w-0 opacity-70">
              <div className="flex-shrink-0">
                <FaMusic className="w-12 h-12 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-md text-gray-500">No Song Selected</h3>
                <p className="text-gray-400 text-xs">Start playing to see details</p>
              </div>
            </div>
          )}
          {/* Action Buttons */}
          <div className="flex items-center space-x-1">
            {currentSong && (
              <>
                <button className="text-gray-400 hover:text-pink-500 transition-colors p-1 text-sm">
                  <FaHeart />
                </button>
                <button className="text-gray-400 hover:text-blue-500 transition-colors p-1 text-sm">
                  <FaDownload />
                </button>
                <button className="text-gray-400 hover:text-green-500 transition-colors p-1 text-sm">
                  <FaShareAlt />
                </button>
              </>
            )}
            <button
              onClick={() => {
                const newPopOutState = !isPopOut;
                setIsPopOut(newPopOutState);
                if (newPopOutState && playerRef.current) {
                  // When popping out, snap playerX and playerY to current visual position
                  const rect = playerRef.current.getBoundingClientRect();
                  setPlayerX(rect.left);
                  setPlayerY(rect.top);
                } else if (!newPopOutState) {
                  // When going back to fixed, reset player to initial default position
                  setPlayerX(window.innerWidth - 320);
                  setPlayerY(window.innerHeight - 230);
                }
              }} // Toggle pop-out mode
              className="bg-secondary text-primary hover:bg-secondary/80 p-2 rounded-full text-md transition-colors shadow-lg" // Make button more visible
              title={isPopOut ? "Thu nhỏ trình phát" : "Mở trình phát nổi"} // Add tooltip
            >
              <FaAccessibleIcon /> {/* Use FaAccessibleIcon as requested */}
            </button>
          </div>
        </div>

        {/* Audio Visualizer and Progress Bar */}
        {isPopOut && (
          <div className="mb-3 h-16 bg-black bg-opacity-30 rounded-lg p-1">
            <Visualizer frequencyData={frequencyData} />
          </div>
        )}

        {/* Controls Section */}
        <div className="flex items-center justify-center mb-3">
          {/* Previous Button */}
          <button 
            onClick={playPrevious}
            disabled={!currentSong}
            className="p-1 mx-1 text-gray-400 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaStepBackward className="text-lg" />
          </button>
          
          {/* Shuffle Button */}
          <button
            onClick={toggleShuffle}
            className={`p-1 rounded-full ${isShuffle ? 'bg-secondary text-primary' : 'text-gray-400 hover:text-white'} transition-colors duration-300 mx-1`}
            disabled={!currentSong}
            title={isShuffle ? "Tắt chế độ trộn bài" : "Bật chế độ trộn bài"}
          >
            <FaRandom className="text-md" />
          </button>

          {/* Combined Play/Pause/Resume Button */}
          <button
            onClick={() => {
              if (isLoading) return;
              if (isPlaying) {
                pauseSong();
              } else if (isPaused) { // If not playing, but paused, then resume
                resumeSong();
              } else if (currentSong) { // If not playing, not paused, but there's a current song (stopped or initial state)
                playSong(currentSong);
              }
            }}
            className="bg-secondary hover:bg-secondary/80 text-primary p-3 rounded-full shadow-xl flex items-center justify-center transform hover:scale-110 transition-transform duration-300 mx-1"
            disabled={isLoading || (!currentSong && queue.length === 0)}
          >
            {isPlaying ? (
              <FaPause className="text-lg" />
            ) : (
              <FaPlay className="text-lg" />
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={stopSong}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full shadow-xl flex items-center justify-center transform hover:scale-105 transition-transform duration-300 mx-1"
            disabled={!currentSong && !isPaused && !isPlaying} // Enabled if current song exists, or if paused/playing
          >
            <FaStop className="text-md" />
          </button>

          {/* Repeat Button */}
          <button
            onClick={toggleRepeat}
            className={`p-1 rounded-full ${isRepeat ? 'bg-secondary text-primary' : 'text-gray-400 hover:text-white'} transition-colors duration-300 mx-1`}
            disabled={!currentSong}
            title={isRepeat ? "Tắt chế độ lặp lại" : "Bật chế độ lặp lại"}
          >
            <FaRedoAlt className="text-md" />
          </button>

          {/* Next Button */}
          <button 
            onClick={playNext}
            disabled={!currentSong}
            className="p-1 mx-1 text-gray-400 hover:text-white transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FaStepForward className="text-lg" />
          </button>
        </div>

        {/* Progress Bar and Times */}
        {currentSong && (
          <div className="flex items-center space-x-2 mb-3">
            <span className="text-gray-400 text-xs">{formatTime(currentTime)}</span>
            <div
              ref={progressBarRef}
              onClick={handleProgressClick}
              className="flex-1 h-1 bg-gray-700 rounded-full cursor-pointer overflow-hidden"
            >
              <div
                className="h-full bg-secondary rounded-full"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <span className="text-gray-400 text-xs">{formatTime(duration)}</span>
          </div>
        )}

        {/* Volume Control */}
        <div className="flex items-center justify-center space-x-1">
          <button 
            onClick={toggleMute}
            className="text-gray-400 hover:text-white transition-colors duration-300 p-1 text-xs"
          >
            {isMuted || volume === 0 ? <FaVolumeMute /> : <FaVolumeUp />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={isMuted ? 0 : volume}
            onChange={handleVolumeChange}
            className="w-20 h-1 bg-gray-700 rounded-full appearance-none cursor-pointer accent-secondary"
          />
        </div>
        {/* Additional Controls (Only Queue button remains here) */}
        <div className="flex items-center justify-center space-x-2 mt-3">
          <button
            onClick={() => setShowQueue(!showQueue)}
            className={`p-1 rounded-full ${showQueue ? 'bg-secondary text-primary' : 'text-gray-400 hover:text-white'} transition-colors duration-300`}
            title={showQueue ? "Ẩn danh sách phát" : "Hiện danh sách phát"}
          >
            <FaList className="text-md" />
          </button>
        </div>

        {/* Queue Display (Rendered inside for both modes, but only visible if showQueue) */}
        {((isPopOut && queue.length > 0) || (!isPopOut && showQueue && queue.length > 0)) && (
          <div className={`mt-3 p-3 bg-gray-800 rounded-b-lg border-t border-gray-700 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900 text-sm ${isPopOut ? 'flex-grow' : 'max-h-48'}`}> {/* Conditional flex-grow for pop-out, max-h-48 for fixed */} 
            <h4 className="font-bold mb-2">Next Up:</h4>
            {queue.map((song, index) => (
              <div key={song._id} className="flex items-center justify-between py-1 border-b border-gray-700 last:border-b-0">
                <div className="flex items-center space-x-2">
                  <span className="text-gray-400 text-xs">{index + 1}.</span>
                  <img src={song.imageUrl || 'https://placehold.co/24/1a1a2e/ffffff?text=M'} alt={song.title} className="w-6 h-6 rounded object-cover" />
                  <div>
                    <p className="font-medium text-white text-xs line-clamp-1">{song.title}</p>
                    <p className="text-gray-400 text-xs line-clamp-1">{song.artist?.name || song.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => removeFromQueue(index)}
                  className="text-gray-500 hover:text-red-500 transition-colors text-xs"
                >
                  <FaPlus className="rotate-45" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPlayer; 