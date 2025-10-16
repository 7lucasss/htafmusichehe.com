import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTag, FaArrowRight, FaSearch } from 'react-icons/fa';

const News = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNews, setFilteredNews] = useState([]);
  
  // Dữ liệu tin tức mẫu
  const newsData = [
    {
      id: 1,
      title: 'HTaf Music phát hành phiên bản 2.0 với trải nghiệm DJ hoàn toàn mới',
      excerpt: 'Phiên bản cập nhật lớn nhất từ trước đến nay của HTaf Music mang đến giao diện người dùng được thiết kế lại hoàn toàn và nhiều tính năng mới hấp dẫn.',
      image: 'https://via.placeholder.com/600x400',
      date: '15/05/2023',
      author: 'Admin HTaf',
      category: 'updates',
      tags: ['update', 'version 2.0', 'new features']
    },
    {
      id: 2,
      title: 'David Guetta chia sẻ về trải nghiệm với HTaf Music trong tour mới nhất',
      excerpt: 'DJ hàng đầu thế giới David Guetta đã chia sẻ cách HTaf Music đã trở thành công cụ không thể thiếu trong các buổi biểu diễn của anh.',
      image: 'https://via.placeholder.com/600x400',
      date: '02/06/2023',
      author: 'Team HTaf',
      category: 'artists',
      tags: ['david guetta', 'testimonial', 'dj']
    },
    {
      id: 3,
      title: 'Hướng dẫn: 10 mẹo trộn nhạc chuyên nghiệp với HTaf Music',
      excerpt: 'Khám phá các kỹ thuật cao cấp và mẹo hữu ích để nâng cao kỹ năng trộn nhạc của bạn với HTaf Music.',
      image: 'https://via.placeholder.com/600x400',
      date: '20/06/2023',
      author: 'DJ Mag',
      category: 'tutorials',
      tags: ['tips', 'mixing', 'tutorial']
    },
    {
      id: 4,
      title: 'HTaf Music đạt mốc 100 triệu lượt tải xuống toàn cầu',
      excerpt: 'Một cột mốc quan trọng đánh dấu sự thành công và phổ biến của HTaf Music trong cộng đồng DJ và nhà sản xuất âm nhạc.',
      image: 'https://via.placeholder.com/600x400',
      date: '05/07/2023',
      author: 'Admin HTaf',
      category: 'milestones',
      tags: ['milestone', 'downloads', 'success']
    },
    {
      id: 5,
      title: 'Công bố: HTaf Music Festival 2023 - Sự kiện âm nhạc điện tử lớn nhất năm',
      excerpt: 'HTaf Music tự hào giới thiệu festival âm nhạc đầu tiên với sự góp mặt của những DJ hàng đầu thế giới.',
      image: 'https://via.placeholder.com/600x400',
      date: '10/07/2023',
      author: 'Team HTaf',
      category: 'events',
      tags: ['festival', 'event', 'dj lineup']
    },
    {
      id: 6,
      title: 'Cách HTaf Music đang thay đổi ngành công nghiệp âm nhạc',
      excerpt: 'Phân tích chuyên sâu về tác động của HTaf Music đối với cách các DJ và nhà sản xuất tạo ra và trình diễn âm nhạc.',
      image: 'https://via.placeholder.com/600x400',
      date: '25/07/2023',
      author: 'DJ Mag',
      category: 'industry',
      tags: ['industry', 'impact', 'technology']
    }
  ];

  const categories = [
    { id: 'all', name: 'Tất cả' },
    { id: 'updates', name: 'Cập nhật' },
    { id: 'artists', name: 'Nghệ sĩ' },
    { id: 'tutorials', name: 'Hướng dẫn' },
    { id: 'events', name: 'Sự kiện' },
    { id: 'industry', name: 'Ngành nhạc' },
    { id: 'milestones', name: 'Cột mốc' }
  ];
  
  // Lọc tin tức dựa trên danh mục và tìm kiếm
  useEffect(() => {
    let results = newsData;
    
    if (activeCategory !== 'all') {
      results = results.filter(item => item.category === activeCategory);
    }
    
    if (searchTerm) {
      const lowercasedTerm = searchTerm.toLowerCase();
      results = results.filter(item => 
        item.title.toLowerCase().includes(lowercasedTerm) ||
        item.excerpt.toLowerCase().includes(lowercasedTerm) ||
        item.tags.some(tag => tag.toLowerCase().includes(lowercasedTerm))
      );
    }
    
    setFilteredNews(results);
  }, [activeCategory, searchTerm]);
  
  const handleSearch = (e) => {
    e.preventDefault();
    // Search functionality is handled by the useEffect
  };
  
  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Banner Header */}
      <div className="bg-primary py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">TIN TỨC & CẬP NHẬT</h1>
          <p className="text-xl text-gray-300 max-w-3xl">Khám phá những tin tức mới nhất, câu chuyện hấp dẫn và cập nhật từ thế giới HTaf Music</p>
        </div>
      </div>
      
      {/* Search & Filter Section */}
      <div className="bg-dark-800 border-b border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="w-full md:w-auto relative">
              <input
                type="text"
                placeholder="Tìm kiếm tin tức..."
                className="w-full md:w-80 py-2 px-4 pr-10 rounded-full bg-dark border border-gray-700 focus:border-secondary focus:outline-none text-white search-input"
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
            
            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-2 w-full md:w-auto">
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    activeCategory === category.id 
                      ? 'bg-secondary text-primary' 
                      : 'bg-dark-700 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* News Articles Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredNews.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-xl text-gray-400">Không tìm thấy tin tức phù hợp</h3>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredNews.map(newsItem => (
              <div key={newsItem.id} className="bg-primary rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 group">
                <div className="overflow-hidden h-48 relative">
                  <img 
                    src={newsItem.image} 
                    alt={newsItem.title} 
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-0 right-0 bg-secondary text-primary text-xs font-bold px-2 py-1 m-2 rounded">
                    {categories.find(c => c.id === newsItem.category)?.name || newsItem.category}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center text-sm text-gray-400 gap-4 mb-3">
                    <span className="flex items-center gap-1"><FaCalendarAlt className="text-secondary" /> {newsItem.date}</span>
                    <span className="flex items-center gap-1"><FaUser className="text-secondary" /> {newsItem.author}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-3 group-hover:text-secondary transition-colors">{newsItem.title}</h3>
                  <p className="text-gray-300 mb-5">{newsItem.excerpt}</p>
                  <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                      {newsItem.tags.slice(0, 2).map(tag => (
                        <span key={tag} className="text-xs bg-dark px-2 py-1 rounded-full text-gray-400">
                          <FaTag className="inline mr-1 text-secondary" size={10} /> {tag}
                        </span>
                      ))}
                    </div>
                    <Link 
                      to={`/news/${newsItem.id}`} 
                      className="text-secondary font-medium flex items-center gap-1 group-hover:gap-2 transition-all"
                    >
                      Xem thêm <FaArrowRight className="transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Newsletter Subscription */}
      <div className="bg-primary py-12 my-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">ĐĂNG KÝ NHẬN TIN TỨC</h2>
          <p className="text-gray-300 max-w-2xl mx-auto mb-8">Cập nhật tin tức mới nhất, hướng dẫn và khuyến mãi độc quyền từ HTaf Music</p>
          
          <form className="flex flex-col md:flex-row gap-3 max-w-lg mx-auto">
            <input 
              type="email" 
              placeholder="Email của bạn" 
              className="flex-grow px-4 py-3 rounded-md bg-dark border border-gray-700 focus:border-secondary focus:outline-none text-white"
              required
            />
            <button 
              type="submit"
              className="bg-secondary text-primary font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all btn-ripple btn-scale"
            >
              ĐĂNG KÝ
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default News; 