const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Content'
  },
  // For custom entries not in Content database
  customTitle: {
    type: String
  },
  customType: {
    type: String,
    enum: ['Movie', 'TV Show']
  },
  status: {
    type: String,
    enum: ['Want to Watch', 'Currently Watching', 'Completed'],
    default: 'Want to Watch'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Medium'
  },
  notes: {
    type: String,
    maxlength: 500
  },
  // Where user can watch based on their subscriptions
  recommendedPlatforms: [{
    platform: String,
    userHasSubscription: Boolean,
    cost: Number
  }],
  addedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

// Create compound indexes for uniqueness
// For content-based items (from database)
watchlistSchema.index({ user: 1, content: 1 }, { 
  unique: true,
  partialFilterExpression: { content: { $type: 'objectId' } }
});

// For custom title items (user-added)
watchlistSchema.index({ user: 1, customTitle: 1 }, { 
  unique: true,
  partialFilterExpression: { customTitle: { $type: 'string' } }
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
