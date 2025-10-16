import React from 'react';
import { Link } from 'react-router-dom';
import { FaMicrophoneAlt, FaCompactDisc } from 'react-icons/fa';

const RoleSelection = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white flex flex-col items-center justify-center p-6 sm:p-8 lg:p-12">
      <div className="container mx-auto text-center flex-grow flex flex-col justify-center max-w-7xl">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold mb-10 sm:mb-12 animate-fade-in-down drop-shadow-lg">
          Bạn là ai? <span className="text-secondary">Producer</span> hay <span className="text-secondary">DJ</span>?
        </h1>

        <div className="flex flex-col md:flex-row justify-center items-stretch gap-8 sm:gap-12">
          {/* Producer Card */}
          <div className="bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl flex-1 max-w-lg transform transition-all duration-500 hover:scale-[1.03] hover:shadow-primary-glow relative overflow-hidden group flex flex-col justify-between items-center text-center border border-gray-700 hover:border-primary-light min-h-[550px]">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-red-900 opacity-10 transition-opacity duration-500 group-hover:opacity-30"></div>
            <div className="relative z-10 flex flex-col items-center">
              <FaMicrophoneAlt className="text-7xl sm:text-8xl text-secondary mx-auto mb-6 sm:mb-8 transition-transform duration-500 group-hover:rotate-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">Producer</h2>
              <p className="text-base sm:text-lg mb-8 sm:mb-10 text-gray-300">
                Bạn tạo ra những nhịp điệu mới, hòa âm độc đáo và sản xuất những bản nhạc để đời.
                Hãy chia sẻ tài năng của bạn với thế giới!
              </p>
              <Link 
                to="/register" 
                className="bg-secondary text-primary px-8 py-4 rounded-full text-xl font-bold hover:bg-primary hover:text-secondary transition-all duration-300 transform hover:scale-105 inline-block w-auto mt-auto shadow-lg hover:shadow-xl-secondary"
              >
                Đăng ký làm Producer
              </Link>
            </div>
          </div>

          {/* DJ Card */}
          <div className="bg-gray-800 p-8 sm:p-10 rounded-3xl shadow-2xl flex-1 max-w-lg transform transition-all duration-500 hover:scale-[1.03] hover:shadow-secondary-glow relative overflow-hidden group flex flex-col justify-between items-center text-center border border-gray-700 hover:border-secondary-light min-h-[550px]">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900 to-green-900 opacity-10 transition-opacity duration-500 group-hover:opacity-30"></div>
            <div className="relative z-10 flex flex-col items-center">
              <FaCompactDisc className="text-7xl sm:text-8xl text-secondary mx-auto mb-6 sm:mb-8 transition-transform duration-500 group-hover:-rotate-6" />
              <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">DJ</h2>
              <p className="text-base sm:text-lg mb-8 sm:mb-10 text-gray-300">
                Bạn là người pha trộn âm nhạc, khuấy động không khí và tạo ra những trải nghiệm đáng nhớ trên sàn nhảy.
                Hãy kết nối với người hâm mộ!
              </p>
              <Link 
                to="/register" 
                className="bg-secondary text-primary px-8 py-4 rounded-full text-xl font-bold hover:bg-primary hover:text-secondary transition-all duration-300 transform hover:scale-105 inline-block w-auto mt-auto shadow-lg hover:shadow-xl-secondary"
              >
                Đăng ký làm DJ
              </Link>
            </div>
          </div>
        </div>
        
        {/* Skip/Continue as Guest Button */}
        <div className="mt-8 text-center">
          <Link 
            to="/home" 
            className="text-gray-500 hover:text-secondary-light transition-colors duration-300 inline-flex items-center group relative overflow-hidden px-6 py-3 rounded-full border border-gray-700 hover:border-secondary-light transform hover:-translate-y-1 shadow-lg hover:shadow-xl-secondary-alt"
          >
            <span className="absolute inset-0 bg-secondary opacity-0 transition-opacity duration-300 group-hover:opacity-10"></span>
            <span className="relative z-10 mr-2 group-hover:animate-pulse">🚀</span> 
            <span className="relative z-10 font-medium text-base sm:text-lg">Tiết kiệm thời gian, tiếp tục với tư cách khách</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection; 