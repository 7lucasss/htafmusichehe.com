const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const User = require('../models/User');
const Song = require('../models/Song');
const Playlist = require('../models/Playlist');
const Artist = require('../models/Artist');
const Genre = require('../models/Genre'); // Added Genre import
const uploadService = require('../services/uploadService');

// @route   GET api/admin/dashboard
// @desc    Admin dashboard stats
// @access  Private/Admin
router.get('/dashboard', [auth, adminAuth], async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalSongs = await Song.countDocuments();
    
    // Thống kê người dùng mới trong 7 ngày qua
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const newUsers = await User.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });
    
    res.json({
      totalUsers,
      totalSongs,
      newUsers,
      // Thêm các thống kê khác nếu cần
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/admin/users
// @desc    Get all users
// @access  Private/Admin
router.get('/users', [auth, adminAuth], async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    console.error('Get users error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/admin/users/:id
// @desc    Get user by ID
// @access  Private/Admin
router.get('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get user error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/admin/users/:id
// @desc    Update user (role, status)
// @access  Private/Admin
router.put('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, email, role, status } = req.body;
    
    // Kiểm tra email đã tồn tại khi thay đổi email
    if (email) {
      const existingUser = await User.findOne({ email, _id: { $ne: req.params.id } });
      if (existingUser) {
        return res.status(400).json({ message: 'Email đã được sử dụng' });
      }
    }
    
    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (status !== undefined) updateData.status = status;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (err) {
    console.error('Update user error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/admin/users/:id
// @desc    Delete user
// @access  Private/Admin
router.delete('/users/:id', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Không cho phép xóa tài khoản admin sử dụng API này
    if (user.role === 'admin') {
      return res.status(403).json({ message: 'Không thể xóa tài khoản admin' });
    }
    
    await user.remove();
    
    res.json({ message: 'Đã xóa người dùng thành công' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// Các route quản lý nhạc
router.get('/songs', [auth, adminAuth], async (req, res) => {
  try {
    console.log('Admin accessing songs list...');
    
    // Lấy danh sách bài hát từ database với thông tin đầy đủ
    const songs = await Song.find()
      .populate('artist', 'name bio imageUrl')
      .sort({ createdAt: -1 }); // Sắp xếp theo ngày tạo mới nhất
    
    console.log(`Found ${songs.length} songs`);
    
    res.json({
      success: true,
      data: songs,
      message: songs.length > 0 ? 'Lấy danh sách bài hát thành công' : 'Danh sách bài hát trống'
    });
  } catch (error) {
    console.error('Error in /admin/songs:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// Thêm các route khác: thêm/sửa/xóa bài hát, quản lý đơn hàng, v.v...

// Thêm routes quản lý bài hát
router.post('/songs', [auth, adminAuth], async (req, res) => {
  try {
    const { title, artist, genre, price, audioUrl, imageUrl, lyrics, duration, isActive, audioInfo, tags } = req.body;
    
    // Validate dữ liệu
    if (!title || !audioUrl || !duration) {
      return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin cần thiết: Tiêu đề, File nhạc, Thời lượng' });
    }
    
    // Kiểm tra và xác thực Artist ID
    let songArtist = null;
    if (artist && mongoose.Types.ObjectId.isValid(artist)) {
        const artistExists = await Artist.findById(artist);
        if (artistExists) {
            songArtist = artist;
        } else {
            return res.status(404).json({ message: 'Nghệ sĩ không tồn tại' });
        }
    } else {
        return res.status(400).json({ message: 'ID nghệ sĩ không hợp lệ hoặc bị thiếu' });
    }

    // Kiểm tra và xác thực Genre ID
    let songGenreId = null;
    if (genre) {
        // Tìm kiếm genre theo tên thay vì ID
        const genreExists = await Genre.findOne({ name: genre });
        if (genreExists) {
            songGenreId = genreExists._id;
        } else {
            return res.status(404).json({ message: 'Thể loại không tồn tại' });
        }
    } else {
        return res.status(400).json({ message: 'Tên thể loại không hợp lệ hoặc bị thiếu' });
    }

    const newSong = new Song({
      title,
      artist: songArtist, // Use the validated songArtist
      genre: songGenreId, // Use the validated genre ID
      price: {
        mp3: price?.mp3 || 0.99,
        flac: price?.flac || 1.99,
        wav: price?.wav || 2.99
      },
      audioUrl,
      imageUrl: imageUrl || 'https://via.placeholder.com/300',
      lyrics,
      duration,
      isActive: isActive !== undefined ? isActive : true,
      audioInfo: audioInfo || {},
      tags: tags || [],
      createdBy: req.user.id
    });
    
    await newSong.save();
    
    res.status(201).json({
      message: 'Thêm bài hát thành công',
      song: newSong
    });
  } catch (err) {
    console.error('Create song error:', err);
    // Cung cấp thông báo lỗi chi tiết hơn
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({ success: false, message: errors.join(', ') });
    }
    res.status(500).json({ success: false, message: 'Lỗi máy chủ', error: err.message });
  }
});

// @route   GET api/admin/songs/:id
// @desc    Get song by ID
// @access  Private/Admin
router.get('/songs/:id', [auth, adminAuth], async (req, res) => {
  try {
    const song = await Song.findById(req.params.id).populate('artist');
    if (!song) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }
    res.json(song);
  } catch (err) {
    console.error('Get song error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/admin/songs/:id
// @desc    Update song
// @access  Private/Admin
router.put('/songs/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { title, artist, genre, price, audioUrl, imageUrl, lyrics, duration, isActive } = req.body;
    
    const updateData = {};
    if (title) updateData.title = title;
    if (artist) updateData.artist = artist;
    if (genre) updateData.genre = genre;
    if (price !== undefined) updateData.price = price;
    if (audioUrl) updateData.audioUrl = audioUrl;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (lyrics) updateData.lyrics = lyrics;
    if (duration) updateData.duration = duration;
    if (isActive !== undefined) updateData.isActive = isActive;
    
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    ).populate('artist');
    
    if (!song) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }
    
    res.json(song);
  } catch (err) {
    console.error('Update song error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/admin/songs/:id
// @desc    Delete song
// @access  Private/Admin
router.delete('/songs/:id', [auth, adminAuth], async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    
    if (!song) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }

    // Delete audio file from Cloudinary
    if (song.audioUrl) {
      try {
        const audioPublicId = uploadService.getPublicIdFromUrl(song.audioUrl);
        await uploadService.deleteFile(audioPublicId, 'video');
      } catch (error) {
        console.error('Error deleting audio from Cloudinary:', error);
        // Continue with deletion even if Cloudinary delete fails
      }
    }

    // Delete cover image from Cloudinary
    if (song.imageUrl) {
      try {
        const imagePublicId = uploadService.getPublicIdFromUrl(song.imageUrl);
        await uploadService.deleteFile(imagePublicId, 'image');
      } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        // Continue with deletion even if Cloudinary delete fails
      }
    }
    
    await song.remove();
    
    res.json({ 
      success: true,
      message: 'Đã xóa bài hát và các file liên quan thành công' 
    });
  } catch (err) {
    console.error('Delete song error:', err);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi máy chủ',
      error: err.message 
    });
  }
});

// API để cấp/thu hồi quyền đăng tin tuyển dụng
router.put('/users/:id/job-permission', auth, adminAuth, async (req, res) => {
  try {
    const { canPostJobs } = req.body;
    
    if (typeof canPostJobs !== 'boolean') {
      return res.status(400).json({ message: 'Cần cung cấp giá trị boolean cho canPostJobs' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { canPostJobs },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        canPostJobs: user.canPostJobs
      },
      message: `${canPostJobs ? 'Cấp' : 'Thu hồi'} quyền đăng tin tuyển dụng thành công`
    });
  } catch (err) {
    console.error('Error updating job permission:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// API để cấp/thu hồi quyền đăng tải nhạc
router.put('/users/:id/music-upload-permission', auth, adminAuth, async (req, res) => {
  try {
    const { canUploadMusic } = req.body;
    
    if (typeof canUploadMusic !== 'boolean') {
      return res.status(400).json({ message: 'Cần cung cấp giá trị boolean cho canUploadMusic' });
    }
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { canUploadMusic },
      { new: true }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json({ 
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        canUploadMusic: user.canUploadMusic
      },
      message: `${canUploadMusic ? 'Cấp' : 'Thu hồi'} quyền đăng tải nhạc thành công`
    });
  } catch (err) {
    console.error('Error updating music upload permission:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// ===== ADMIN ARTISTS MANAGEMENT =====
// @route   GET api/admin/artists
// @desc    Get all artists for admin
// @access  Private/Admin
router.get('/artists', [auth, adminAuth], async (req, res) => {
  try {
    const artists = await Artist.find().sort({ createdAt: -1 });
    
    // Đếm số bài hát cho từng nghệ sĩ
    const artistsWithCounts = await Promise.all(
      artists.map(async (artist) => {
        const songCount = await Song.countDocuments({ artist: artist._id });
        return {
          ...artist.toObject(),
          songCount
        };
      })
    );
    
    res.json({
      success: true,
      data: artistsWithCounts,
      message: 'Lấy danh sách nghệ sĩ thành công'
    });
  } catch (error) {
    console.error('Error fetching artists:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET api/admin/artists/:id
// @desc    Get artist by ID
// @access  Private/Admin
router.get('/artists/:id', [auth, adminAuth], async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nghệ sĩ'
      });
    }
    
    const songCount = await Song.countDocuments({ artist: artist._id });
    
    res.json({
      success: true,
      data: {
        ...artist.toObject(),
        songCount
      }
    });
  } catch (error) {
    console.error('Error fetching artist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST api/admin/artists
// @desc    Create new artist
// @access  Private/Admin
router.post('/artists', [auth, adminAuth], async (req, res) => {
  try {
    const { name, bio, imageUrl } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên nghệ sĩ là bắt buộc'
      });
    }

    // Kiểm tra nghệ sĩ đã tồn tại
    const existingArtist = await Artist.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });
    
    if (existingArtist) {
      return res.status(400).json({
        success: false,
        message: 'Nghệ sĩ này đã tồn tại'
      });
    }

    const newArtist = new Artist({
      name,
      bio: bio || '',
      imageUrl: imageUrl || 'https://via.placeholder.com/300',
      createdBy: req.user.id
    });

    await newArtist.save();

    res.status(201).json({
      success: true,
      data: newArtist,
      message: 'Tạo nghệ sĩ thành công'
    });

  } catch (error) {
    console.error('Error creating artist:', error);
    res.status(500).json({
      success: false, 
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   PUT api/admin/artists/:id
// @desc    Update artist
// @access  Private/Admin
router.put('/artists/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, bio, imageUrl } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (bio !== undefined) updateData.bio = bio;
    if (imageUrl) updateData.imageUrl = imageUrl;
    updateData.updatedBy = req.user.id;

    const artist = await Artist.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nghệ sĩ'
      });
    }

    res.json({
      success: true,
      data: artist,
      message: 'Cập nhật nghệ sĩ thành công'
    });
  } catch (error) {
    console.error('Error updating artist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   DELETE api/admin/artists/:id
// @desc    Delete artist
// @access  Private/Admin
router.delete('/artists/:id', [auth, adminAuth], async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    
    if (!artist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nghệ sĩ'
      });
    }

    // Kiểm tra xem nghệ sĩ có bài hát nào không
    const songCount = await Song.countDocuments({ artist: artist._id });
    if (songCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa nghệ sĩ này vì đang có ${songCount} bài hát`
      });
    }

    await artist.remove();

    res.json({
      success: true,
      message: 'Xóa nghệ sĩ thành công'
    });
  } catch (error) {
    console.error('Error deleting artist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// ===== ADMIN GENRES MANAGEMENT =====
// @route   GET api/admin/genres
// @desc    Get all genres for admin
// @access  Private/Admin
router.get('/genres', [auth, adminAuth], async (req, res) => {
  try {
    const genres = await Genre.find().sort({ sortOrder: 1, createdAt: -1 });
    
    res.json({
      success: true,
      data: genres,
      message: 'Lấy danh sách thể loại thành công'
    });
  } catch (error) {
    console.error('Error fetching genres:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET api/admin/genres/:id
// @desc    Get genre by ID
// @access  Private/Admin
router.get('/genres/:id', [auth, adminAuth], async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }
    
    res.json({
      success: true,
      data: genre
    });
  } catch (error) {
    console.error('Error fetching genre:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST api/admin/genres
// @desc    Create new genre
// @access  Private/Admin
router.post('/genres', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, color, imageUrl, sortOrder } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên thể loại là bắt buộc'
      });
    }

    // Check if genre already exists
    const existingGenre = await Genre.findOne({ name: { $regex: new RegExp(name, 'i') } });
    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: 'Thể loại này đã tồn tại'
      });
    }

    const newGenre = new Genre({
      name,
      description,
      color: color || '#6366f1',
      imageUrl,
      sortOrder: sortOrder || 0,
      createdBy: req.user.id
    });

    await newGenre.save();

    res.status(201).json({
      success: true,
      data: newGenre,
      message: 'Tạo thể loại thành công'
    });

  } catch (error) {
    console.error('Error creating genre:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   PUT api/admin/genres/:id
// @desc    Update genre
// @access  Private/Admin
router.put('/genres/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, color, imageUrl, sortOrder, isActive } = req.body;
    
    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (color) updateData.color = color;
    if (imageUrl) updateData.imageUrl = imageUrl;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (isActive !== undefined) updateData.isActive = isActive;
    updateData.updatedBy = req.user.id;

    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    res.json({
      success: true,
      data: genre,
      message: 'Cập nhật thể loại thành công'
    });
  } catch (error) {
    console.error('Error updating genre:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   DELETE api/admin/genres/:id
// @desc    Delete genre
// @access  Private/Admin
router.delete('/genres/:id', [auth, adminAuth], async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thể loại'
      });
    }

    // Check if genre is being used by songs
    const songsUsingGenre = await Song.countDocuments({ genre: genre.name });
    
    if (songsUsingGenre > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa thể loại này vì đang có ${songsUsingGenre} bài hát sử dụng`
      });
    }

    await genre.remove();

    res.json({
      success: true,
      message: 'Xóa thể loại thành công'
    });
  } catch (error) {
    console.error('Error deleting genre:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// ===== ADMIN PLAYLISTS MANAGEMENT =====
// @route   GET api/admin/playlists
// @desc    Get all playlists for admin
// @access  Private/Admin
router.get('/playlists', [auth, adminAuth], async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate('createdBy', 'name')
      .populate('songs')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: playlists,
      message: 'Lấy danh sách playlist thành công'
    });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   GET api/admin/playlists/:id
// @desc    Get playlist by ID
// @access  Private/Admin
router.get('/playlists/:id', [auth, adminAuth], async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('songs');
    
    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }
    
    res.json({
      success: true,
      data: playlist
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   POST api/admin/playlists
// @desc    Create new playlist
// @access  Private/Admin
router.post('/playlists', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, coverImage, isPublic, songs } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Tên playlist là bắt buộc'
      });
    }

    const newPlaylist = new Playlist({
      name,
      description: description || '',
      coverImage: coverImage || 'https://via.placeholder.com/300',
      isPublic: isPublic !== undefined ? isPublic : true,
      songs: songs || [],
      createdBy: req.user.id
    });

    await newPlaylist.save();
    await newPlaylist.populate('createdBy', 'name');
    await newPlaylist.populate('songs');

    res.status(201).json({
      success: true,
      data: newPlaylist,
      message: 'Tạo playlist thành công'
    });

  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   PUT api/admin/playlists/:id
// @desc    Update playlist
// @access  Private/Admin
router.put('/playlists/:id', [auth, adminAuth], async (req, res) => {
  try {
    const { name, description, coverImage, isPublic, songs } = req.body;

    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }

    // Update fields
    if (name) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (coverImage) playlist.coverImage = coverImage;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (songs) playlist.songs = songs;

    playlist.updatedBy = req.user.id;

    await playlist.save();
    await playlist.populate('createdBy', 'name');
    await playlist.populate('songs');

    res.json({
      success: true,
      message: 'Cập nhật playlist thành công',
      data: playlist
    });

  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

// @route   DELETE api/admin/playlists/:id
// @desc    Delete playlist
// @access  Private/Admin
router.delete('/playlists/:id', [auth, adminAuth], async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy playlist'
      });
    }

    await playlist.remove();

    res.json({
      success: true,
      message: 'Xóa playlist thành công'
    });

  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
});

module.exports = router; 