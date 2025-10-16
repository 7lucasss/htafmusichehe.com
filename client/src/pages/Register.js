import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserAlt, FaEnvelope, FaLock, FaGoogle, FaFacebook, FaEye, FaEyeSlash, FaUserTag } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'user', // Giá trị mặc định
    role: 'user' // Mặc định là người dùng thường
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      return setError('Mật khẩu xác nhận không khớp');
    }
    
    if (formData.password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    try {
      setLoading(true);
      const response = await API.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        userType: formData.userType,
        role: formData.role
      });
      
      // Đăng nhập ngay sau khi đăng ký thành công
      await login(formData.email, formData.password);
      
      // Chuyển hướng đến trang chủ
      navigate('/');
    } catch (err) {
      console.error('Lỗi đăng ký:', err);
      setError(err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-primary bg-opacity-40 p-8 rounded-lg shadow-xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Tạo tài khoản mới
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Hoặc{' '}
            <Link to="/login" className="font-medium text-secondary hover:text-secondary-dark transition-colors">
              đăng nhập nếu đã có tài khoản
            </Link>
          </p>
        </div>
        
        {error && (
          <div className="bg-red-900 bg-opacity-40 border border-red-500 text-red-300 px-4 py-3 rounded relative">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="sr-only">Họ tên</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaUserAlt className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                  placeholder="Họ tên"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaEnvelope className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                  placeholder="Email"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="userType" className="sr-only">Vai trò của bạn</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaUserTag className="h-5 w-5 text-gray-500" />
                </div>
                <select
                  id="userType"
                  name="userType"
                  required
                  value={formData.userType}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                >
                  <option value="dj">DJ</option>
                  <option value="producer">Producer</option>
                  <option value="recruiter">Nhà tuyển dụng</option>
                  <option value="user">Người nghe nhạc</option>
                </select>
              </div>
              <p className="mt-1 text-xs text-gray-500">Chọn vai trò phù hợp với bạn</p>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                  placeholder="Mật khẩu"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-white"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="sr-only">Xác nhận mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <FaLock className="h-5 w-5 text-gray-500" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="appearance-none relative block w-full px-10 py-3 border border-gray-700 rounded-md bg-dark text-white placeholder-gray-500 focus:outline-none focus:ring-secondary focus:border-secondary focus:z-10 sm:text-sm"
                  placeholder="Xác nhận mật khẩu"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <button
                    type="button"
                    className="text-gray-500 hover:text-white"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-primary bg-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-dark disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : 'Đăng ký'}
            </button>
          </div>
          
          <div className="relative flex items-center justify-center">
            <div className="absolute w-full border-t border-gray-700"></div>
            <div className="relative bg-primary bg-opacity-90 px-4 text-sm text-gray-400">
              <span>
                Hoặc đăng ký với
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              className="group relative flex justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-red-600 hover:border-red-600 transition-colors"
            >
              <FaGoogle className="text-gray-300 group-hover:text-white" />
            </button>
            <button
              type="button"
              className="group relative flex justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-blue-600 hover:border-blue-600 transition-colors"
            >
              <FaFacebook className="text-gray-300 group-hover:text-white" />
            </button>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-secondary hover:text-secondary-dark transition-colors">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register; 