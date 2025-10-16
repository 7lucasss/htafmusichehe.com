const express = require('express');
const router = express.Router();
const axios = require('axios');
const Song = require('../models/Song');
const auth = require('../middleware/auth');

// @route   GET /api/audio/stream/:songId
// @desc    Stream audio file with range support
// @access  Public (có thể thêm auth nếu cần)
router.get('/stream/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    const range = req.headers.range;

    console.log(`[Audio Stream] Request received for songId: ${songId}, Range: ${range}`);

    // Tìm bài hát
    const song = await Song.findById(songId);
    if (!song) {
      console.warn(`[Audio Stream] Song with ID ${songId} not found.`);
      return res.status(404).json({ message: 'Song not found' });
    }

    // Kiểm tra song có active không
    if (!song.isActive) {
      console.warn(`[Audio Stream] Song ${song.title} (ID: ${songId}) is not active.`);
      return res.status(403).json({ message: 'Song is not available' });
    }

    console.log(`[Audio Stream] Found song: ${song.title} (${song.audioUrl})`);

    // Nếu không có range header, redirect đến Cloudinary URL
    if (!range) {
      console.log('[Audio Stream] No range header, redirecting to Cloudinary directly.');
      return res.redirect(song.audioUrl);
    }

    try {
      // Parse range header
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : null;

      console.log(`[Audio Stream] Processing range request: bytes=${start}-${end || ''}`);

      // Tạo range header cho request đến Cloudinary
      const rangeHeader = end ? `bytes=${start}-${end}` : `bytes=${start}-`;

      // Request đến Cloudinary với range
      const response = await axios({
        method: 'GET',
        url: song.audioUrl,
        headers: {
          'Range': rangeHeader,
          'User-Agent': 'HTaf-Music-Player/1.0'
        },
        responseType: 'stream'
      });

      console.log(`[Audio Stream] Cloudinary response status: ${response.status}, Content-Type: ${response.headers['content-type']}, Content-Length: ${response.headers['content-length']}`);

      // Set headers cho partial content
      res.status(206);
      res.set({
        'Content-Range': response.headers['content-range'],
        'Accept-Ranges': 'bytes',
        'Content-Length': response.headers['content-length'],
        'Content-Type': response.headers['content-type'] || 'audio/mpeg',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Range'
      });

      // Stream response
      response.data.pipe(res);
      console.log('[Audio Stream] Piping Cloudinary response to client.');

      response.data.on('end', () => {
        console.log('[Audio Stream] Cloudinary stream ended, response sent to client.');
      });

      response.data.on('error', (err) => {
        console.error('[Audio Stream] Error during Cloudinary stream pipe:', err.message);
        // Fallback or error handling for client
        if (!res.headersSent) {
          res.status(500).json({ message: 'Error streaming audio from Cloudinary.' });
        }
      });

    } catch (proxyError) {
      console.error('[Audio Stream] Error proxying range request to Cloudinary:', proxyError.message);
      // Fallback: redirect to original URL if proxying fails
      console.log('[Audio Stream] Falling back to direct redirect to Cloudinary due to proxy error.');
      return res.redirect(song.audioUrl);
    }

  } catch (error) {
    console.error('[Audio Stream] General stream error:', error.message, error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   GET /api/audio/info/:songId
// @desc    Get audio file info (duration, format, etc.)
// @access  Public
router.get('/info/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    const song = await Song.findById(songId)
      .populate('artist', 'name')
      .populate('album', 'title');
      
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Lấy metadata từ Cloudinary URL (có thể implement sau)
    // Hiện tại trả về thông tin từ database
    res.json({
      id: song._id,
      title: song.title,
      artist: song.artist,
      album: song.album,
      duration: song.duration,
      genre: song.genre,
      audioUrl: song.audioUrl,
      imageUrl: song.imageUrl,
      streamUrl: `/api/audio/stream/${song._id}`,
      format: getAudioFormat(song.audioUrl),
      quality: getAudioQuality(song.audioUrl)
    });

  } catch (error) {
    console.error('Audio info error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   POST /api/audio/play/:songId
// @desc    Increment play count
// @access  Private (optional)
router.post('/play/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    const song = await Song.findByIdAndUpdate(
      songId,
      { $inc: { playCount: 1 } },
      { new: true }
    );

    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    console.log(`Play count updated for: ${song.title} - Total: ${song.playCount}`);

    res.json({
      message: 'Play count updated',
      playCount: song.playCount
    });

  } catch (error) {
    console.error('Play count error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   GET /api/audio/download/:songId
// @desc    Generate download link (premium feature)
// @access  Private
router.get('/download/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const { format = 'mp3' } = req.query; // mp3, flac, wav
    
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Kiểm tra user có quyền download không (có thể implement purchase check)
    // const hasPurchased = await checkUserPurchase(req.user.id, songId, format);
    // if (!hasPurchased) {
    //   return res.status(403).json({ message: 'Purchase required for download' });
    // }

    // Generate signed/temporary download URL
    const downloadUrl = generateDownloadUrl(song.audioUrl, format);
    
    res.json({
      downloadUrl,
      filename: `${song.artist?.name || 'Unknown'} - ${song.title}.${format}`,
      format,
      expiresIn: 3600 // 1 hour
    });

  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   GET /api/audio/waveform/:songId
// @desc    Get audio waveform data
// @access  Public
router.get('/waveform/:songId', async (req, res) => {
  try {
    const { songId } = req.params;
    
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Generate or get cached waveform data
    // Này có thể implement với ffmpeg hoặc Web Audio API
    const waveformData = await generateWaveform(song.audioUrl);
    
    res.json({
      songId,
      waveform: waveformData,
      duration: song.duration
    });

  } catch (error) {
    console.error('Waveform error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// @route   POST /api/audio/favorite/:songId
// @desc    Toggle favorite song
// @access  Private
router.post('/favorite/:songId', auth, async (req, res) => {
  try {
    const { songId } = req.params;
    const userId = req.user.id;
    
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Toggle favorite logic (cần implement User model với favorites)
    // const user = await User.findById(userId);
    // const isFavorite = user.favorites.includes(songId);
    
    // if (isFavorite) {
    //   user.favorites = user.favorites.filter(id => id.toString() !== songId);
    // } else {
    //   user.favorites.push(songId);
    // }
    // await user.save();

    res.json({
      message: 'Favorite status updated',
      isFavorite: !isFavorite
    });

  } catch (error) {
    console.error('Favorite error:', error);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
});

// Helper functions
function getAudioFormat(url) {
  const extension = url.split('.').pop().toLowerCase();
  const formatMap = {
    'mp3': 'MP3',
    'flac': 'FLAC', 
    'wav': 'WAV',
    'ogg': 'OGG',
    'm4a': 'M4A'
  };
  return formatMap[extension] || 'Unknown';
}

function getAudioQuality(url) {
  // Simple quality detection based on URL patterns
  if (url.includes('_hq') || url.includes('320')) return 'High (320kbps)';
  if (url.includes('_lq') || url.includes('128')) return 'Standard (128kbps)';
  return 'Standard';
}

function generateDownloadUrl(originalUrl, format) {
  // For now, return original URL
  // In production, this could generate signed URLs or format-specific URLs
  return originalUrl;
}

async function generateWaveform(audioUrl) {
  // Placeholder waveform data
  // In production, this would use ffmpeg or similar to generate actual waveform
  const sampleData = [];
  for (let i = 0; i < 200; i++) {
    sampleData.push(Math.random() * 100);
  }
  return sampleData;
}

module.exports = router; 