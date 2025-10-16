const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const auth = require('../middleware/auth');
const User = require('../models/User');
const Song = require('../models/Song');

// @route   POST api/users/register
// @desc    Register user
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, role, userType } = req.body;
  
  try {
    // Kiểm tra người dùng đã tồn tại chưa
    let user = await User.findOne({ email });
    
    if (user) {
      return res.status(400).json({ message: 'Email đã tồn tại' });
    }
    
    // Tạo người dùng mới
    user = new User({
      name,
      email,
      password,
      role: role || 'user',
      userType: userType || 'user'
    });
    
    // Nếu userType là 'recruiter', cấp quyền đăng tin tuyển dụng
    if (userType === 'recruiter') {
      user.canPostJobs = true;
    }
    
    await user.save();
    
    // Tạo JWT token
    const payload = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        userType: user.userType
      }
    };
    
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '24h' },
      (err, token) => {
        if (err) throw err;
        res.json({
          token,
          user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar, // Đảm bảo avatar được trả về sau khi đăng ký
            userType: user.userType
          }
        });
      }
    );
  } catch (err) {
    console.error('Lỗi đăng ký:', err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('name email role avatar -password') // Thêm 'avatar' và loại bỏ '-password' nếu cần (đã xử lý ở model)
      .populate({
        path: 'favorites',
        select: 'title imageUrl artist',
        populate: {
          path: 'artist',
          select: 'name'
        }
      });
      
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   PUT api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, async (req, res) => {
  const { name, avatar } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    console.log('PUT /profile: Received data - Name:', name, ', Avatar:', avatar); // Log received data

    // Update fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    
    console.log('PUT /profile: User avatar before save:', user.avatar); // Log before save

    await user.save();
    
    console.log('PUT /profile: User avatar after save:', user.avatar); // Log after save

    // Convert Mongoose document to a plain JavaScript object and remove password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.json(userResponse); // Send the modified user object
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/purchases
// @desc    Get user purchase history
// @access  Private
router.get('/purchases', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('purchases')
      .populate({
        path: 'purchases.song',
        select: 'title imageUrl artist',
        populate: {
          path: 'artist',
          select: 'name'
        }
      });
      
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user.purchases);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/favorites
// @desc    Get user favorites
// @access  Private
router.get('/favorites', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select('favorites')
      .populate('favorites', 'title artist coverUrl');
      
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user.favorites);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/users/favorites/toggle
// @desc    Toggle a song in favorites
// @access  Private
router.post('/favorites/toggle', auth, async (req, res) => {
  const { songId } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }
    
    // Check if song is already in favorites
    const favIndex = user.favorites.findIndex(id => id.toString() === songId);
    
    if (favIndex !== -1) {
      // Remove from favorites
      user.favorites.splice(favIndex, 1);
      await user.save();
      return res.json({ message: 'Đã xóa khỏi danh sách yêu thích', inFavorites: false });
    } else {
      // Add to favorites
      user.favorites.push(songId);
      await user.save();
      return res.json({ message: 'Đã thêm vào danh sách yêu thích', inFavorites: true });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   POST api/users/cart
// @desc    Add song to cart
// @access  Private
router.post('/cart', auth, async (req, res) => {
  const { songId, format } = req.body;
  
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Check if song exists
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Không tìm thấy bài hát' });
    }
    
    // Check if song is already in cart
    const inCart = user.cart.find(item => 
      item.songId.toString() === songId && item.format === format
    );
    
    if (inCart) {
      return res.status(400).json({ message: 'Bài hát đã có trong giỏ hàng' });
    }
    
    // Add to cart
    user.cart.push({ songId, format });
    await user.save();
    
    res.json({ message: 'Đã thêm vào giỏ hàng' });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   GET api/users/cart
// @desc    Get user cart
// @access  Private
router.get('/cart', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate({
        path: 'cart.songId',
        select: 'title artist coverUrl price'
      });
      
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    res.json(user.cart);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// @route   DELETE api/users/cart/:itemId
// @desc    Remove item from cart
// @access  Private
router.delete('/cart/:itemId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    // Find item in cart
    if (!user.cart.id(req.params.itemId)) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm trong giỏ hàng' });
    }
    
    // Remove item
    user.cart.id(req.params.itemId).remove();
    await user.save();
    
    res.json({ message: 'Đã xóa sản phẩm khỏi giỏ hàng' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

module.exports = router; 