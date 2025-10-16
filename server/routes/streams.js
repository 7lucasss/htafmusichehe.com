const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Stream = require('../models/Stream');
const crypto = require('crypto');

// Tạo một stream mới
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, scheduledTime, category, isPublic, tags } = req.body;
    
    // Tạo stream key an toàn
    const streamKey = crypto.randomBytes(16).toString('hex');
    
    const newStream = new Stream({
      title,
      description,
      streamer: req.user.id,
      streamKey,
      startTime: scheduledTime || new Date(),
      category,
      isPublic,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      status: 'scheduled'
    });
    
    await newStream.save();
    
    res.status(201).json({
      stream: newStream,
      streamUrl: `rtmp://your-server-url/live/${streamKey}`
    });
  } catch (error) {
    console.error('Stream creation error:', error);
    res.status(500).json({ message: 'Lỗi server', error: error.message });
  }
});

// Lấy tất cả streams đang live
router.get('/live', async (req, res) => {
  try {
    const liveStreams = await Stream.find({ status: 'live' })
      .populate('streamer', 'name avatar')
      .sort('-viewCount');
      
    res.json(liveStreams);
  } catch (error) {
    console.error('Error fetching live streams:', error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

module.exports = router; 