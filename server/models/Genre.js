const mongoose = require('mongoose');

const GenreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên thể loại là bắt buộc'],
    trim: true,
    unique: true
  },
  
  description: {
    type: String,
    trim: true
  },
  
  color: {
    type: String,
    default: '#6366f1' // Default color
  },
  
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  sortOrder: {
    type: Number,
    default: 0
  },
  
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

// Index
GenreSchema.index({ name: 'text' });
GenreSchema.index({ sortOrder: 1 });

// Virtual for song count
GenreSchema.virtual('songCount', {
  ref: 'Song',
  localField: 'name',
  foreignField: 'genre',
  count: true
});

// Static methods
GenreSchema.statics.getActiveGenres = function() {
  return this.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
};

GenreSchema.statics.getPopularGenres = function(limit = 10) {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'songs',
        localField: 'name',
        foreignField: 'genre',
        as: 'songs'
      }
    },
    {
      $addFields: {
        songCount: { $size: '$songs' }
      }
    },
    { $sort: { songCount: -1 } },
    { $limit: limit }
  ]);
};

module.exports = mongoose.model('Genre', GenreSchema); 