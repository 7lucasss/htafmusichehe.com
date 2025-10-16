const express = require('express');
const router = express.Router();

// Basic test route for albums
router.get('/', (req, res) => {
  res.send('Albums API route is working');
});

module.exports = router; 