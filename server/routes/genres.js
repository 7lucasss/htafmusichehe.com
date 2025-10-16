const express = require('express');
const router = express.Router();
const Genre = require('../models/Genre');
const adminAuth = require('../middleware/adminAuth');

// @route   GET /api/genres
// @desc    Get all active genres
// @access  Public
router.get('/', async (req, res) => {
  try {
    const genres = await Genre.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST /api/genres
// @desc    Create a new genre
// @access  Private (Admin)
router.post('/', adminAuth, async (req, res) => {
  const { name, description, color, imageUrl, isActive, sortOrder } = req.body;

  // Basic validation
  if (!name) {
    return res.status(400).json({ success: false, message: 'Tên thể loại là bắt buộc' });
  }

  try {
    // Check if genre already exists
    let genre = await Genre.findOne({ name });
    if (genre) {
      return res.status(400).json({ success: false, message: 'Thể loại này đã tồn tại' });
    }

    genre = new Genre({
      name,
      description,
      color,
      imageUrl,
      isActive,
      sortOrder,
      createdBy: req.user.id // Lấy ID người dùng từ token (adminAuth middleware)
    });

    await genre.save();

    res.status(201).json({
      success: true,
      message: 'Thể loại đã được tạo thành công',
      data: genre
    });
  } catch (error) {
    console.error('Create genre error:', error);
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
});

// @route   GET /api/genres/popular
// @desc    Get popular genres by song count
// @access  Public
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    // This static method needs to be defined in the Genre model
    const genres = await Genre.getPopularGenres(parseInt(limit));
    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    console.error('Get popular genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

module.exports = router; 