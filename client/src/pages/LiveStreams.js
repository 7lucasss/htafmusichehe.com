import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaPlay, FaUsers, FaCalendarAlt } from 'react-icons/fa';
import API from '../services/api';

const LiveStreams = () => {
  const [liveStreams, setLiveStreams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const response = await API.getLiveStreams();
        setLiveStreams(response.data);
      } catch (error) {
        console.error('Error fetching live streams:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchLiveStreams();
    
    // Polling để cập nhật danh sách stream
    const interval = setInterval(fetchLiveStreams, 30000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Streams Trực Tiếp</h1>
      
      {loading ? (
        <div className="flex justify-center">
          <p>Đang tải streams...</p>
        </div>
      ) : liveStreams.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-xl text-gray-400">
            Không có stream trực tiếp nào đang diễn ra.
          </p>
          <p className="mt-4">
            <Link to="/streams/upcoming" className="text-secondary hover:underline">
              Xem các stream sắp tới
            </Link>
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {liveStreams.map(stream => (
            <Link 
              key={stream._id} 
              to={`/streams/${stream._id}`}
              className="bg-dark rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
            >
              <div className="relative">
                <img 
                  src={stream.thumbnailUrl || 'https://via.placeholder.com/640x360?text=Live+Stream'} 
                  alt={stream.title}
                  className="w-full h-48 object-cover"
                />
                <div className="absolute top-2 right-2 bg-red-600 text-white px-2 py-1 rounded text-sm font-bold">
                  LIVE
                </div>
                <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                  <FaUsers className="inline mr-1" /> {stream.viewCount}
                </div>
              </div>
              
              <div className="p-4">
                <h3 className="text-xl font-bold mb-2 truncate">{stream.title}</h3>
                <p className="text-gray-400 mb-2 truncate">{stream.streamer.name}</p>
                <p className="text-gray-500 text-sm">{stream.category}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default LiveStreams; 