const express = require('express');
const router = express.Router();
const Playlist = require('../models/Playlist');
const auth = require('../middleware/auth');

// @route   GET api/playlists
// @desc    Lấy danh sách các playlist công khai
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;

    const playlists = await Playlist.find({ isPublic: true, isActive: true })
      .populate('createdBy', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const total = await Playlist.countDocuments({ isPublic: true, isActive: true });

    res.json({
      success: true,
      data: playlists,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Không thể tải danh sách playlist',
      error: error.message 
    });
  }
});

// @route   GET api/playlists/:id
// @desc    Lấy chi tiết một playlist công khai
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const playlist = await Playlist.findOne({ _id: req.params.id, isPublic: true, isActive: true })
      .populate('createdBy', 'name')
      .populate('songs', 'title artist duration imageUrl');

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy playlist hoặc playlist không công khai.' });
    }

    res.json({ success: true, data: playlist });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi tải chi tiết playlist',
      error: error.message 
    });
  }
});


// @route   POST api/playlists/:id/like
// @desc    Like/Unlike một playlist
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist || !playlist.isPublic) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy playlist.' });
    }
    
    await playlist.toggleLike(req.user.id);

    res.json({
      success: true,
      message: 'Cập nhật trạng thái like thành công',
      data: {
        likesCount: playlist.likesCount
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi like playlist',
      error: error.message 
    });
  }
});


module.exports = router; 