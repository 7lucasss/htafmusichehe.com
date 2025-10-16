const express = require('express');
const router = express.Router();

// GET /api/rankings - Lấy bảng xếp hạng
router.get('/', (req, res) => {
  const category = req.query.category || 'popular';
  
  res.status(200).json({
    category,
    rankings: [
      {
        position: 1,
        song: {
          id: '1',
          title: 'Top Song 1',
          artist: 'Popular Artist 1',
          imageUrl: 'https://example.com/image1.jpg'
        },
        previousPosition: 2,
        weeksOnChart: 3
      },
      {
        position: 2,
        song: {
          id: '2',
          title: 'Top Song 2',
          artist: 'Popular Artist 2',
          imageUrl: 'https://example.com/image2.jpg'
        },
        previousPosition: 1,
        weeksOnChart: 5
      }
    ]
  });
});

module.exports = router; 