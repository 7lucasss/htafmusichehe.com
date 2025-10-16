import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';

const ArtistForm = ({ artist, onSave, onCancel }) => {
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (artist) {
      setName(artist.name || '');
      setBio(artist.bio || '');
      setImageUrl(artist.imageUrl || '');
    }
  }, [artist]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const artistData = { name, bio, imageUrl };

    try {
      let savedArtist;
      if (artist && artist._id) {
        // Update artist
        const response = await adminApi.updateArtist(artist._id, artistData);
        savedArtist = response.data;
      } else {
        // Create artist
        const response = await adminApi.createArtist(artistData);
        savedArtist = response.data;
      }
      onSave(savedArtist);
    } catch (err) {
      console.error('Error saving artist:', err);
      setError('Không thể lưu nghệ sĩ. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">
          {artist ? 'Chỉnh sửa Nghệ sĩ' : 'Thêm Nghệ sĩ mới'}
        </h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-300 mb-2">Tên Nghệ sĩ</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="bio" className="block text-gray-300 mb-2">Tiểu sử</label>
            <textarea
              id="bio"
              rows="4"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            ></textarea>
          </div>
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-gray-300 mb-2">URL Hình ảnh</label>
            <input
              id="imageUrl"
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded disabled:opacity-50 flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner-sm mr-2"></div>
                  <span>Đang lưu...</span>
                </>
              ) : (
                'Lưu Nghệ sĩ'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ArtistForm; 