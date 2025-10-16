import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaPause, FaHeart, FaDownload, FaHeadphones } from 'react-icons/fa';

const SongCard = ({
  song,
  handlePlaySong,
  isSongPlaying,
  formatDuration,
}) => {
  return (
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
            <div className="flex items-center text-gray-400 text-xs">
              <FaHeadphones className="mr-1" /> {song.playCount}
            </div>
            <div className="flex items-center text-gray-400 text-xs">
              <FaHeart className="mr-1" /> {song.likesCount || song.likes?.length || 0}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard; 