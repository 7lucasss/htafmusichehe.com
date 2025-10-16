import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser, FaEnvelope, FaCalendarAlt, FaEdit, FaMusic, FaHeart, FaShoppingBag, FaStar, FaCrown, FaUpload, FaCamera, FaPlay, FaSpinner } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
// import AdminRedirect from '../components/routing/AdminRedirect'; // Temporarily removed to debug

const Profile = () => {
  const { currentUser, updateProfile, loading, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('profile');
  const [purchases, setPurchases] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    avatar: ''
  });
  // Removed avatarFile state as selection is now handled by AvatarSelection.js
  // Removed uploadingAvatar state as it's now handled by AvatarSelection.js
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !currentUser) {
      navigate('/login');
    }
    
    if (currentUser) {
      setUserForm({
        name: currentUser.name,
        avatar: currentUser.avatar
      });
      console.log('Profile.js: currentUser object on mount:', currentUser); // Log entire currentUser object
      console.log('Profile.js: currentUser avatar on mount:', currentUser.avatar); // Log current avatar
      fetchUserData();
    }
  }, [currentUser, loading, navigate]);

  const fetchUserData = async () => {
    setLoadingData(true);
    setError(null);
    
    try {
      // Fetch user's purchase history
      const purchasesRes = await API.getPurchaseHistory();
      setPurchases(purchasesRes.data);
      
      // Fetch user's full profile with favorites
      const profileRes = await API.getUserProfile();
      setFavorites(profileRes.data.favorites || []);
    } catch (err) {
      setError('Không thể tải dữ liệu. Vui lòng thử lại sau.');
      console.error(err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg('');
    setLoadingData(true);

    try {
      // Only update name and other non-avatar userForm fields here
      // Avatar update is handled by AvatarSelection.js
      const res = await API.updateUserProfile({ name: userForm.name }); // Only send name
      updateProfile(res.data);
      setSuccessMsg('Cập nhật thông tin thành công!');
      setIsEditing(false);
    } catch (err) {
      setError('Cập nhật thất bại. Vui lòng thử lại.');
      console.error('Profile.js: Update profile error:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserForm({
      ...userForm,
      [name]: value
    });
  };

  // Removed handleAvatarChange as selection is now handled by AvatarSelection.js

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('vi-VN', options);
  };

  if (loading || !currentUser) {
    return (
      <div className="min-h-screen bg-dark text-white flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <AdminRedirect /> */}
      <div className="min-h-screen bg-dark text-white py-10 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Profile header */}
          <div className="bg-primary bg-opacity-30 rounded-lg p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary">
                <img 
                  src={`${currentUser.avatar || "https://placehold.co/200/1a1a2e/ffffff?text=User"}?t=${new Date().getTime()}`} // Add timestamp for cache busting
                  alt={currentUser.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Link to avatar selection page */}
              {activeTab === 'profile' && (
                <button 
                  onClick={() => navigate('/avatar-selection')}
                  className="absolute bottom-0 right-0 bg-secondary text-primary p-2 rounded-full hover:bg-opacity-90 transition-all cursor-pointer"
                  title="Thay đổi ảnh đại diện"
                >
                  <FaCamera />
                </button>
              )}
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentUser.name}</h1>
              <p className="text-gray-400 mb-2 flex items-center justify-center md:justify-start gap-2">
                <FaEnvelope /> {currentUser.email}
              </p>
              <p className="text-gray-400 mb-4 flex items-center justify-center md:justify-start gap-2">
                <FaCalendarAlt /> Thành viên từ: {formatDate(currentUser.createdAt)}
              </p>
              
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                <span className="px-3 py-1 rounded-full text-xs bg-secondary text-primary font-bold flex items-center gap-1">
                  <FaCrown /> {currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'premium' ? 'Premium' : 'Thành viên'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-700 text-white flex items-center gap-1">
                  <FaMusic /> {purchases.length} bài hát đã mua
                </span>
                <span className="px-3 py-1 rounded-full text-xs bg-gray-700 text-white flex items-center gap-1">
                  <FaHeart /> {favorites.length} bài hát yêu thích
                </span>
              </div>
              
              {activeTab !== 'profile' && (
                <button 
                  onClick={() => setActiveTab('profile')}
                  className="px-4 py-2 bg-primary hover:bg-opacity-80 rounded-md flex items-center gap-2 mx-auto md:mx-0"
                >
                  <FaUser /> Quay lại hồ sơ
                </button>
              )}
            </div>
          </div>
          
          {/* Tabs */}
          <div className="mb-8">
            <div className="flex overflow-x-auto space-x-2 pb-2 scrollbar-hide">
              <button
                onClick={() => setActiveTab('profile')}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  activeTab === 'profile' ? 'bg-secondary text-primary font-semibold' : 'bg-primary bg-opacity-40 hover:bg-opacity-60'
                }`}
              >
                <FaUser className="inline mr-2" /> Hồ sơ
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  activeTab === 'purchases' ? 'bg-secondary text-primary font-semibold' : 'bg-primary bg-opacity-40 hover:bg-opacity-60'
                }`}
              >
                <FaShoppingBag className="inline mr-2" /> Đã mua
              </button>
              <button
                onClick={() => setActiveTab('favorites')}
                className={`px-4 py-2 rounded-md whitespace-nowrap ${
                  activeTab === 'favorites' ? 'bg-secondary text-primary font-semibold' : 'bg-primary bg-opacity-40 hover:bg-opacity-60'
                }`}
              >
                <FaHeart className="inline mr-2" /> Yêu thích
              </button>
            </div>
          </div>
          
          {/* Error/Success messages */}
          {error && (
            <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-6">
              {error}
            </div>
          )}
          
          {successMsg && (
            <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded relative mb-6">
              {successMsg}
            </div>
          )}
          
          {/* Content based on active tab */}
          <div className="bg-primary bg-opacity-30 rounded-lg p-6">
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
                  {!isEditing ? (
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-all flex items-center gap-2"
                    >
                      <FaEdit /> Chỉnh sửa
                    </button>
                  ) : (
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-opacity-90 transition-all"
                    >
                      Hủy
                    </button>
                  )}
                </div>
                
                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-dark bg-opacity-40 rounded-md">
                        <p className="text-gray-400 text-sm mb-1">Họ tên</p>
                        <p className="font-medium">{currentUser.name}</p>
                      </div>
                      <div className="p-4 bg-dark bg-opacity-40 rounded-md">
                        <p className="text-gray-400 text-sm mb-1">Email</p>
                        <p className="font-medium">{currentUser.email}</p>
                      </div>
                      <div className="p-4 bg-dark bg-opacity-40 rounded-md">
                        <p className="text-gray-400 text-sm mb-1">Loại tài khoản</p>
                        <p className="font-medium">{currentUser.role === 'admin' ? 'Admin' : currentUser.role === 'premium' ? 'Premium' : 'Thành viên'}</p>
                      </div>
                      <div className="p-4 bg-dark bg-opacity-40 rounded-md">
                        <p className="text-gray-400 text-sm mb-1">Ngày tham gia</p>
                        <p className="font-medium">{formatDate(currentUser.createdAt)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdateProfile}>
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium mb-1">Họ tên</label>
                        <input 
                          type="text" 
                          id="name" 
                          name="name" 
                          value={userForm.name} 
                          onChange={handleChange}
                          className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:ring-secondary focus:border-secondary text-white"
                          required
                        />
                      </div>
                      {/* The file input for avatar is now handled by the FaCamera icon next to the avatar image */}
                      <div className="flex gap-4 mt-6">
                        <button 
                          type="submit" 
                          className="px-6 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-all flex items-center gap-2"
                          disabled={loadingData}
                        >
                          {loadingData ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </button>
                        <button 
                          type="button" 
                          onClick={() => setIsEditing(false)}
                          className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-opacity-90 transition-all"
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
            
            {activeTab === 'purchases' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Bài hát đã mua</h2>
                
                {loadingData ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : purchases.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FaMusic className="text-4xl mx-auto mb-4 text-gray-500" />
                    <p className="mb-4">Bạn chưa mua bài hát nào.</p>
                    <Link to="/music" className="inline-block px-6 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-all">
                      Khám phá bài hát
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {purchases.map((purchase, index) => (
                      <div key={index} className="bg-dark bg-opacity-40 rounded-lg overflow-hidden group hover:bg-opacity-60 transition-all">
                        <Link to={`/music/${purchase.songId._id}`} className="block">
                          <div className="relative">
                            <img 
                              src={purchase.songId.coverUrl || "https://placehold.co/300/1a1a2e/ffffff?text=Cover"} 
                              alt={purchase.songId.title}
                              className="w-full aspect-square object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute top-2 right-2 bg-primary bg-opacity-70 text-xs px-2 py-1 rounded">
                              {purchase.format.toUpperCase()}
                            </div>
                          </div>
                          <div className="p-4">
                            <h3 className="font-medium group-hover:text-secondary transition-colors truncate">{purchase.songId.title}</h3>
                            <p className="text-gray-400 text-sm truncate">{purchase.songId.artist}</p>
                            <div className="flex justify-between items-center mt-2">
                              <span className="text-gray-400 text-xs">{formatDate(purchase.purchaseDate)}</span>
                              <span className="font-semibold text-secondary">{purchase.price.toLocaleString('vi-VN')}đ</span>
                            </div>
                          </div>
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'favorites' && (
              <div>
                <h2 className="text-xl font-bold mb-6">Bài hát yêu thích</h2>
                
                {loadingData ? (
                  <div className="text-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
                    <p>Đang tải dữ liệu...</p>
                  </div>
                ) : favorites.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <FaHeart className="text-4xl mx-auto mb-4 text-gray-500" />
                    <p className="mb-4">Bạn chưa thêm bài hát nào vào yêu thích.</p>
                    <Link to="/music" className="inline-block px-6 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-all">
                      Khám phá bài hát
                    </Link>
                  </div>
                ) : (
                  <div className="bg-dark bg-opacity-20 rounded-lg overflow-hidden">
                    {/* List header */}
                    <div className="grid grid-cols-12 py-3 px-4 border-b border-gray-700 font-semibold text-gray-400 bg-primary bg-opacity-30">
                      <div className="col-span-1">#</div>
                      <div className="col-span-6">Bài hát</div>
                      <div className="col-span-3">Nghệ sĩ</div>
                      <div className="col-span-2">Hành động</div>
                    </div>
                    
                    {/* List body */}
                    {favorites.map((song, index) => (
                      <div 
                        key={index}
                        className="grid grid-cols-12 py-3 px-4 border-b border-gray-700 last:border-0 items-center hover:bg-primary hover:bg-opacity-30 transition-colors group"
                      >
                        <div className="col-span-1 text-gray-400">{index + 1}</div>
                        <div className="col-span-6">
                          <Link to={`/music/${song._id}`} className="flex items-center">
                            <img 
                              src={song.coverUrl || "https://placehold.co/80/1a1a2e/ffffff?text=Cover"} 
                              alt={song.title}
                              className="w-10 h-10 object-cover rounded mr-3 group-hover:scale-105 transition-transform duration-300"
                            />
                            <span className="group-hover:text-secondary transition-colors duration-300">{song.title}</span>
                          </Link>
                        </div>
                        <div className="col-span-3 text-gray-400">{song.artist}</div>
                        <div className="col-span-2 flex space-x-2">
                          <button className="p-2 text-gray-400 hover:text-secondary transition-colors">
                            <FaPlay />
                          </button>
                          <button 
                            className="p-2 text-red-500"
                            onClick={() => {
                              // Remove from favorites
                              alert('Tính năng đang phát triển');
                            }}
                          >
                            <FaHeart />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile; 