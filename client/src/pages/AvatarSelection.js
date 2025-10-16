import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';
import { FaUpload, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const cuteAvatars = [
  'https://i.pinimg.com/736x/83/87/44/8387445c5c0a3f6a2a0d9e7d3b5d3a5a.jpg',
  'https://img.pixers.pics/pho_wat(s3:700/FO/44/08/44086438_FO44086438_4057816cf631551065c7117e3f608792_500.jpg,500,410)/tranh-poster-de-thuong-avatar-voi-doi-mat-to.jpg',
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ-x7z-l7R5-s-kQ8-yW5-x9-Q-x9-Q-x9-Q-x9-Q&s',
  'https://e7.pngegg.com/pngimages/799/987/png-clipart-computer-icons-avatar-icon-design-avatar-heroes-service-thumbnail.png',
  'https://creazilla-store.fra1.digitaloceanspaces.com/cliparts/78041/cute-alien-cartoon-clipart-xl.png',
  'https://cdn.dribbble.com/users/1787/screenshots/1545638/avatar.png',
  'https://img.freepik.com/premium-vector/cute-robot-avatar-vactor-art_765324-40.jpg',
  'https://static.vecteezy.com/system/resources/previews/009/393/941/original/cute-cat-avatar-png.png'
];

const AvatarSelection = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);
  const [selectedAvatar, setSelectedAvatar] = useState(currentUser?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleAvatarSelect = (url) => {
    setSelectedAvatar(url);
    setAvatarFile(null); // Clear file selection if a pre-defined avatar is chosen
    setError(null);
    setSuccessMsg('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setSelectedAvatar(URL.createObjectURL(file)); // Show preview
      setError(null);
      setSuccessMsg('');
    }
  };

  const handleSaveAvatar = async () => {
    setError(null);
    setSuccessMsg('');
    setLoading(true);

    try {
      let finalAvatarUrl = selectedAvatar;

      if (avatarFile) {
        setUploading(true);
        const formData = new FormData();
        formData.append('imageFile', avatarFile);
        console.log('AvatarSelection.js: Uploading new avatar file...');
        const uploadRes = await API.uploadAvatar(formData);
        finalAvatarUrl = uploadRes.data.url;
        console.log('AvatarSelection.js: File uploaded. Received URL:', finalAvatarUrl);
        setUploading(false);
      }

      console.log('AvatarSelection.js: Saving avatar. Final URL to send:', finalAvatarUrl);
      const res = await API.updateUserProfile({ ...currentUser, avatar: finalAvatarUrl });
      console.log('AvatarSelection.js: User profile update response data:', res.data);
      updateProfile(res.data); // Update AuthContext state
      setSuccessMsg('Cập nhật ảnh đại diện thành công!');
      setTimeout(() => {
        navigate('/profile'); // Navigate back to profile page
      }, 1500);
    } catch (err) {
      console.error('Error saving avatar:', err);
      setError('Không thể cập nhật ảnh đại diện. Vui lòng thử lại.');
      setUploading(false);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-dark text-white flex justify-center items-center">
        <p>Đang tải dữ liệu người dùng...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark text-white py-10 px-4">
      <div className="max-w-4xl mx-auto bg-primary bg-opacity-30 rounded-lg p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-6 text-center">Chọn Ảnh Đại Diện</h1>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
            <FaTimesCircle /> {error}
          </div>
        )}
        
        {successMsg && (
          <div className="bg-green-500 bg-opacity-20 border border-green-500 text-green-300 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
            <FaCheckCircle /> {successMsg}
          </div>
        )}

        <div className="flex flex-col items-center mb-8">
          <p className="text-gray-400 mb-2">Ảnh đại diện hiện tại:</p>
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-secondary flex items-center justify-center">
            <img 
              src={selectedAvatar || currentUser.avatar || "https://placehold.co/128/1a1a2e/ffffff?text=User"}
              alt="Current Avatar" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <h2 className="text-xl font-semibold mb-4">Chọn từ các ảnh dễ thương:</h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 mb-8">
          {cuteAvatars.map((url, index) => (
            <div 
              key={index} 
              className={`w-20 h-20 rounded-full overflow-hidden border-2 cursor-pointer transition-all ${
                selectedAvatar === url ? 'border-secondary ring-2 ring-secondary' : 'border-gray-600 hover:border-secondary'
              }`}
              onClick={() => handleAvatarSelect(url)}
            >
              <img src={url} alt={`Avatar ${index + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        <h2 className="text-xl font-semibold mb-4">Hoặc tải lên ảnh của riêng bạn:</h2>
        <div className="mb-6">
          <label htmlFor="upload-avatar" className="block text-sm font-medium mb-1 flex items-center gap-2">
            <FaUpload className="text-secondary" /> Chọn tệp ảnh
          </label>
          <input 
            type="file" 
            id="upload-avatar" 
            accept="image/*" 
            onChange={handleFileChange}
            className="w-full p-3 bg-dark border border-gray-700 rounded-md focus:ring-secondary focus:border-secondary text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-primary hover:file:bg-secondary/80"
          />
          {uploading && (
            <div className="flex items-center gap-2 text-sm text-gray-400 mt-2">
              <FaSpinner className="animate-spin" /> Đang tải ảnh...
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <button 
            onClick={() => navigate('/profile')}
            className="px-6 py-2 bg-gray-700 text-white rounded-md hover:bg-opacity-90 transition-all"
            disabled={loading}
          >
            Hủy
          </button>
          <button 
            onClick={handleSaveAvatar}
            className="px-6 py-2 bg-secondary text-primary rounded-md hover:bg-opacity-90 transition-all flex items-center gap-2"
            disabled={loading || uploading || (!selectedAvatar && !avatarFile)}
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : ''} Lưu Ảnh Đại Diện
          </button>
        </div>
      </div>
    </div>
  );
};

export default AvatarSelection; 