const mongoose = require('mongoose');

const interestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
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
  favoriteShows: [{
    name: String,
    platform: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  favoriteMovies: [{
    name: String,
    platform: String,
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  preferredContentType: {
    type: String,
    enum: ['Movies', 'TV Shows', 'Both'],
    default: 'Both'
  },
  watchingTime: {
    type: String,
    enum: ['Morning', 'Afternoon', 'Evening', 'Night', 'Anytime'],
    default: 'Anytime'
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
interestSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Interest', interestSchema);
