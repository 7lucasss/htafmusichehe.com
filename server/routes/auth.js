const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');

// POST /api/auth/register - Đăng ký tài khoản
router.post('/register', (req, res) => {
  // Sẽ triển khai chi tiết sau
  res.status(201).json({ message: 'Đăng ký thành công!' });
});

// POST /api/auth/login - Đăng nhập
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login request với:', { email, password: '***' });
    
    // Tìm người dùng bằng email
    let user = await User.findOne({ email }).select('+password');
    if (!user) {
      console.log('User không tồn tại:', email);
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // In thông tin user để debug
    console.log('User tìm thấy:', {
      id: user._id,
      email: user.email,
      role: user.role,
      passwordLength: user.password?.length
    });
    
    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log('Mật khẩu không khớp');
      return res.status(400).json({ message: 'Email hoặc mật khẩu không đúng' });
    }
    
    // Tạo JWT token
    const payload = {
      user: {
        id: user.id,
        role: user.role
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '1d' },
      (err, token) => {
        if (err) throw err;
        
        // Đảm bảo response có đầy đủ thông tin user và role
        console.log('Đăng nhập thành công, trả về token và thông tin user');
        res.json({
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role, // Đảm bảo role được trả về
            avatar: user.avatar // Thêm trường avatar
          }
        });
      }
    );
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// POST /api/auth/logout - Đăng xuất
router.post('/logout', (req, res) => {
  res.status(200).json({ message: 'Đăng xuất thành công!' });
});

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    // Thêm trường 'avatar' vào select để luôn trả về avatar của người dùng
    const user = await User.findById(req.user.id).select('name email role status canPostJobs userType avatar'); // Explicitly include all needed fields including avatar
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/auth/validate-token
// @desc    Validate token
// @access  Private
router.get('/validate-token', auth, (req, res) => {
  res.json({ valid: true });
});

// Thêm route riêng cho việc tạo admin
router.post('/create-admin', async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    
    // Kiểm tra mã xác thực admin
    if (adminCode !== process.env.ADMIN_SECRET_CODE) {
      return res.status(403).json({ message: 'Mã xác thực không hợp lệ' });
    }
    
    // Kiểm tra email đã tồn tại chưa
    let user = await User.findOne({ email });
    if (user) {
      // Nếu user đã tồn tại, có thể cập nhật role thành admin
      if (user.role !== 'admin') {
        user.role = 'admin';
        await user.save();
        return res.status(200).json({ message: 'Cập nhật quyền admin thành công' });
      }
      return res.status(400).json({ message: 'Email đã tồn tại và đã là admin' });
    }
    
    // Mã hóa mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Tạo tài khoản admin mới
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role: 'admin'  // Đảm bảo role được gán là 'admin'
    });
    
    await newUser.save();
    console.log('Admin được tạo thành công:', { email, role: 'admin' });
    
    res.status(201).json({ message: 'Tạo tài khoản admin thành công' });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router; 