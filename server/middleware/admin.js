const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    // Lấy thông tin người dùng từ middleware auth
    const user = await User.findById(req.user.id);
    
    // Kiểm tra nếu không phải admin
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Truy cập bị từ chối. Yêu cầu quyền Admin.' });
    }
    
    next();
  } catch (err) {
    console.error('Admin middleware error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
}; 