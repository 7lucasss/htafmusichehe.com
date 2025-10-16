import React, { useState, useEffect } from 'react';
import adminApi from '../../services/adminApi';

const GenreForm = ({ genre, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (genre) {
      setFormData({
        name: genre.name || '',
        description: genre.description || '',
      });
    } else {
      setFormData({ name: '', description: '' });
    }
  }, [genre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let savedGenre;
      if (genre && genre._id) {
        savedGenre = await adminApi.updateGenre(genre._id, formData);
      } else {
        savedGenre = await adminApi.createGenre(formData);
      }
      onSave(savedGenre);
    } catch (err) {
      console.error('Error saving genre:', err);
      setError('Không thể lưu thể loại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-8 max-w-lg w-full mx-4">
        <h2 className="text-2xl font-bold text-white mb-6">
          {genre ? 'Chỉnh sửa Thể loại' : 'Thêm Thể loại mới'}
        </h2>
        
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-300 mb-2">Tên Thể loại</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-gray-300 mb-2">Mô tả</label>
            <textarea
              id="description"
              name="description"
              rows="3"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-secondary"
            ></textarea>
          </div>
          <div className="flex justify-end space-x-4 pt-4">
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
              {loading ? 'Đang lưu...' : 'Lưu Thể loại'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GenreForm; 