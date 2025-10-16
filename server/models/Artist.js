const mongoose = require('mongoose');

const ArtistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Tên nghệ sĩ là bắt buộc'],
    trim: true,
    unique: true
  },
  
  bio: {
    type: String,
    trim: true
  },
  
  imageUrl: {
    type: String,
    default: 'https://via.placeholder.com/300'
  },
  
  genres: [{
    type: String,
    enum: [
      'Pop', 'Rock', 'Hip-hop', 'R&B', 'Jazz', 
      'Electronic', 'Classical', 'Folk', 'Country',
      'Blues', 'Indie', 'Rap', 'Nhạc Việt', 'Acoustic'
    ]
  }],
  
  socialLinks: {
    facebook: String,
    instagram: String,
    twitter: String,
    youtube: String,
    spotify: String,
    website: String
  },
  
  monthlyListeners: {
    type: Number,
    default: 0,
    min: 0
  },
  
  totalPlays: {
    type: Number,
    default: 0,
    min: 0
  },
  
  followers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  isVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
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

// Indexes
ArtistSchema.index({ name: 'text' });
ArtistSchema.index({ monthlyListeners: -1 });
ArtistSchema.index({ totalPlays: -1 });

// Virtual fields
ArtistSchema.virtual('followersCount').get(function() {
  return this.followers ? this.followers.length : 0;
});

ArtistSchema.virtual('songs', {
  ref: 'Song',
  localField: '_id',
  foreignField: 'artist'
});

ArtistSchema.virtual('albums', {
  ref: 'Album',
  localField: '_id',
  foreignField: 'artist'
});

// Pre-save middleware
ArtistSchema.pre('save', function(next) {
  // Update updatedBy khi document được sửa
  if (this.isModified() && !this.isNew) {
    this.updatedBy = this.createdBy;
  }
  next();
});

// Instance methods
ArtistSchema.methods.toggleFollow = function(userId) {
  const index = this.followers.indexOf(userId);
  if (index === -1) {
    this.followers.push(userId);
  } else {
    this.followers.splice(index, 1);
  }
  return this.save();
};

ArtistSchema.methods.incrementPlays = function() {
  this.totalPlays += 1;
  return this.save();
};

// Static methods
ArtistSchema.statics.getTopArtists = function(limit = 10) {
  return this.find({ isActive: true })
    .sort('-monthlyListeners')
    .limit(limit)
    .select('name imageUrl monthlyListeners');
};

ArtistSchema.statics.searchByGenre = function(genre, limit = 20) {
  return this.find({
    genres: genre,
    isActive: true
  })
  .sort('-monthlyListeners')
  .limit(limit)
  .select('name imageUrl genres');
};

ArtistSchema.statics.getVerifiedArtists = function(limit = 20) {
  return this.find({
    isVerified: true,
    isActive: true
  })
  .sort('-monthlyListeners')
  .limit(limit)
  .select('name imageUrl isVerified');
};

module.exports = mongoose.model('Artist', ArtistSchema); 