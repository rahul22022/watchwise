const mongoose = require('mongoose');

const NetworkContentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['Movie', 'TV Show'],
    required: true
  },
  genres: [{
    type: String,
    required: true
  }],
  platform: {
    type: String,
    required: true,
    index: true
  },
  description: {
    type: String
  },
  releaseYear: {
    type: Number
  },
  rating: {
    type: Number
  },
  imdbId: {
    type: String,
    index: true
  },
  tmdbId: {
    type: String,
    index: true
  },
  posterUrl: {
    type: String
  },
  backdropUrl: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  externalSource: {
    type: String,
    default: 'manual'
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
NetworkContentSchema.index({ platform: 1, genres: 1 });
NetworkContentSchema.index({ title: 'text', description: 'text' });

// Prevent duplicates based on title and platform
NetworkContentSchema.index({ title: 1, platform: 1 }, { unique: true });

module.exports = mongoose.model('NetworkContent', NetworkContentSchema);
