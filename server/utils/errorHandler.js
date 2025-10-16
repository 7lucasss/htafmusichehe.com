const errorHandler = (error, req, res) => {
  console.error('Error details:', error);

  // Xử lý lỗi multer
  if (error.name === 'MulterError') {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          success: false,
          message: 'File size too large',
          error: 'Maximum file size is 5MB'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          success: false,
          message: 'Too many files',
          error: 'Maximum 4 images allowed'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'File upload error',
          error: error.message
        });
    }
  }

  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type',
      error: error.message
    });
  }

  // Default error response
  res.status(500).json({
    success: false,
    message: 'Server error during upload',
    error: error.message
  });
};

module.exports = errorHandler; 