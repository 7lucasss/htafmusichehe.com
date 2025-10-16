const express = require('express');
const router = express.Router();
const { uploadAudio, uploadImage, checkMusicUploadPermission } = require('../middleware/upload'); // Import checkMusicUploadPermission
const uploadService = require('../services/uploadService');
const errorHandler = require('../utils/errorHandler');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// Upload file âm thanh
router.post('/audio', auth, checkMusicUploadPermission, uploadAudio, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    // Log chi tiết hơn
    console.log('Processing upload:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`,
      buffer: req.file.buffer ? 'Present' : 'Missing'
    });

    const uploadResult = await uploadService.uploadAudio(req.file);
    
    console.log('Upload successful:', uploadResult);

    res.json({
      success: true,
      data: uploadResult
    });

  } catch (error) {
    console.error('Upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message || 'Unknown error'
    });
  }
});

// Upload file ảnh
router.post('/image', auth, uploadImage, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Log thông tin file
    console.log('Processing image upload:', {
      filename: req.file.originalname,
      mimetype: req.file.mimetype,
      size: `${(req.file.size / 1024 / 1024).toFixed(2)}MB`
    });

    const uploadResult = await uploadService.uploadImage(req.file);
    
    console.log('Image upload successful:', {
      url: uploadResult.url,
      format: uploadResult.format,
      dimensions: `${uploadResult.width}x${uploadResult.height}`
    });

    res.json({
      success: true,
      data: uploadResult
    });

  } catch (error) {
    console.error('Image upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: error.message
    });
  }
});

module.exports = router; 