const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');
const Artist = require('../models/Artist');
const Song = require('../models/Song');

// @route   GET api/artists
// @desc    Get all artists
// @access  Public (for general use) / Private/Admin (for admin management)
router.get('/', async (req, res) => {
  try {
    const artists = await Artist.find();
    
    // If admin request, include song counts
    if (req.headers.authorization) {
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
        data: artistsWithCounts
      });
    } else {
      res.json({
        success: true,
        data: artists
      });
    }
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Lỗi server',
      error: error.message 
    });
  }
});

// @route   GET api/artists/:id
// @desc    Get artist by ID
// @access  Public
router.get('/:id', async (req, res) => {
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

// @route   POST api/artists
// @desc    Create new artist
// @access  Private/Admin
router.post('/', [auth, adminAuth], async (req, res) => {
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

// @route   PUT api/artists/:id
// @desc    Update artist
// @access  Private/Admin
router.put('/:id', [auth, adminAuth], async (req, res) => {
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

// @route   DELETE api/artists/:id
// @desc    Delete artist
// @access  Private/Admin
router.delete('/:id', [auth, adminAuth], async (req, res) => {
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

module.exports = router; 