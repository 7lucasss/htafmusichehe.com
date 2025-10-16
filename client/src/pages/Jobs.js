import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaMapMarkerAlt, FaBuilding, FaSearch, FaFilter, FaMoneyBillWave, 
  FaClock, FaHeart, FaComment, FaShare, FaEllipsisH } from 'react-icons/fa';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';
import PostJobForm from '../components/jobs/PostJobForm';

const Jobs = () => {
  const { currentUser } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [canPostJobs, setCanPostJobs] = useState(false);
  
  // Fetch jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await API.getJobs();
        setJobs(response.data);
        setFilteredJobs(response.data);
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchJobs();
    
    // Kiểm tra quyền đăng tin
    const checkPermission = async () => {
      if (currentUser) {
        try {
          const userResponse = await API.getCurrentUser();
          setCanPostJobs(userResponse.data.canPostJobs || userResponse.data.role === 'admin');
        } catch (error) {
          console.error('Error checking job permissions:', error);
        }
      }
    };
    
    checkPermission();
  }, [currentUser]);
  
  // Hàm tìm kiếm
  useEffect(() => {
    const filterJobs = () => {
      let results = [...jobs];
      
      // Lọc theo từ khóa tìm kiếm
      if (searchTerm) {
        results = results.filter(job => 
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // Lọc theo danh mục
      if (selectedCategory !== 'all') {
        results = results.filter(job => job.jobType === selectedCategory);
      }
      
      setFilteredJobs(results);
    };
    
    filterJobs();
  }, [jobs, searchTerm, selectedCategory]);
  
  // Xử lý nhấn Like
  const handleToggleLike = async (jobId) => {
    if (!currentUser) {
      alert('Vui lòng đăng nhập để thích tin tuyển dụng');
      return;
    }
    
    try {
      const response = await API.toggleLikeJob(jobId);
      
      setJobs(jobs.map(job => 
        job._id === jobId 
          ? { 
              ...job, 
              isLiked: response.data.isLiked,
              likes: response.data.isLiked 
                ? [...(job.likes || []), currentUser._id]
                : (job.likes || []).filter(id => id !== currentUser._id),
              likeCount: response.data.likeCount
            }
          : job
      ));
      
      setFilteredJobs(filteredJobs.map(job => 
        job._id === jobId 
          ? { 
              ...job, 
              isLiked: response.data.isLiked,
              likes: response.data.isLiked 
                ? [...(job.likes || []), currentUser._id]
                : (job.likes || []).filter(id => id !== currentUser._id),
              likeCount: response.data.likeCount
            }
          : job
      ));
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };
  
  // Xử lý khi đăng tin mới thành công
  const handlePostSuccess = (newJob) => {
    setJobs([newJob, ...jobs]);
    setFilteredJobs([newJob, ...filteredJobs]);
  };
  
  // Format salary
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Thỏa thuận';
    
    let result = '';
    
    if (salary.min && salary.max) {
      result = `${salary.min.toLocaleString()} - ${salary.max.toLocaleString()}`;
    } else if (salary.min) {
      result = `Từ ${salary.min.toLocaleString()}`;
    } else if (salary.max) {
      result = `Đến ${salary.max.toLocaleString()}`;
    }
    
    result += ` ${salary.currency}/${salary.period === 'month' ? 'tháng' : salary.period}`;
    return result;
  };
  
  // Format job type
  const formatJobType = (type) => {
    switch(type) {
      case 'full-time': return 'Toàn thời gian';
      case 'part-time': return 'Bán thời gian';
      case 'contract': return 'Hợp đồng';
      case 'freelance': return 'Tự do';
      default: return type;
    }
  };
  
  return (
    <div className="min-h-screen bg-dark">
      {/* Header section */}
      <div className="bg-gradient-to-r from-primary/30 to-secondary/30 py-8">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Cộng đồng Tuyển dụng DJ</h1>
            <p className="text-lg text-gray-300 mb-6">
              Kết nối DJ và nhà tổ chức sự kiện - Tìm cơ hội biểu diễn mới nhất
            </p>
            
            {/* Search box */}
            <div className="max-w-2xl mx-auto">
              <div className="relative flex">
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm công việc, công ty, địa điểm..."
                  className="w-full px-4 py-3 rounded-l-md bg-dark border border-gray-700 focus:border-secondary focus:outline-none text-white"
                />
                <button className="px-4 py-3 bg-secondary text-primary rounded-r-md">
                  <FaSearch />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <div className="md:w-1/4">
              <div className="bg-gray-800 rounded-lg shadow-md p-4 sticky top-20">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FaFilter className="mr-2 text-secondary" /> Bộ lọc
                </h2>
                
                {/* Filter by category */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Loại công việc</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => setSelectedCategory('all')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'all' ? 'bg-secondary text-primary' : 'bg-gray-700'
                      }`}
                    >
                      Tất cả
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('full-time')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'full-time' ? 'bg-secondary text-primary' : 'bg-gray-700'
                      }`}
                    >
                      Toàn thời gian
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('part-time')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'part-time' ? 'bg-secondary text-primary' : 'bg-gray-700'
                      }`}
                    >
                      Bán thời gian
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('contract')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'contract' ? 'bg-secondary text-primary' : 'bg-gray-700'
                      }`}
                    >
                      Hợp đồng
                    </button>
                    <button 
                      onClick={() => setSelectedCategory('freelance')}
                      className={`w-full text-left px-4 py-2 rounded-md ${
                        selectedCategory === 'freelance' ? 'bg-secondary text-primary' : 'bg-gray-700'
                      }`}
                    >
                      Freelance
                    </button>
                  </div>
                </div>
                
                {/* Filter by location */}
                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Địa điểm hot</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      Hà Nội
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      TP. Hồ Chí Minh
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      Đà Nẵng
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      Nha Trang
                    </button>
                  </div>
                </div>
                
                {/* Filter by experience */}
                <div>
                  <h3 className="font-semibold mb-2">Thể loại nhạc</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      EDM
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      Hip Hop
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      House
                    </button>
                    <button className="w-full text-left px-4 py-2 rounded-md bg-gray-700">
                      Techno
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Main job list */}
            <div className="md:w-3/4">
              {/* Quick post form for logged in users */}
              {currentUser && canPostJobs && (
                <PostJobForm onPostSuccess={handlePostSuccess} />
              )}
              
              {/* Job listings */}
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary"></div>
                </div>
              ) : filteredJobs.length === 0 ? (
                <div className="bg-gray-800 rounded-lg shadow-md p-8 text-center">
                  <div className="text-6xl mb-4">🎧</div>
                  <h3 className="text-xl font-bold mb-2">Không tìm thấy tin tuyển dụng</h3>
                  <p className="text-gray-400">
                    Chưa có tin tuyển dụng nào phù hợp với tìm kiếm của bạn
                  </p>
                  {currentUser && canPostJobs && (
                    <button className="mt-4 px-6 py-2 bg-secondary text-primary rounded-md font-medium">
                      Đăng tin tuyển dụng mới
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredJobs.map(job => (
                    <div key={job._id} className="bg-gray-800 rounded-lg shadow-md overflow-hidden">
                      <div className="p-6">
                        {/* Post header with company info */}
                        <div className="flex justify-between items-center mb-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center text-primary font-bold mr-3">
                              {job.company.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold">{job.company}</h4>
                              <div className="text-sm text-gray-400 flex items-center">
                                <FaCalendarAlt className="mr-1" /> 
                                {new Date(job.createdAt).toLocaleDateString('vi-VN')}
                              </div>
                            </div>
                          </div>
                          <button className="text-gray-400 hover:text-white">
                            <FaEllipsisH />
                          </button>
                        </div>
                        
                        {/* Job title and description */}
                        <Link to={`/jobs/${job._id}`}>
                          <h3 className="text-xl font-bold mb-3 hover:text-secondary transition-colors">
                            {job.title}
                          </h3>
                        </Link>
                        
                        <div className="mb-4">
                          <p className="text-gray-300 line-clamp-3">{job.description}</p>
                        </div>
                        
                        {/* Job meta info */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center text-gray-400 text-sm bg-gray-800 border border-gray-700 rounded-full px-3 py-1">
                            <FaMapMarkerAlt className="mr-1" />
                            {job.location}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm bg-gray-800 border border-gray-700 rounded-full px-3 py-1">
                            <FaClock className="mr-1" />
                            {formatJobType(job.jobType)}
                          </div>
                          <div className="flex items-center text-gray-400 text-sm bg-gray-800 border border-gray-700 rounded-full px-3 py-1">
                            <FaMoneyBillWave className="mr-1" />
                            {formatSalary(job.salary)}
                          </div>
                        </div>
                        
                        {/* Job images grid */}
                        {job.images && job.images.length > 0 && (
                          <div className={`grid ${
                            job.images.length === 1 ? 'grid-cols-1' : 
                            job.images.length === 2 ? 'grid-cols-2' : 
                            job.images.length === 3 ? 'grid-cols-2' : 
                            'grid-cols-2'
                          } gap-2 mb-4`}>
                            {job.images.map((image, index) => (
                              <div 
                                key={index} 
                                className={`rounded-lg overflow-hidden ${
                                  job.images.length === 3 && index === 0 ? 'col-span-2' : ''
                                }`}
                              >
                                <img 
                                  src={image} 
                                  alt={job.title} 
                                  className="w-full h-48 object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        )}
                        
                        {/* Job actions */}
                        <div className="flex justify-between border-t border-gray-700 pt-4 mt-4">
                          <button 
                            className={`flex items-center ${job.isLiked ? 'text-red-500' : 'text-gray-400'} hover:text-red-500`}
                            onClick={() => handleToggleLike(job._id)}
                          >
                            <FaHeart className="mr-2" />
                            {job.likeCount || 0}
                          </button>
                          <Link to={`/jobs/${job._id}`} className="flex items-center text-gray-400 hover:text-white">
                            <FaComment className="mr-2" />
                            {job.commentCount || 0}
                          </Link>
                          <button className="flex items-center text-gray-400 hover:text-white">
                            <FaShare className="mr-2" />
                            Chia sẻ
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Load more button */}
              {filteredJobs.length > 0 && (
                <div className="mt-8 text-center">
                  <button className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-3 px-6 rounded-lg border border-gray-700">
                    Tải thêm tin tuyển dụng
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Newsletter subscription */}
      <div className="bg-gradient-to-r from-primary to-secondary/20 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Nhận thông báo về tin tuyển dụng mới</h2>
            <p className="text-gray-300 mb-6">
              Đăng ký nhận tin tức tuyển dụng mới nhất và phù hợp với kỹ năng của bạn
            </p>
            <form className="flex flex-col sm:flex-row gap-2">
              <input 
                type="email" 
                placeholder="Email của bạn" 
                className="flex-grow px-4 py-3 rounded-md bg-dark border border-gray-700 focus:border-secondary focus:outline-none text-white"
                required
              />
              <button 
                type="submit"
                className="bg-secondary text-primary font-bold px-6 py-3 rounded-md hover:bg-opacity-90 transition-all"
              >
                ĐĂNG KÝ
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Jobs; 