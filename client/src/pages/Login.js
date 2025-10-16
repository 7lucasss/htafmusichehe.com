import React, { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaUserAlt, FaLock, FaGoogle, FaFacebook, FaSpotify, FaSignInAlt, FaEye, FaEyeSlash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);
  
  // Lấy đường dẫn redirect từ state của location (nếu có)
  const from = location.state?.from?.pathname || "/";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    console.log('Đang đăng nhập với:', formData.email);
    
    try {
      // Sử dụng fetch trực tiếp để debug
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      });
      
      console.log('Status code:', response.status);
      const data = await response.json();
      console.log('Login response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại');
      }
      
      // Lưu token và thông tin người dùng
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.user.role);
      
      // Redirect mà không dùng AuthContext để debug
      if (data.user.role === 'admin') {
        window.location.href = '/admin';
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-primary bg-opacity-30 p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-white">Đăng nhập</h2>
          <p className="mt-2 text-sm text-gray-300">Nghe và trải nghiệm kho nhạc chất lượng</p>
        </div>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded">
            {error}
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUserAlt className="text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-3 bg-dark bg-opacity-70 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary transition-colors"
                  placeholder="Địa chỉ email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Mật khẩu</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-12 py-3 bg-dark bg-opacity-70 border border-gray-700 rounded-md text-white focus:ring-secondary focus:border-secondary transition-colors"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleChange}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                name="remember"
                type="checkbox"
                checked={formData.remember}
                onChange={handleChange}
                className="h-4 w-4 rounded text-secondary focus:ring-secondary border-gray-600 bg-gray-700"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-400">
                Nhớ đăng nhập
              </label>
            </div>

            <div className="text-sm">
              <Link to="/forgot-password" className="text-secondary hover:text-secondary-dark">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-md text-primary bg-secondary hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary-dark disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <FaSignInAlt className="h-5 w-5 text-primary" />
              </span>
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
            </button>
          </div>
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-3 bg-primary bg-opacity-30 text-gray-400">
                  Hoặc đăng nhập với
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3 mt-4">
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
              <button
                type="button"
                className="group relative flex justify-center py-2 px-4 border border-gray-600 rounded-md hover:bg-green-600 hover:border-green-600 transition-colors"
              >
                <FaSpotify className="text-gray-300 group-hover:text-white" />
              </button>
            </div>
          </div>
        </form>
        
        <div className="text-center mt-4">
          <p className="text-sm text-gray-400">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="text-secondary hover:text-secondary-dark transition-colors">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 