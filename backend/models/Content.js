const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['Movie', 'TV Show'],
    required: true
  },
  genres: [{
    type: String,
    enum: [
      'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
      'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery', 
      'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Musical',
      'Biography', 'Family', 'History', 'War', 'Sports'
    ]
  }],
  platforms: [{
    name: {
      type: String,
      enum: ['Netflix', 'HBO Max', 'Prime Video', 'Peacock', 'Disney+', 'Hulu', 'Apple TV+', 'Paramount+']
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  description: {
    type: String,
    maxlength: 1000
  },
  releaseYear: {
    type: Number
  },
  rating: {
    type: Number,
    min: 0,
    max: 10
  },
  imageUrl: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient searching
contentSchema.index({ title: 'text', description: 'text' });
contentSchema.index({ genres: 1 });
contentSchema.index({ 'platforms.name': 1 });

module.exports = mongoose.model('Content', contentSchema);
