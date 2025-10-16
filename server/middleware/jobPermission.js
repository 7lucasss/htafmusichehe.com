const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // Kiểm tra xem user đã đăng nhập chưa
    if (!req.user) {
      return res.status(401).json({ message: 'Không có quyền truy cập, vui lòng đăng nhập' });
    }
    
    // Kiểm tra xem người dùng có quyền đăng tin không
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Admin luôn có quyền đăng tin
    if (user.role === 'admin') {
      return next();
    }
    
    // Kiểm tra quyền đăng tin tuyển dụng
    if (!user.canPostJobs) {
      return res.status(403).json({ 
        message: 'Bạn không có quyền đăng tin tuyển dụng. Vui lòng liên hệ admin để được cấp quyền.'
      });
    }
    
    next();
  } catch (err) {
    console.error('Job permission error:', err);
    res.status(500).json({ message: 'Lỗi server' });
  }
}; 