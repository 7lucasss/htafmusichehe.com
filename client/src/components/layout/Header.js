import React, { useState, useContext, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaMusic, FaShoppingCart, FaUser, FaBars, FaTimes, FaSignOutAlt, FaUserCircle, FaHeart, FaHistory, FaSignInAlt, FaUserPlus, FaSearch } from 'react-icons/fa';
import { AuthContext } from '../../context/AuthContext';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const searchRef = useRef(null);
  const { currentUser, logout, isAdmin } = useContext(AuthContext);
  const navigate = useNavigate();
  // Giả định có chức năng giỏ hàng
  const cartCount = 0; // Đây sẽ được thay thế bằng trạng thái giỏ hàng thực tế

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    if (showUserMenu) setShowUserMenu(false);
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate('/');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/music?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
      setIsOpen(false);
    }
  };

  // Click bên ngoài sẽ đóng search suggestion
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-primary text-white py-3 px-4 shadow-lg sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/home" className="text-xl font-bold text-white no-underline flex items-center gap-2">
          <FaMusic className="text-secondary" /> HTaf Music
        </Link>
        
        {/* Thanh tìm kiếm */}
        <div 
          ref={searchRef}
          className={`hidden md:flex items-center relative flex-grow mx-6 max-w-xl transition-all duration-300 ${
            isSearchFocused ? 'scale-105' : ''
          }`}
        >
          <form onSubmit={handleSearch} className="w-full relative">
            <input
              type="text"
              placeholder="Tìm kiếm bài hát, nghệ sĩ, album..."
              className="w-full py-2 px-4 pr-10 rounded-full bg-dark border border-gray-700 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary text-white search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
            />
            <button 
              type="submit"
              className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-secondary transition-colors"
            >
              <FaSearch />
            </button>
          </form>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Nút giỏ hàng cải tiến với hiệu ứng mới */}
          <Link 
            to="/cart" 
            className="cart-button btn-ripple btn-scale"
            onClick={() => setIsOpen(false)}
          >
            <FaShoppingCart className="text-secondary text-lg cart-icon" />
            {cartCount > 0 && (
              <span className="cart-count">{cartCount}</span>
            )}
          </Link>
          
          {/* Mobile menu button */}
          <button 
            className="md:hidden text-white focus:outline-none"
            onClick={toggleMenu}
          >
            {isOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
          </button>
        </div>
        
        {/* Navigation - desktop & mobile */}
        <nav className={`absolute md:relative top-full left-0 w-full md:w-auto md:flex md:items-center bg-primary md:bg-transparent transition-all duration-300 ease-in-out 
                        ${isOpen ? 'block shadow-lg' : 'hidden'} md:block z-40`}>
          <ul className="flex flex-col md:flex-row gap-1 md:gap-6 p-4 md:p-0 list-none">
            {/* Mobile search form */}
            <li className="md:hidden mb-4">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Tìm kiếm..."
                  className="w-full py-2 px-4 pr-10 rounded-full bg-dark border border-gray-700 focus:border-secondary focus:outline-none focus:ring-1 focus:ring-secondary text-white search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button 
                  type="submit"
                  className="absolute right-0 top-0 h-full px-3 flex items-center justify-center text-gray-400 hover:text-secondary transition-colors"
                >
                  <FaSearch />
                </button>
              </form>
            </li>
            
            {/* Hiển thị giỏ hàng trên mobile */}
            <li className="md:hidden">
              <Link 
                to="/cart" 
                className="block py-2 px-4 rounded-md hover:bg-dark hover:text-secondary transition-colors flex items-center gap-2"
                onClick={() => setIsOpen(false)}
              >
                <FaShoppingCart /> Giỏ hàng
                {cartCount > 0 && (
                  <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">{cartCount}</span>
                )}
              </Link>
            </li>
            
            {/* User section */}
            {currentUser ? (
              <li className="relative mt-4 md:mt-0">
                <button 
                  className="flex items-center gap-2 bg-dark md:bg-dark px-4 py-2 rounded-md hover:bg-opacity-80 transition-colors w-full md:w-auto"
                  onClick={toggleUserMenu}
                >
                  {/* Display user avatar or FaUserCircle icon */}
                  <div className="w-6 h-6 rounded-full overflow-hidden border border-gray-600 flex items-center justify-center">
                    {currentUser.avatar ? (
                      <img 
                        src={`${currentUser.avatar}?t=${new Date().getTime()}`} 
                        alt={currentUser.name?.split(' ')[0] || 'User'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FaUserCircle className="text-secondary text-2xl" />
                    )}
                  </div>
                  <span>{currentUser.name?.split(' ')[0] || 'Tài khoản'}</span>
                </button>
                
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 bg-dark border border-gray-700 rounded-md shadow-lg w-48 py-1 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="font-bold text-sm">{currentUser.name}</p>
                      <p className="text-xs text-gray-400">{currentUser.email}</p>
                    </div>
                    <Link 
                      to="/profile" 
                      className="block px-4 py-2 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser className="text-secondary" /> Tài khoản
                    </Link>
                    <Link 
                      to="/profile/favorites" 
                      className="block px-4 py-2 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaHeart className="text-secondary" /> Yêu thích
                    </Link>
                    <Link 
                      to="/profile/purchases" 
                      className="block px-4 py-2 text-sm hover:bg-primary hover:text-white flex items-center gap-2"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaHistory className="text-secondary" /> Lịch sử mua
                    </Link>
                    <div className="border-t border-gray-700 mt-1 pt-1">
                      <button 
                        className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-primary flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <FaSignOutAlt /> Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ) : (
              <li className="flex gap-2 mt-4 md:mt-0 ml-0 md:ml-4">
                <Link
                  to="/login"
                  className="bg-secondary text-primary px-4 py-2 rounded-md font-medium hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 w-full md:w-auto btn-ripple btn-glow btn-scale"
                  onClick={() => setIsOpen(false)}
                >
                  <FaSignInAlt /> Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className="bg-transparent border border-secondary text-secondary px-4 py-2 rounded-md font-medium hover:bg-secondary hover:text-primary hover:bg-opacity-20 transition-all flex items-center justify-center gap-2 w-full md:w-auto btn-border-shift btn-float"
                  onClick={() => setIsOpen(false)}
                >
                  <FaUserPlus /> Đăng ký
                </Link>
              </li>
            )}
            
            {/* Thêm link Nhạc vào trong phần navigation */}
            <li>
              <Link 
                to="/music" 
                className="block py-2 px-4 rounded-md hover:bg-dark hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <div className="flex items-center gap-2">
                  <FaMusic className="text-secondary" />
                  Nhạc
                </div>
              </Link>
            </li>
            
            {/* Thêm link Tin tức vào trong phần navigation */}
            <li>
              <Link 
                to="/news" 
                className="block py-2 px-4 rounded-md hover:bg-dark hover:text-secondary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Tin tức
              </Link>
            </li>
            
            {/* Thêm nút Admin Dashboard nếu người dùng là admin */}
            {currentUser && isAdmin() && (
              <li>
                <Link 
                  to="/admin" 
                  className="ml-2 bg-secondary text-white px-4 py-2 rounded-md hover:bg-secondary-dark transition-colors"
                >
                  Admin Dashboard
                </Link>
              </li>
            )}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header; 