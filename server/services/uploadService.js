const { cloudinary, AUDIO_CONFIG, IMAGE_CONFIG } = require('../config/cloudinary');

class UploadService {
  async uploadAudio(file) {
    try {
      this.validateAudioFile(file);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            ...AUDIO_CONFIG,
            public_id: `audio-${Date.now()}`,
            resource_type: "video",
            chunk_size: AUDIO_CONFIG.chunk_size
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                duration: result.duration,
                format: result.format,
                bytes: result.bytes,
                public_id: result.public_id
              });
            }
          }
        );

        uploadStream.end(file.buffer);
      });

    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  validateAudioFile(file) {
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/flac'];
    const maxSize = AUDIO_CONFIG.max_file_size;

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid audio format. Allowed: MP3, WAV, FLAC');
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / 1024 / 1024}MB`);
    }
  }

  async uploadImage(file) {
    try {
      this.validateImageFile(file);

      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            ...IMAGE_CONFIG,
            public_id: `image-${Date.now()}`,
            resource_type: "image",
            transformation: [
              { quality: "auto:best" },
              { fetch_format: "auto" }
            ]
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve({
                url: result.secure_url,
                public_id: result.public_id,
                width: result.width,
                height: result.height,
                format: result.format
              });
            }
          }
        );

        // Upload buffer
        const buffer = file.buffer;
        uploadStream.end(buffer);
      });

    } catch (error) {
      console.error('Upload service error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
  }

  validateImageFile(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'image/bmp',
      'image/tiff',
      'image/svg+xml'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error('Invalid image format. Allowed: JPG, PNG, GIF, WEBP, BMP, TIFF, SVG');
    }

    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: 10MB`);
    }
  }

  async deleteFile(publicId, resourceType = 'video') {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType
      });

      if (result.result === 'ok') {
        return {
          success: true,
          message: 'File deleted successfully'
        };
      } else {
        throw new Error('Failed to delete file from Cloudinary');
      }
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Delete failed: ${error.message}`);
    }
  }

  getPublicIdFromUrl(url) {
    try {
      // Extract the public ID from Cloudinary URL
      // Example URL: https://res.cloudinary.com/cloud_name/video/upload/v1234567890/htaf-music/audio/audio-1234567890.mp3
      const urlParts = url.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const fileNameWithoutExt = fileName.split('.')[0];
      const folderPath = urlParts[urlParts.length - 2];
      return `${folderPath}/${fileNameWithoutExt}`;
    } catch (error) {
      console.error('Error extracting public ID:', error);
      throw new Error('Invalid Cloudinary URL format');
    }
  }
}

module.exports = new UploadService(); 