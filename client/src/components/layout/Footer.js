import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaTwitter, FaInstagram, FaYoutube } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-primary text-white py-8 px-4 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
        <div className="col-span-2 md:col-span-1 mb-6 md:mb-0">
          <h3 className="text-xl mb-4 text-secondary">HTaf Music</h3>
          <p className="text-sm opacity-90 mb-4">Nền tảng nghe và mua nhạc hàng đầu với các bản nhạc chất lượng cao và độc quyền.</p>
          <div className="flex gap-4">
            <a href="#" className="text-white text-xl hover:text-secondary"><FaFacebook /></a>
            <a href="#" className="text-white text-xl hover:text-secondary"><FaTwitter /></a>
            <a href="#" className="text-white text-xl hover:text-secondary"><FaInstagram /></a>
            <a href="#" className="text-white text-xl hover:text-secondary"><FaYoutube /></a>
          </div>
        </div>
        
        <div className="col-span-1 mb-6 md:mb-0">
          <h3 className="text-xl mb-4 text-secondary">Khám Phá</h3>
          <ul>
            <li className="mb-2"><Link to="/music" className="text-white hover:text-secondary">Bài hát</Link></li>
            <li className="mb-2"><Link to="/rankings" className="text-white hover:text-secondary">Bảng xếp hạng</Link></li>
            <li className="mb-2"><Link to="/albums" className="text-white hover:text-secondary">Albums</Link></li>
            <li className="mb-2"><Link to="/artists" className="text-white hover:text-secondary">Nghệ sĩ</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1 mb-6 md:mb-0">
          <h3 className="text-xl mb-4 text-secondary">Tài Khoản</h3>
          <ul>
            <li className="mb-2"><Link to="/profile" className="text-white hover:text-secondary">Tài khoản của tôi</Link></li>
            <li className="mb-2"><Link to="/purchases" className="text-white hover:text-secondary">Lịch sử mua hàng</Link></li>
            <li className="mb-2"><Link to="/wishlist" className="text-white hover:text-secondary">Danh sách yêu thích</Link></li>
            <li className="mb-2"><Link to="/settings" className="text-white hover:text-secondary">Cài đặt</Link></li>
          </ul>
        </div>
        
        <div className="col-span-1">
          <h3 className="text-xl mb-4 text-secondary">Hỗ Trợ</h3>
          <ul>
            <li className="mb-2"><Link to="/help" className="text-white hover:text-secondary">Trung tâm trợ giúp</Link></li>
            <li className="mb-2"><Link to="/contact" className="text-white hover:text-secondary">Liên hệ chúng tôi</Link></li>
            <li className="mb-2"><Link to="/faq" className="text-white hover:text-secondary">Câu hỏi thường gặp</Link></li>
            <li className="mb-2"><Link to="/terms" className="text-white hover:text-secondary">Điều khoản sử dụng</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="text-center mt-8 pt-6 border-t border-gray-800">
        <p>&copy; {new Date().getFullYear()} HTaf Music. Tất cả các quyền được bảo lưu.</p>
      </div>
    </footer>
  );
};

export default Footer; 