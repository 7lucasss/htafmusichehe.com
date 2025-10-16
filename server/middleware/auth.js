const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  // Lấy token từ header
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: 'Không có token, xác thực thất bại' });
  }
  
  try {
    // Xác thực token với JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token không hợp lệ' });
  }
};

module.exports = auth; 