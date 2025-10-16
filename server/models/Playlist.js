const mongoose = require('mongoose');

const PlaylistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên playlist là bắt buộc'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  coverImage: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  songs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  playCount: {
    type: Number,
    default: 0
  },
  tags: [String]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
PlaylistSchema.virtual('songCount').get(function() {
  return this.songs ? this.songs.length : 0;
});

PlaylistSchema.virtual('likesCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

// Indexes
PlaylistSchema.index({ name: 'text' });
PlaylistSchema.index({ createdBy: 1 });

// Middleware
PlaylistSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew && this.createdBy) {
    this.updatedBy = this.createdBy; // Simple logic, can be improved
  }
  next();
});

// Methods
PlaylistSchema.methods.canAccess = function(user) {
  if (this.isPublic) return true;
  if (!user) return false;
  
  return this.createdBy.toString() === user._id.toString() || (user.role === 'admin');
};

PlaylistSchema.methods.toggleLike = function(userId) {
  const index = this.likes.indexOf(userId);
  if (index === -1) {
    this.likes.push(userId);
  } else {
    this.likes.splice(index, 1);
  }
  return this.save();
};

module.exports = mongoose.model('Playlist', PlaylistSchema); 