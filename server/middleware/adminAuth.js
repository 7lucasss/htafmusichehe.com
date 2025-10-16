module.exports = function(req, res, next) {
  // Kiểm tra xem user có role admin không
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ message: 'Không có quyền truy cập. Yêu cầu quyền admin.' });
  }
}; 