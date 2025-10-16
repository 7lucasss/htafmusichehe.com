const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');
const Song = require('../models/Song');

// @route   POST api/payments/checkout
// @desc    Process checkout
// @access  Private
router.post('/checkout', auth, async (req, res) => {
  const { paymentMethod } = req.body;
  
  try {
    // Get user with cart items
    const user = await User.findById(req.user.id)
      .populate('cart.songId');
      
    if (!user) {
      return res.status(404).json({ message: 'Không tìm thấy người dùng' });
    }
    
    if (user.cart.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng trống' });
    }
    
    // Calculate total
    let total = 0;
    const purchaseItems = [];
    
    for (const item of user.cart) {
      const song = item.songId;
      const price = song.discountPrice || song.price;
      total += price;
      
      // Add to purchases
      purchaseItems.push({
        songId: song._id,
        format: item.format,
        price: price
      });
    }
    
    // Here you would integrate with a payment processor like Stripe
    // For demo purposes, we're assuming payment is successful
    
    // Add items to purchase history
    user.purchases = [...user.purchases, ...purchaseItems];
    
    // Clear cart
    user.cart = [];
    
    await user.save();
    
    res.json({
      success: true,
      message: 'Thanh toán thành công',
      orderId: 'ORDER' + Date.now().toString().slice(-8),
      amount: total
    });
    
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
});

// GET /api/payments/history - Lấy lịch sử thanh toán
router.get('/history', (req, res) => {
  res.status(200).json({
    payments: []
  });
});

module.exports = router; 