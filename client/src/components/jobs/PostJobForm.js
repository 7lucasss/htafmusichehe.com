import React, { useState, useRef } from 'react';
import { FaImage, FaMapMarkerAlt, FaTimes, FaPaperPlane } from 'react-icons/fa';
import API from '../../services/api';

const PostJobForm = ({ onPostSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    jobType: 'full-time'
  });
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
      // Chỉ lấy tối đa 4 hình
      const newImages = [...images, ...files].slice(0, 4);
      setImages(newImages);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.title.trim()) {
      setError('Vui lòng nhập tiêu đề công việc');
      return;
    }

    setIsLoading(true);

    try {
      const jobFormData = new FormData();
      
      // Thêm các trường cơ bản
      jobFormData.append('title', formData.title);
      jobFormData.append('description', formData.description || formData.title);
      jobFormData.append('location', formData.location || 'Chưa cập nhật');
      jobFormData.append('jobType', formData.jobType);
      
      // Thêm hình ảnh nếu có
      if (images.length > 0) {
        images.forEach(image => {
          jobFormData.append('images', image);
        });
      }

      console.log('Đang gửi form dữ liệu...');
      const response = await API.createQuickJob(jobFormData);
      console.log('Đăng tin thành công:', response.data);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        location: '',
        jobType: 'full-time'
      });
      setImages([]);
      
      // Callback để cập nhật UI
      if (onPostSuccess) {
        onPostSuccess(response.data);
      }
    } catch (err) {
      console.error('Lỗi đăng tin:', err);
      setError(err.response?.data?.message || 'Không thể đăng tin. Vui lòng thử lại sau.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg shadow-md p-4 mb-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Tiêu đề công việc..."
            className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:border-secondary"
          />
        </div>
        
        <div className="mb-4">
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Mô tả công việc, yêu cầu, thể loại nhạc..."
            rows="3"
            className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:border-secondary"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <div className="flex items-center">
            <FaMapMarkerAlt className="text-gray-400 mr-2" />
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="Địa điểm"
              className="flex-grow bg-gray-700 text-white rounded-lg p-2 border border-gray-600 focus:outline-none focus:border-secondary"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <select
            name="jobType"
            value={formData.jobType}
            onChange={handleChange}
            className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:outline-none focus:border-secondary"
          >
            <option value="full-time">Toàn thời gian</option>
            <option value="part-time">Bán thời gian</option>
            <option value="contract">Hợp đồng</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>
        
        {/* Display image previews */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mb-4">
            {images.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(image)}
                  alt={`Preview ${index}`}
                  className="w-full h-32 object-cover rounded-lg border border-gray-600"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-gray-800 text-white p-1 rounded-full"
                >
                  <FaTimes />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Error message */}
        {error && <div className="text-red-500 mb-3">{error}</div>}
        
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleImageClick}
              className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-2 rounded-full"
            >
              <FaImage />
            </button>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              ref={fileInputRef}
              className="hidden"
            />
          </div>
          
          <button
            type="submit"
            disabled={isLoading}
            className={`flex items-center bg-secondary text-white font-medium px-4 py-2 rounded-full
              ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-opacity-90'}`}
          >
            {isLoading ? 'Đang đăng...' : (
              <>
                <FaPaperPlane className="mr-2" /> Đăng ngay
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PostJobForm; 