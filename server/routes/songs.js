const express = require('express');
const router = express.Router();
const Song = require('../models/Song');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const { uploadAudio, uploadImage } = require('../middleware/upload');

// @route   POST /api/songs
// @desc    Tạo bài hát mới
// @access  Private/Admin
router.post('/', [auth, adminAuth], async (req, res) => {
  try {
    const {
      title,
      artist,
      genre,
      price,
      audioUrl,
      imageUrl,
      lyrics,
      duration,
      isActive,
      audioInfo,
      tags
    } = req.body;

    // Validate required fields
    if (!title || !artist || !genre || !audioUrl || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng điền đầy đủ thông tin bắt buộc'
      });
    }

    // Create new song
    const song = new Song({
      title,
      artist,
      genre,
      price: {
        mp3: price?.mp3 || 0.99,
        flac: price?.flac || 1.99,
        wav: price?.wav || 2.99
      },
      audioUrl,
      imageUrl,
      lyrics,
      duration,
      isActive: isActive !== undefined ? isActive : true,
      audioInfo,
      tags,
      createdBy: req.user.id
    });

    await song.save();

    // Populate references
    await song.populate([
      { path: 'artist', select: 'name' },
      { path: 'createdBy', select: 'name' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Tạo bài hát thành công',
      data: song
    });

  } catch (error) {
    console.error('Create song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET /api/songs
// @desc    Lấy danh sách bài hát với filter và pagination
// @access  Public
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      sort = '-createdAt',
      genre,
      artist,
      search,
      isActive = true
    } = req.query;

    // Build query
    const query = { isActive };
    
    if (genre) query.genre = genre;
    if (artist) query.artist = artist;
    
    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const songs = await Song.find(query)
      .populate('artist', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit);

    // Get total count
    const total = await Song.countDocuments(query);

    res.json({
      success: true,
      data: songs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get songs error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET /api/songs/:id
// @desc    Lấy chi tiết bài hát
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate('artist', 'name')
      .populate('createdBy', 'name');

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    res.json({
      success: true,
      data: song
    });

  } catch (error) {
    console.error('Get song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   PUT /api/songs/:id
// @desc    Cập nhật bài hát
// @access  Private/Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const {
      title,
      artist,
      genre,
      price,
      audioUrl,
      imageUrl,
      lyrics,
      duration,
      isActive,
      audioInfo,
      tags
    } = req.body;

    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    // Update fields
    if (title) song.title = title;
    if (artist) song.artist = artist;
    if (genre) song.genre = genre;
    if (price) {
      song.price = {
        mp3: price.mp3 || song.price.mp3,
        flac: price.flac || song.price.flac,
        wav: price.wav || song.price.wav
      };
    }
    if (audioUrl) song.audioUrl = audioUrl;
    if (imageUrl) song.imageUrl = imageUrl;
    if (lyrics) song.lyrics = lyrics;
    if (duration) song.duration = duration;
    if (isActive !== undefined) song.isActive = isActive;
    if (audioInfo) song.audioInfo = audioInfo;
    if (tags) song.tags = tags;

    song.updatedBy = req.user.id;

    await song.save();

    // Populate references
    await song.populate([
      { path: 'artist', select: 'name' },
      { path: 'updatedBy', select: 'name' }
    ]);

    res.json({
      success: true,
      message: 'Cập nhật bài hát thành công',
      data: song
    });

  } catch (error) {
    console.error('Update song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   DELETE /api/songs/:id
// @desc    Xóa bài hát
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    await song.remove();

    res.json({
      success: true,
      message: 'Xóa bài hát thành công',
      data: song._id
    });

  } catch (error) {
    console.error('Delete song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST /api/songs/:id/like
// @desc    Like/Unlike bài hát
// @access  Private
router.post('/:id/like', auth, async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    await song.toggleLike(req.user.id);

    res.json({
      success: true,
      message: 'Đã cập nhật trạng thái like',
      data: {
        liked: song.likes.includes(req.user.id),
        likesCount: song.likes.length
      }
    });

  } catch (error) {
    console.error('Like song error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST /api/songs/play/:id
// @desc    Tăng lượt nghe bài hát
// @access  Public
router.post('/:id/play', async (req, res) => {
  console.log(`Received play count increment request for song ID: ${req.params.id}`);
  try {
    const song = await Song.findById(req.params.id);

    if (!song) {
      console.log(`Song with ID ${req.params.id} not found.`);
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy bài hát'
      });
    }

    song.playCount = (song.playCount || 0) + 1;
    await song.save();

    res.json({
      success: true,
      message: 'Lượt nghe đã được cập nhật',
      data: { playCount: song.playCount }
    });

  } catch (error) {
    console.error('Increment play count error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET /api/songs/top/played
// @desc    Lấy top bài hát được nghe nhiều
// @access  Public
router.get('/top/played', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const songs = await Song.getTopPlayed(parseInt(limit));

    res.json({
      success: true,
      data: songs
    });

  } catch (error) {
    console.error('Get top played error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET /api/songs/top/liked
// @desc    Lấy top bài hát được thích nhiều
// @access  Public
router.get('/top/liked', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const songs = await Song.find({ isActive: true })
      .sort({ likes: -1 })
      .limit(parseInt(limit))
      .populate('artist', 'name');

    res.json({
      success: true,
      data: songs
    });

  } catch (error) {
    console.error('Get top liked error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET /api/songs/new/releases
// @desc    Lấy danh sách phát hành mới
// @access  Public
router.get('/new/releases', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const songs = await Song.getNewReleases(parseInt(limit));

    res.json({
      success: true,
      data: songs
    });

  } catch (error) {
    console.error('Get new releases error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET /api/songs/genre/:genre
// @desc    Lấy bài hát theo thể loại
// @access  Public
router.get('/genre/:genre', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const songs = await Song.searchByGenre(
      req.params.genre,
      parseInt(limit)
    );

    res.json({
      success: true,
      data: songs
    });

  } catch (error) {
    console.error('Get songs by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

module.exports = router; 