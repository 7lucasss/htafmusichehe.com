const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');
const uploadsRoutes = require('./routes/uploads');
const path = require('path');
const artistsRoutes = require('./routes/artists');
const { cloudinary } = require('./config/cloudinary');
const playlistRoutes = require('./routes/playlists');
const adminRoutes = require('./routes/admin'); // Import admin routes

// Load env config
dotenv.config();

// Khởi tạo Express app
const app = express();

// Đặt middleware express.json() trước các routes
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Cấu hình CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Middleware debug
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  console.log('Request body:', req.body);
  next();
});

// Connect to database
connectDB();

// Middleware
app.use(cookieParser());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/songs', require('./routes/songs'));
app.use('/api/rankings', require('./routes/rankings'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/admin', require('./routes/admin')); // Use admin routes directly
app.use('/api/uploads', uploadsRoutes);
app.use('/api/jobs', require('./routes/jobs'));
app.use('/api/streams', require('./routes/streams'));
app.use('/api/artists', artistsRoutes);
app.use('/api/genres', require('./routes/genres'));
app.use('/api/playlists', require('./routes/playlists'));
app.use('/api/audio', require('./routes/audio'));

// Sử dụng route playlist
app.use('/api/admin/playlists', playlistRoutes);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Thêm route test upload
app.post('/api/uploads/test', (req, res) => {
  res.json({ message: 'Upload endpoint working' });
});

// Thêm route test Cloudinary
app.get('/api/cloudinary/test', async (req, res) => {
  try {
    // Test kết nối bằng cách lấy account info
    const result = await cloudinary.api.ping();
    console.log('Cloudinary connection test:', {
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY?.slice(-4), // Chỉ hiện 4 số cuối
      connected: true,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      message: 'Cloudinary connection successful',
      details: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME,
        connected: true
      }
    });
  } catch (error) {
    console.error('Cloudinary connection error:', error);
    res.status(500).json({
      success: false,
      message: 'Cloudinary connection failed',
      error: error.message
    });
  }
});

// Basic route for testing
app.get('/', (req, res) => {
  res.json({ message: 'HTaf Music Store API' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    message: 'Lỗi máy chủ',
    error: err.message
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); 