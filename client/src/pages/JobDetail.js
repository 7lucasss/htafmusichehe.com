import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaMoneyBillWave, FaClock, FaEnvelope, FaLink, FaStar, FaBriefcase, FaGlobe, FaShareAlt, FaCopy, FaCheck, FaUser, FaMusic, FaHeadphones, FaTimes, FaCheckCircle, FaUpload } from 'react-icons/fa';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isApplicationFormOpen, setIsApplicationFormOpen] = useState(false);
  const [applicationForm, setApplicationForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    message: '',
    resume: null
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  
  useEffect(() => {
    const fetchJob = async () => {
      try {
        const response = await API.getJobById(id);
        setJob(response.data);
      } catch (error) {
        console.error('Error fetching job details:', error);
        setError(error.response?.data?.message || 'Không thể tải thông tin tuyển dụng');
      } finally {
        setLoading(false);
      }
    };
    
    fetchJob();
  }, [id]);
  
  // Format salary range
  const formatSalary = (salary) => {
    if (!salary || (!salary.min && !salary.max)) return 'Thỏa thuận';
    
    const formatNumber = (num) => {
      if (num >= 1000000) {
        return (num / 1000000).toFixed(0) + ' triệu';
      }
      return num.toLocaleString('vi-VN');
    };
    
    let result = '';
    if (salary.min && salary.max) {
      result = `${formatNumber(salary.min)} - ${formatNumber(salary.max)}`;
    } else if (salary.min) {
      result = `Từ ${formatNumber(salary.min)}`;
    } else if (salary.max) {
      result = `Đến ${formatNumber(salary.max)}`;
    }
    
    result += ` ${salary.currency}/`;
    
    switch(salary.period) {
      case 'hour': result += 'giờ'; break;
      case 'day': result += 'ngày'; break;
      case 'week': result += 'tuần'; break;
      case 'month': result += 'tháng'; break;
      case 'year': result += 'năm'; break;
      case 'gig': result += 'buổi diễn'; break;
      default: result += salary.period;
    }
    
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
  
  // Copy job URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Handle application form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setApplicationForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Handle resume file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setApplicationForm({
        ...applicationForm,
        resume: file
      });
    }
  };
  
  // Submit application
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      // Mô phỏng gửi đơn ứng tuyển - thay thế bằng API thực khi có
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Hiển thị thông báo thành công
      setSubmitSuccess(true);
      
      // Reset form
      setApplicationForm({
        name: '',
        email: '',
        phone: '',
        message: '',
        resume: null
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      setError('Có lỗi xảy ra khi gửi đơn ứng tuyển. Vui lòng thử lại.');
    } finally {
      setSubmitLoading(false);
    }
  };
  
  // Get user type label
  const getUserTypeLabel = (userType) => {
    const labels = {
      'dj': 'DJ',
      'producer': 'Producer',
      'recruiter': 'Nhà tuyển dụng',
      'user': 'Người dùng'
    };
    return labels[userType] || 'Người dùng';
  };
  
  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmittingComment(true);
    
    try {
      const response = await API.addComment(id, { text: commentText });
      setJob(prevJob => ({
        ...prevJob,
        comments: [response.data, ...prevJob.comments]
      }));
      setCommentText('');
    } catch (error) {
      console.error('Error adding comment:', error);
      setError('Có lỗi xảy ra khi thêm bình luận. Vui lòng thử lại.');
    } finally {
      setIsSubmittingComment(false);
    }
  };
  
  // Thêm hàm này vào component
  const getUserTypeBadgeClass = (userType) => {
    switch(userType) {
      case 'dj':
        return 'bg-blue-500 bg-opacity-20 text-blue-400';
      case 'producer':
        return 'bg-purple-500 bg-opacity-20 text-purple-400';
      case 'recruiter':
        return 'bg-secondary bg-opacity-20 text-secondary';
      default:
        return 'bg-gray-500 bg-opacity-20 text-gray-400';
    }
  };
  
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto"></div>
          <p className="mt-3 text-gray-300">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="bg-red-900 bg-opacity-30 border border-red-500 text-red-300 p-4 rounded-md">
          <p className="font-bold">Lỗi:</p>
          <p>{error}</p>
        </div>
        <button 
          onClick={() => navigate('/jobs')}
          className="mt-4 flex items-center text-secondary hover:underline"
        >
          <FaArrowLeft className="mr-2" /> Quay lại danh sách việc làm
        </button>
      </div>
    );
  }
  
  if (!job) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <p className="text-gray-300">Không tìm thấy thông tin tuyển dụng.</p>
          <Link 
            to="/jobs"
            className="mt-4 inline-block text-secondary hover:underline"
          >
            <FaArrowLeft className="inline mr-2" /> Quay lại danh sách việc làm
          </Link>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-dark text-white min-h-screen pb-12">
      {/* Header */}
      <div className="bg-primary py-8">
        <div className="container mx-auto px-4">
          <Link 
            to="/jobs"
            className="flex items-center text-secondary hover:underline mb-4"
          >
            <FaArrowLeft className="mr-2" /> Quay lại danh sách việc làm
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="rounded-lg overflow-hidden w-24 h-24 flex-shrink-0 bg-dark p-3">
              <img 
                src={job.logo || `https://placehold.co/200/1a1a2e/ffffff?text=${job.company?.charAt(0)}`} 
                alt={job.company}
                className="w-full h-full object-contain"
              />
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{job.title}</h1>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                <div className="flex items-center text-gray-300">
                  <FaBuilding className="text-secondary mr-2" /> 
                  <span>{job.company}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FaMapMarkerAlt className="text-secondary mr-2" /> 
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FaClock className="text-secondary mr-2" /> 
                  <span>{formatJobType(job.jobType)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FaMoneyBillWave className="text-secondary mr-2" /> 
                  <span>{formatSalary(job.salary)}</span>
                </div>
                <div className="flex items-center text-gray-300">
                  <FaCalendarAlt className="text-secondary mr-2" /> 
                  <span>Đăng ngày {new Date(job.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                <button 
                  onClick={() => setIsApplicationFormOpen(true)}
                  className="bg-secondary text-primary px-6 py-3 rounded-md text-lg font-bold hover:bg-opacity-90 transition-colors"
                >
                  Ứng tuyển ngay
                </button>
                
                {job.applicationUrl && (
                  <a 
                    href={job.applicationUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-gray-800 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    <FaLink className="inline mr-2" /> Ứng tuyển qua website
                  </a>
                )}
                
                <button 
                  onClick={copyToClipboard}
                  className="bg-gray-800 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors"
                >
                  {copied ? <FaCheck className="inline mr-2" /> : <FaShareAlt className="inline mr-2" />}
                  {copied ? 'Đã sao chép' : 'Chia sẻ'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-8">
        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Job details */}
          <div className="lg:col-span-2">
            <div className="bg-primary rounded-lg shadow-lg p-6 md:p-8 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Mô tả công việc</h2>
              <div className="prose prose-invert max-w-none prose-headings:text-secondary prose-a:text-secondary">
                <p className="text-gray-300 whitespace-pre-line">{job.description}</p>
              </div>
            </div>
            
            {job.requirements && job.requirements.length > 0 && (
              <div className="bg-primary rounded-lg shadow-lg p-6 md:p-8 mb-8">
                <h2 className="text-2xl font-bold text-white mb-6">Yêu cầu</h2>
                <ul className="space-y-3">
                  {job.requirements.map((req, idx) => (
                    <li key={idx} className="flex items-start">
                      <FaMusic className="text-secondary mt-1.5 mr-3 flex-shrink-0" />
                      <span className="text-gray-300">{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Thêm phần đề xuất tiểu sử DJ nổi tiếng */}
            <div className="bg-primary rounded-lg shadow-lg p-6 md:p-8">
              <h2 className="text-2xl font-bold text-white mb-6">DJ nổi tiếng tại {job.company}</h2>
              <div className="border-l-4 border-secondary pl-4 py-2 mb-6">
                <p className="text-gray-300 italic">
                  "Sự kiện âm nhạc tại {job.company} đã giúp tôi trở thành DJ chuyên nghiệp như ngày hôm nay. Môi trường chuyên nghiệp, âm thanh đỉnh cao và khách hàng đam mê âm nhạc."
                </p>
                <p className="text-secondary mt-2">- DJ Minh Trí</p>
              </div>
              
              <div className="flex items-center gap-4 mb-6">
                <img src="https://placehold.co/80/1a1a2e/ffffff?text=DJ" alt="DJ" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="text-lg font-bold">DJ Hoàng Anh</h3>
                  <p className="text-gray-400">Biểu diễn tại {job.company} từ 2020-2022</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <img src="https://placehold.co/80/1a1a2e/ffffff?text=DJ" alt="DJ" className="w-16 h-16 rounded-full object-cover" />
                <div>
                  <h3 className="text-lg font-bold">DJ Linh Nguyễn</h3>
                  <p className="text-gray-400">Hiện đang biểu diễn tại {job.company}</p>
                </div>
              </div>
            </div>
            
            {/* Phần hiển thị bình luận */}
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Bình luận ({job.comments.length})</h3>
              
              {job.comments.map(comment => (
                <div key={comment._id} className="mb-4 bg-primary-dark p-4 rounded-lg">
                  <div className="flex items-start">
                    <img 
                      src={comment.user.avatar} 
                      alt={comment.user.name} 
                      className="w-10 h-10 rounded-full mr-4"
                    />
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="font-bold">{comment.user.name}</h4>
                        <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getUserTypeBadgeClass(comment.user.userType)}`}>
                          {getUserTypeLabel(comment.user.userType)}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mt-1">{formatDate(comment.createdAt)}</p>
                      <p className="mt-2">{comment.text}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Form thêm bình luận */}
            {currentUser && (
              <div className="mt-6 bg-primary-800 p-4 rounded-lg">
                <div className="flex items-center mb-4">
                  <img 
                    src={currentUser.avatar} 
                    alt={currentUser.name} 
                    className="w-10 h-10 rounded-full mr-3"
                  />
                  <div>
                    <div className="flex items-center">
                      <h4 className="font-medium">{currentUser.name}</h4>
                      <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${getUserTypeBadgeClass(currentUser.userType)}`}>
                        {getUserTypeLabel(currentUser.userType)}
                      </span>
                    </div>
                  </div>
                </div>
                <form onSubmit={handleCommentSubmit}>
                  <textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Thêm bình luận của bạn..."
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none resize-none"
                    rows="3"
                    required
                  ></textarea>
                  <div className="flex justify-end mt-2">
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 font-medium disabled:opacity-70"
                    >
                      {isSubmittingComment ? 'Đang gửi...' : 'Gửi bình luận'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Right column - Company info and related jobs */}
          <div className="lg:col-span-1">
            <div className="bg-primary rounded-lg shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold mb-4">Thông tin công ty</h2>
              <div className="flex items-center mb-6">
                <img 
                  src={job.logo || `https://placehold.co/80/1a1a2e/ffffff?text=${job.company?.charAt(0)}`}
                  alt={job.company}
                  className="w-16 h-16 mr-4 object-contain"
                />
                <h3 className="text-lg font-bold">{job.company}</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-start">
                  <FaMapMarkerAlt className="text-secondary mt-1 mr-3 flex-shrink-0" />
                  <span className="text-gray-300">{job.location}</span>
                </div>
                {job.applicationEmailAddress && (
                  <div className="flex items-start">
                    <FaEnvelope className="text-secondary mt-1 mr-3 flex-shrink-0" />
                    <a href={`mailto:${job.applicationEmailAddress}`} className="text-gray-300 hover:text-secondary">
                      {job.applicationEmailAddress}
                    </a>
                  </div>
                )}
                {job.applicationUrl && (
                  <div className="flex items-start">
                    <FaGlobe className="text-secondary mt-1 mr-3 flex-shrink-0" />
                    <a href={job.applicationUrl} target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-secondary">
                      Website công ty
                    </a>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-700 pt-4">
                <h4 className="text-lg font-semibold mb-2">Về {job.company}</h4>
                <p className="text-gray-300 mb-4">
                  {job.company} là một trong những địa điểm giải trí hàng đầu, nổi tiếng với không gian sang trọng và âm nhạc chất lượng cao. Chúng tôi luôn tìm kiếm những DJ tài năng để mang đến trải nghiệm âm nhạc tuyệt vời cho khách hàng.
                </p>
                <button className="text-secondary hover:underline">Xem thêm về công ty</button>
              </div>
            </div>
            
            <div className="bg-primary rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4">Việc làm tương tự</h2>
              <div className="space-y-4">
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="font-bold hover:text-secondary cursor-pointer">DJ cuối tuần tại Skylight Club</h3>
                  <div className="flex items-center text-sm text-gray-400 mt-2">
                    <FaMapMarkerAlt className="mr-1" /> Hồ Chí Minh
                    <span className="mx-2">•</span>
                    <FaMoneyBillWave className="mr-1" /> 2-3 triệu/buổi
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="font-bold hover:text-secondary cursor-pointer">DJ Resident tại Luxury Lounge</h3>
                  <div className="flex items-center text-sm text-gray-400 mt-2">
                    <FaMapMarkerAlt className="mr-1" /> Hà Nội
                    <span className="mx-2">•</span>
                    <FaMoneyBillWave className="mr-1" /> 15-20 triệu/tháng
                  </div>
                </div>
                <div className="border-b border-gray-700 pb-4">
                  <h3 className="font-bold hover:text-secondary cursor-pointer">DJ cho sự kiện âm nhạc định kỳ</h3>
                  <div className="flex items-center text-sm text-gray-400 mt-2">
                    <FaMapMarkerAlt className="mr-1" /> Đà Nẵng
                    <span className="mx-2">•</span>
                    <FaMoneyBillWave className="mr-1" /> 4-6 triệu/buổi
                  </div>
                </div>
              </div>
              <Link to="/jobs" className="text-secondary hover:underline flex items-center mt-4">
                Xem tất cả <FaArrowLeft className="ml-2 transform rotate-180" />
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Application form modal */}
      {isApplicationFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-primary rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Ứng tuyển: {job.title}</h2>
                <button 
                  onClick={() => setIsApplicationFormOpen(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FaTimes />
                </button>
              </div>
              
              {submitSuccess ? (
                <div className="text-center p-6">
                  <FaCheckCircle className="text-green-500 text-5xl mx-auto mb-4" />
                  <h3 className="text-xl font-bold mb-2">Đã gửi đơn ứng tuyển!</h3>
                  <p className="text-gray-300 mb-6">
                    Đơn ứng tuyển của bạn đã được gửi thành công. Chúng tôi sẽ liên hệ với bạn sớm!
                  </p>
                  <button
                    onClick={() => {
                      setIsApplicationFormOpen(false);
                      setSubmitSuccess(false);
                    }}
                    className="bg-secondary text-primary px-6 py-2 rounded-md font-bold hover:bg-opacity-90"
                  >
                    Đóng
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Họ tên*</label>
                    <input 
                      type="text"
                      name="name"
                      value={applicationForm.name}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Email*</label>
                    <input 
                      type="email"
                      name="email"
                      value={applicationForm.email}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Số điện thoại*</label>
                    <input 
                      type="tel"
                      name="phone"
                      value={applicationForm.phone}
                      onChange={handleChange}
                      required
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-gray-300 mb-2">Thông tin thêm</label>
                    <textarea
                      name="message"
                      value={applicationForm.message}
                      onChange={handleChange}
                      rows={5}
                      placeholder="Giới thiệu về kinh nghiệm của bạn, thể loại nhạc sở trường, dự án âm nhạc đã thực hiện..."
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2">Tải lên CV / Portfolio</label>
                    <div className="border border-dashed border-gray-700 rounded-md p-4 text-center">
                      <input 
                        type="file"
                        name="resume"
                        onChange={handleFileChange}
                        className="hidden"
                        id="resume-upload"
                        accept=".pdf,.doc,.docx,.mp3,.wav"
                      />
                      <label 
                        htmlFor="resume-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <FaUpload className="text-3xl text-gray-500 mb-2" />
                        <span className="text-gray-300">
                          {applicationForm.resume ? applicationForm.resume.name : 'Nhấp để tải lên CV hoặc tệp âm nhạc mẫu (PDF, DOC, MP3)'}
                        </span>
                        <span className="text-gray-500 text-sm mt-1">
                          Tối đa 10MB
                        </span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button 
                      type="button"
                      onClick={() => setIsApplicationFormOpen(false)}
                      className="px-4 py-2 mr-2 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                    >
                      Hủy
                    </button>
                    <button 
                      type="submit"
                      disabled={submitLoading}
                      className="px-6 py-2 bg-secondary text-primary rounded-md font-bold hover:bg-opacity-90 disabled:opacity-70 flex items-center"
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                          Đang gửi...
                        </>
                      ) : (
                        'Gửi đơn ứng tuyển'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobDetail; 