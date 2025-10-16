const mongoose = require('mongoose');

const SongSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Tên bài hát là bắt buộc'],
    trim: true
  },
  
  artist: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Artist',
    required: [true, 'Nghệ sĩ là bắt buộc']
  },
  
  genre: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Genre',
    required: [true, 'Thể loại là bắt buộc']
  },
  
  price: {
    mp3: {
      type: Number,
      default: 0.99,
      min: [0, 'Giá không thể âm']
    },
    flac: {
      type: Number, 
      default: 1.99,
      min: [0, 'Giá không thể âm']
    },
    wav: {
      type: Number,
      default: 2.99,
      min: [0, 'Giá không thể âm'] 
    }
  },
  
  audioUrl: {
    type: String,
    required: [true, 'URL audio là bắt buộc']
  },
  
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  
  duration: {
    type: Number,
    required: [true, 'Thời lượng là bắt buộc'],
    min: [0, 'Thời lượng không thể âm']
  },
  
  lyrics: {
    type: String,
    trim: true
  },
  
  playCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  downloads: {
    type: Number,
    default: 0,
    min: 0
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  releaseDate: {
    type: Date,
    default: Date.now
  },
  
  audioInfo: {
    format: {
      type: String,
      // required: true
    },
    bitrate: Number,
    sampleRate: Number,
    channels: Number,
    fileSize: Number
  },
  
  tags: [{
    type: String,
    trim: true
  }],
  
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true,
  
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
SongSchema.index({ title: 'text', genre: 'text' });
SongSchema.index({ artist: 1 });
SongSchema.index({ createdAt: -1 });
SongSchema.index({ playCount: -1 });

// Virtual field cho số lượt thích
SongSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Virtual field cho thời lượng format MM:SS
SongSchema.virtual('durationFormatted').get(function() {
  const minutes = Math.floor(this.duration / 60);
  const seconds = this.duration % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

// Pre-save middleware
SongSchema.pre('save', function(next) {
  // Update updatedBy khi document được sửa
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.createdBy;
  }
  next();
});

// Instance methods
SongSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

SongSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

SongSchema.methods.incrementDownloads = function() {
  this.downloads += 1;
  return this.save();
};

// Static methods
SongSchema.statics.getTopPlayed = function(limit = 10) {
  return this.find({ isActive: true })
    .sort('-playCount')
    .limit(limit)
    .populate('artist', 'name');
};

SongSchema.statics.getNewReleases = function(limit = 10) {
  return this.find({ isActive: true })
    .sort('-releaseDate')
    .limit(limit)
    .populate('artist', 'name');
};

SongSchema.statics.searchByGenre = function(genre, limit = 20) {
  return this.find({ 
    genre: genre,
    isActive: true 
  })
  .sort('-playCount')
  .limit(limit)
  .populate('artist', 'name');
};

module.exports = mongoose.model('Song', SongSchema); 