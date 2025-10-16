const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary, AUDIO_CONFIG, IMAGE_CONFIG } = require('../config/cloudinary');
const User = require('../models/User'); // Import User model

// Tăng giới hạn kích thước file
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

// Cấu hình multer với memory storage để xử lý stream
const storage = multer.memoryStorage();

// Middleware để kiểm tra quyền tải nhạc
const checkMusicUploadPermission = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ message: 'Không có quyền truy cập, vui lòng đăng nhập' });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    if (user.role === 'admin' || user.canUploadMusic) {
      next();
    } else {
      return res.status(403).json({ message: 'Bạn không có quyền tải nhạc lên. Vui lòng liên hệ admin.' });
    }
  } catch (err) {
    console.error('Music upload permission middleware error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

// Cấu hình filter cho audio files
const audioFilter = (req, file, cb) => {
  console.log('File upload info:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedMimeTypes = [
    'audio/mpeg',        // MP3
    'audio/mp3',         // MP3 alternative
    'audio/wav',         // WAV
    'audio/x-wav',       // WAV alternative
    'audio/flac',        // FLAC
    'audio/x-flac',      // FLAC alternative
    'audio/ogg'          // OGG
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('Rejected file type:', file.mimetype);
    cb(new Error(`Invalid file type. Allowed types: MP3, WAV, FLAC`));
  }
};

// Khởi tạo middleware với cấu hình nâng cao
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: audioFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 1
  }
}).single('audioFile');

// Wrap multer middleware để xử lý lỗi tốt hơn
const uploadMiddleware = (req, res, next) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large',
          error: 'Maximum file size is 100MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Upload failed',
        error: err.message
      });
    }
    next();
  });
};

// Cấu hình filter cho image files
const imageFilter = (req, file, cb) => {
  // Log để debug
  console.log('Image upload info:', {
    originalname: file.originalname,
    mimetype: file.mimetype,
    size: file.size
  });

  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/bmp',
    'image/tiff',
    'image/svg+xml'
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('Rejected image type:', file.mimetype);
    cb(new Error(`Invalid image type. Allowed types: JPG, PNG, GIF, WEBP, BMP, TIFF, SVG`));
  }
};

// Cấu hình multer cho images
const imageUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: imageFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 1
  }
}).single('imageFile');

// Wrap middleware xử lý lỗi cho images
const imageMiddleware = (req, res, next) => {
  imageUpload(req, res, (err) => {
    if (err) {
      console.error('Image upload error:', err);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large',
          error: 'Maximum file size is 10MB'
        });
      }
      return res.status(400).json({
        success: false,
        message: 'Upload failed',
        error: err.message
      });
    }
    next();
  });
};

// Export cả hai middleware
module.exports = {
  uploadAudio: uploadMiddleware,
  uploadImage: imageMiddleware,
  checkMusicUploadPermission, // Export the new permission middleware
}; 