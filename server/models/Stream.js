const mongoose = require('mongoose');

const StreamSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  streamer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  thumbnailUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'live', 'ended'],
    default: 'scheduled'
  },
  streamKey: {
    type: String,
    required: true,
    unique: true
  },
  viewCount: {
    type: Number,
    default: 0
  },
  startTime: {
    type: Date
  },
  endTime: {
    type: Date
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  category: {
    type: String
  },
  recordingUrl: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Stream', StreamSchema); 