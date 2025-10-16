import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaCalendarAlt, FaUser, FaTag, FaArrowLeft, FaFacebook, FaTwitter, FaLinkedin, FaCopy, FaCheck } from 'react-icons/fa';

const NewsDetail = () => {
  const { id } = useParams();
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [relatedNews, setRelatedNews] = useState([]);
  
  // Dữ liệu tin tức mẫu (thay thế bằng API call thực tế sau này)
  const newsData = [
    {
      id: 1,
      title: 'HTaf Music phát hành phiên bản 2.0 với trải nghiệm DJ hoàn toàn mới',
      excerpt: 'Phiên bản cập nhật lớn nhất từ trước đến nay của HTaf Music mang đến giao diện người dùng được thiết kế lại hoàn toàn và nhiều tính năng mới hấp dẫn.',
      content: `
        <p class="mb-4">HTaf Music vừa chính thức phát hành phiên bản 2.0, đánh dấu một bước ngoặt quan trọng trong hành trình phát triển của phần mềm trộn nhạc hàng đầu này. Với giao diện được thiết kế lại hoàn toàn và bổ sung nhiều tính năng mới, HTaf Music 2.0 hứa hẹn mang đến trải nghiệm trộn nhạc chưa từng có cho cả DJ chuyên nghiệp và người mới bắt đầu.</p>
        
        <h2 class="text-2xl font-bold mt-8 mb-4">Giao diện người dùng mới</h2>
        <p class="mb-4">Giao diện người dùng mới của HTaf Music 2.0 không chỉ đẹp mắt hơn mà còn được tối ưu hóa để tăng cường hiệu suất làm việc. Các yếu tố điều khiển được bố trí một cách khoa học và trực quan, giúp người dùng dễ dàng tiếp cận và sử dụng.</p>
        
        <div class="my-6 p-4 bg-dark-800 rounded-lg">
          <p class="italic">"Chúng tôi đã lắng nghe phản hồi từ cộng đồng người dùng và cải tiến từng chi tiết nhỏ nhất trong giao diện. Mục tiêu là tạo ra một không gian làm việc thoải mái và hiệu quả cho mọi DJ."</p>
          <p class="font-bold mt-2">- Giám đốc sản phẩm HTaf Music</p>
        </div>
        
        <h2 class="text-2xl font-bold mt-8 mb-4">Tính năng mới nổi bật</h2>
        
        <ul class="list-disc pl-6 space-y-2 mb-6">
          <li><strong>Beat Matching AI:</strong> Công nghệ AI mới giúp đồng bộ hóa nhịp giữa các bài hát một cách tự động và chính xác tuyệt đối.</li>
          <li><strong>Hiệu ứng thời gian thực:</strong> Thêm 50+ hiệu ứng mới có thể áp dụng và điều chỉnh trong thời gian thực.</li>
          <li><strong>Tích hợp Cloud:</strong> Đồng bộ hóa toàn bộ thư viện âm nhạc và cài đặt của bạn trên đám mây, truy cập từ bất kỳ thiết bị nào.</li>
          <li><strong>Phân tích sâu:</strong> Công cụ phân tích âm nhạc nâng cao giúp mở rộng khả năng sáng tạo trong việc trộn nhạc.</li>
          <li><strong>Tương thích phần cứng:</strong> Hỗ trợ thêm nhiều controller MIDI và bộ điều khiển phần cứng từ các nhà sản xuất hàng đầu.</li>
        </ul>
        
        <h2 class="text-2xl font-bold mt-8 mb-4">Hiệu suất được nâng cấp</h2>
        <p class="mb-4">HTaf Music 2.0 đã được tối ưu hóa để tận dụng tối đa sức mạnh phần cứng hiện đại, giảm thiểu độ trễ và tăng độ ổn định. Người dùng có thể xử lý các dự án phức tạp mà không lo lắng về vấn đề hiệu suất.</p>
        
        <p class="mb-4">Phiên bản mới cũng giảm đáng kể lượng tài nguyên hệ thống cần thiết, cho phép HTaf Music chạy mượt mà hơn trên các máy tính có cấu hình thấp hơn.</p>
        
        <h2 class="text-2xl font-bold mt-8 mb-4">Giá cả và cách nâng cấp</h2>
        <p class="mb-4">HTaf Music 2.0 hiện đã có sẵn cho tất cả người dùng. Những người dùng hiện tại của phiên bản 1.x có thể nâng cấp miễn phí thông qua cổng thông tin tài khoản của họ.</p>
        
        <p class="mb-4">Đối với người dùng mới, HTaf Music 2.0 có sẵn với giá khởi điểm $99 cho phiên bản tiêu chuẩn và $199 cho phiên bản chuyên nghiệp với đầy đủ tính năng.</p>
        
        <p class="font-bold mt-8">HTaf Music 2.0 đánh dấu một cột mốc quan trọng trong lĩnh vực phần mềm trộn nhạc. Với sự kết hợp giữa công nghệ tiên tiến và thiết kế lấy người dùng làm trung tâm, HTaf Music tiếp tục khẳng định vị thế là công cụ không thể thiếu cho mọi DJ.</p>
      `,
      image: 'https://via.placeholder.com/800x450',
      date: '15/05/2023',
      author: 'Admin HTaf',
      category: 'updates',
      tags: ['update', 'version 2.0', 'new features']
    },
    // ... thêm dữ liệu tin tức khác
  ];

  // Gọi API lấy dữ liệu tin tức (giả lập)
  useEffect(() => {
    const fetchNewsItem = async () => {
      setLoading(true);
      try {
        // Giả lập API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const foundNews = newsData.find(item => item.id === parseInt(id));
        if (foundNews) {
          setNewsItem(foundNews);
          
          // Tìm tin tức liên quan (cùng danh mục hoặc tags)
          const related = newsData
            .filter(item => 
              item.id !== parseInt(id) && 
              (item.category === foundNews.category || 
              item.tags.some(tag => foundNews.tags.includes(tag)))
            )
            .slice(0, 3);
          
          setRelatedNews(related);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewsItem();
  }, [id]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen bg-dark text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
      </div>
    );
  }
  
  if (!newsItem) {
    return (
      <div className="min-h-screen bg-dark text-white flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4">Không tìm thấy tin tức</h2>
        <Link to="/news" className="text-secondary hover:underline flex items-center gap-2">
          <FaArrowLeft /> Quay lại trang tin tức
        </Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-dark text-white">
      {/* Banner Header */}
      <div className="bg-primary py-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <Link to="/news" className="inline-flex items-center gap-2 text-gray-300 hover:text-secondary mb-6">
            <FaArrowLeft /> Quay lại tin tức
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{newsItem.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
            <span className="flex items-center gap-1">
              <FaCalendarAlt className="text-secondary" /> {newsItem.date}
            </span>
            <span className="flex items-center gap-1">
              <FaUser className="text-secondary" /> {newsItem.author}
            </span>
            <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded-full">
              {newsItem.category}
            </span>
          </div>
        </div>
      </div>
      
      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            <div className="mb-8 rounded-lg overflow-hidden">
              <img 
                src={newsItem.image} 
                alt={newsItem.title} 
                className="w-full h-auto"
              />
            </div>
            
            <div className="prose prose-lg prose-invert max-w-none mb-8" 
              dangerouslySetInnerHTML={{ __html: newsItem.content }} 
            />
            
            {/* Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {newsItem.tags.map(tag => (
                <span key={tag} className="bg-dark-800 px-3 py-1 rounded-full text-gray-300">
                  <FaTag className="inline mr-1 text-secondary" /> {tag}
                </span>
              ))}
            </div>
            
            {/* Social Share */}
            <div className="border-t border-b border-gray-800 py-4 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <span className="text-gray-400">Chia sẻ bài viết:</span>
                <div className="flex gap-3">
                  <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center hover:bg-opacity-90 transition-all">
                    <FaFacebook />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-sky-500 flex items-center justify-center hover:bg-opacity-90 transition-all">
                    <FaTwitter />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-blue-700 flex items-center justify-center hover:bg-opacity-90 transition-all">
                    <FaLinkedin />
                  </button>
                  <button 
                    className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-opacity-90 transition-all relative"
                    onClick={handleCopyLink}
                  >
                    {copied ? <FaCheck className="text-green-400" /> : <FaCopy />}
                    {copied && (
                      <span className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-dark-800 text-white text-xs px-2 py-1 rounded">
                        Đã sao chép!
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="lg:w-1/3">
            {/* Related News */}
            <div className="bg-primary rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Tin tức liên quan</h3>
              <div className="space-y-4">
                {relatedNews.length > 0 ? (
                  relatedNews.map(item => (
                    <Link to={`/news/${item.id}`} key={item.id} className="block group">
                      <div className="flex gap-3">
                        <img 
                          src={item.image} 
                          alt={item.title} 
                          className="w-20 h-20 object-cover rounded"
                        />
                        <div>
                          <h4 className="font-medium group-hover:text-secondary transition-colors">{item.title}</h4>
                          <p className="text-sm text-gray-400">{item.date}</p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-gray-400">Không có tin tức liên quan</p>
                )}
              </div>
            </div>
            
            {/* Popular Tags */}
            <div className="bg-primary rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 border-b border-gray-800 pb-2">Tags phổ biến</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">update</span>
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">tutorial</span>
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">dj</span>
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">htaf music</span>
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">tips</span>
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">mixing</span>
                <span className="bg-dark-800 px-3 py-1 rounded-full text-gray-300 hover:bg-secondary hover:text-primary transition-colors cursor-pointer">event</span>
              </div>
            </div>
            
            {/* Newsletter Signup */}
            <div className="bg-primary rounded-lg p-6">
              <h3 className="text-xl font-bold mb-4">Đăng ký nhận tin</h3>
              <p className="text-gray-300 mb-4">Cập nhật tin tức mới nhất từ HTaf Music</p>
              <form className="space-y-3">
                <input 
                  type="email" 
                  placeholder="Email của bạn" 
                  className="w-full px-4 py-2 rounded-md bg-dark border border-gray-700 focus:border-secondary focus:outline-none text-white"
                  required
                />
                <button 
                  type="submit"
                  className="w-full bg-secondary text-primary font-bold px-4 py-2 rounded-md hover:bg-opacity-90 transition-all btn-ripple"
                >
                  ĐĂNG KÝ
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail; 