const cloudinary = require('cloudinary').v2;

// Log config khi khởi tạo
console.log('Initializing Cloudinary with:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? '***' + process.env.CLOUDINARY_API_KEY.slice(-4) : 'missing',
  configured: Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET)
});

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Test connection khi khởi động
cloudinary.api.ping()
  .then(() => {
    console.log('✅ Cloudinary connection successful');
  })
  .catch(error => {
    console.error('❌ Cloudinary connection failed:', error.message);
  });

// Cấu hình tối ưu cho audio
const AUDIO_CONFIG = {
  resource_type: "video",
  folder: "htaf-music/audio",
  allowed_formats: ["mp3", "wav", "flac"],
  max_file_size: 100000000, // 100MB
  chunk_size: 20000000, // 20MB chunks
  eager_async: true,
  eager: {
    streaming_profile: "hd"
  }
};

// Cấu hình tối ưu cho ảnh cover
const IMAGE_CONFIG = {
  folder: "htaf-music/images",
  allowed_formats: [
    "jpg", "jpeg", "png", 
    "gif", "webp", "bmp", 
    "tiff", "svg"
  ],
  transformation: [
    {width: 2000, height: 2000, crop: "limit"},
    {quality: "auto:best"},
    {fetch_format: "auto"}
  ]
};

module.exports = {
  cloudinary,
  AUDIO_CONFIG,
  IMAGE_CONFIG
}; 