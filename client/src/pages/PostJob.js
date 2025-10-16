import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FaPlusCircle, FaInfoCircle, FaUpload, FaTrash, FaCoins, FaClock, FaCheckCircle, FaTimes, FaArrowRight, FaArrowLeft } from 'react-icons/fa';
import API from '../services/api';
import { AuthContext } from '../context/AuthContext';

const PostJob = () => {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    company: currentUser?.name || '',
    location: '',
    description: '',
    requirements: ['', '', ''],
    jobType: 'full-time',
    salary: {
      min: '',
      max: '',
      currency: 'VND',
      period: 'month'
    },
    applicationEmailAddress: currentUser?.email || '',
    applicationUrl: '',
    logo: null,
    coverImage: null,
    duration: 30
  });
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('salary.')) {
      const salaryField = name.split('.')[1];
      setFormData({
        ...formData,
        salary: {
          ...formData.salary,
          [salaryField]: value
        }
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle requirement changes
  const handleRequirementChange = (index, value) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements[index] = value;
    setFormData({
      ...formData,
      requirements: updatedRequirements
    });
  };
  
  // Add new requirement field
  const addRequirement = () => {
    setFormData({
      ...formData,
      requirements: [...formData.requirements, '']
    });
  };
  
  // Remove requirement field
  const removeRequirement = (index) => {
    const updatedRequirements = [...formData.requirements];
    updatedRequirements.splice(index, 1);
    setFormData({
      ...formData,
      requirements: updatedRequirements
    });
  };
  
  // Handle file uploads
  const handleFileUpload = (e) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData({
        ...formData,
        [name]: files[0]
      });
    }
  };
  
  // Navigation between steps
  const nextStep = () => {
    setStep(prevStep => prevStep + 1);
    window.scrollTo(0, 0);
  };
  
  const prevStep = () => {
    setStep(prevStep => prevStep - 1);
    window.scrollTo(0, 0);
  };
  
  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step < 3) {
      return nextStep();
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Tạo FormData để gửi cả file
      const jobData = new FormData();
      
      // Thêm các trường cơ bản
      Object.keys(formData).forEach(key => {
        if (key !== 'logo' && key !== 'coverImage' && key !== 'requirements' && key !== 'salary') {
          jobData.append(key, formData[key]);
        }
      });
      
      // Thêm salary dưới dạng JSON string
      jobData.append('salary', JSON.stringify(formData.salary));
      
      // Thêm requirements dưới dạng JSON string
      jobData.append('requirements', JSON.stringify(formData.requirements.filter(req => req.trim() !== '')));
      
      // Thêm files nếu có
      if (formData.logo) {
        jobData.append('logo', formData.logo);
      }
      
      if (formData.coverImage) {
        jobData.append('coverImage', formData.coverImage);
      }
      
      // Mô phỏng gửi API - thay thế bằng API thực khi có
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Simulate success response
      setSuccess(true);
      setStep(4);
    } catch (error) {
      console.error('Error posting job:', error);
      setError(error.response?.data?.message || 'Có lỗi xảy ra khi đăng tin tuyển dụng');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-dark text-white min-h-screen">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold mb-4">Đăng tin tuyển dụng DJ</h1>
            <p className="text-gray-400">
              Đăng tin tuyển dụng để tìm kiếm DJ tài năng cho quán bar, club hay sự kiện của bạn
            </p>
          </div>
          
          {/* Progress steps */}
          {!success && (
            <div className="flex items-center justify-between mb-12">
              <div className={`flex-1 h-2 ${step >= 1 ? 'bg-secondary' : 'bg-gray-700'}`}></div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step >= 1 ? 'bg-secondary text-primary' : 'bg-gray-700 text-white'} font-bold`}>1</div>
              <div className={`flex-1 h-2 ${step >= 2 ? 'bg-secondary' : 'bg-gray-700'}`}></div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step >= 2 ? 'bg-secondary text-primary' : 'bg-gray-700 text-white'} font-bold`}>2</div>
              <div className={`flex-1 h-2 ${step >= 3 ? 'bg-secondary' : 'bg-gray-700'}`}></div>
              <div className={`w-10 h-10 flex items-center justify-center rounded-full ${step >= 3 ? 'bg-secondary text-primary' : 'bg-gray-700 text-white'} font-bold`}>3</div>
              <div className={`flex-1 h-2 ${step >= 4 ? 'bg-secondary' : 'bg-gray-700'}`}></div>
            </div>
          )}
          
          {/* Error message */}
          {error && (
            <div className="bg-red-900 bg-opacity-25 border border-red-700 text-red-300 p-4 rounded-md mb-6">
              <p>{error}</p>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleSubmit} className="bg-primary rounded-lg p-6 md:p-8 shadow-lg">
            {step === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Thông tin cơ bản</h2>
                
                <div>
                  <label className="block text-gray-300 mb-2">Tiêu đề tin tuyển dụng*</label>
                  <input 
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Tuyển DJ cho Sky Bar cuối tuần"
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Tên quán bar/club*</label>
                  <input 
                    type="text"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Sky Bar"
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Địa điểm*</label>
                  <input 
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="Ví dụ: Quận 1, TP.HCM"
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Loại hình làm việc*</label>
                  <select 
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleChange}
                    required
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  >
                    <option value="full-time">Toàn thời gian</option>
                    <option value="part-time">Bán thời gian</option>
                    <option value="contract">Hợp đồng</option>
                    <option value="freelance">Tự do</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button 
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-secondary text-primary rounded-md font-bold hover:bg-opacity-90 flex items-center"
                  >
                    Tiếp theo <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            )}
            
            {step === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Chi tiết công việc</h2>
                
                <div>
                  <label className="block text-gray-300 mb-2">Mô tả công việc*</label>
                  <textarea 
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={6}
                    placeholder="Mô tả chi tiết về công việc DJ cần tuyển, thể loại nhạc, không gian quán bar, giờ làm việc, v.v..."
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Yêu cầu</label>
                  <div className="space-y-3">
                    {formData.requirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input 
                          type="text"
                          value={req}
                          onChange={(e) => handleRequirementChange(index, e.target.value)}
                          placeholder={`Yêu cầu ${index + 1}`}
                          className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                        />
                        <button 
                          type="button"
                          onClick={() => removeRequirement(index)}
                          className="p-2 text-gray-400 hover:text-red-400"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    ))}
                    <button 
                      type="button"
                      onClick={addRequirement}
                      className="flex items-center text-secondary hover:text-blue-400"
                    >
                      <FaPlusCircle className="mr-2" /> Thêm yêu cầu
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Logo quán/club</label>
                    <div className="border border-dashed border-gray-700 rounded-md p-4 text-center">
                      <input 
                        type="file"
                        name="logo"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="logo-upload"
                        accept="image/*"
                      />
                      <label 
                        htmlFor="logo-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {formData.logo ? (
                          <img 
                            src={URL.createObjectURL(formData.logo)} 
                            alt="Preview" 
                            className="w-32 h-32 object-contain mb-2"
                          />
                        ) : (
                          <FaUpload className="text-3xl text-gray-500 mb-2" />
                        )}
                        <span className="text-gray-300">
                          {formData.logo ? formData.logo.name : 'Tải lên logo (không bắt buộc)'}
                        </span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Ảnh bìa</label>
                    <div className="border border-dashed border-gray-700 rounded-md p-4 text-center">
                      <input 
                        type="file"
                        name="coverImage"
                        onChange={handleFileUpload}
                        className="hidden"
                        id="cover-upload"
                        accept="image/*"
                      />
                      <label 
                        htmlFor="cover-upload" 
                        className="cursor-pointer flex flex-col items-center"
                      >
                        {formData.coverImage ? (
                          <img 
                            src={URL.createObjectURL(formData.coverImage)} 
                            alt="Preview" 
                            className="w-full h-32 object-cover mb-2"
                          />
                        ) : (
                          <FaUpload className="text-3xl text-gray-500 mb-2" />
                        )}
                        <span className="text-gray-300">
                          {formData.coverImage ? formData.coverImage.name : 'Tải lên ảnh bìa (không bắt buộc)'}
                        </span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
                  >
                    <FaArrowLeft className="mr-2" /> Quay lại
                  </button>
                  <button 
                    type="button"
                    onClick={nextStep}
                    className="px-6 py-3 bg-secondary text-primary rounded-md font-bold hover:bg-opacity-90 flex items-center"
                  >
                    Tiếp theo <FaArrowRight className="ml-2" />
                  </button>
                </div>
              </div>
            )}
            
            {step === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold mb-6">Thông tin lương và ứng tuyển</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Mức lương từ</label>
                    <input 
                      type="number"
                      name="salary.min"
                      value={formData.salary.min}
                      onChange={handleChange}
                      placeholder="Ví dụ: 15000000"
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Đến</label>
                    <input 
                      type="number"
                      name="salary.max"
                      value={formData.salary.max}
                      onChange={handleChange}
                      placeholder="Ví dụ: 25000000"
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-gray-300 mb-2">Đơn vị tiền tệ</label>
                    <select 
                      name="salary.currency"
                      value={formData.salary.currency}
                      onChange={handleChange}
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    >
                      <option value="VND">VND</option>
                      <option value="USD">USD</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-gray-300 mb-2">Chu kỳ trả lương</label>
                    <select 
                      name="salary.period"
                      value={formData.salary.period}
                      onChange={handleChange}
                      className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                    >
                      <option value="hour">Giờ</option>
                      <option value="day">Ngày</option>
                      <option value="week">Tuần</option>
                      <option value="month">Tháng</option>
                      <option value="year">Năm</option>
                      <option value="gig">Buổi diễn</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Email liên hệ ứng tuyển</label>
                  <input 
                    type="email"
                    name="applicationEmailAddress"
                    value={formData.applicationEmailAddress}
                    onChange={handleChange}
                    placeholder="Email của bạn để nhận hồ sơ ứng tuyển"
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Link ứng tuyển (nếu có)</label>
                  <input 
                    type="url"
                    name="applicationUrl"
                    value={formData.applicationUrl}
                    onChange={handleChange}
                    placeholder="Ví dụ: https://yourwebsite.com/careers"
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-300 mb-2">Thời gian đăng tin (ngày)</label>
                  <input 
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    min="7"
                    max="90"
                    className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:border-secondary focus:outline-none text-white"
                  />
                  <p className="text-gray-500 text-sm mt-1">Tin tuyển dụng sẽ hiển thị trong số ngày bạn chọn</p>
                </div>
                
                <div className="flex justify-between">
                  <button 
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700 flex items-center"
                  >
                    <FaArrowLeft className="mr-2" /> Quay lại
                  </button>
                  <button 
                    type="submit"
                    disabled={loading}
                    className="px-6 py-3 bg-secondary text-primary rounded-md font-bold hover:bg-opacity-90 disabled:opacity-70 flex items-center"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary mr-2"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>Đăng tin tuyển dụng</>
                    )}
                  </button>
                </div>
              </div>
            )}
            
            {step === 4 && (
              <div className="text-center py-8">
                <FaCheckCircle className="text-secondary text-6xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold mb-4">Đăng tin tuyển dụng thành công!</h2>
                <p className="text-gray-300 mb-8">
                  Tin tuyển dụng DJ của bạn đã được đăng thành công. Bạn sẽ sớm nhận được các hồ sơ ứng tuyển từ những DJ tài năng.
                </p>
                <div className="flex justify-center gap-4">
                  <Link 
                    to="/jobs" 
                    className="px-6 py-3 bg-secondary text-primary rounded-md font-bold hover:bg-opacity-90"
                  >
                    Xem trang tuyển dụng
                  </Link>
                  <button
                    onClick={() => navigate('/')}
                    className="px-6 py-3 bg-gray-800 text-white rounded-md hover:bg-gray-700"
                  >
                    Về trang chủ
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJob; 