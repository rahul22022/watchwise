const Watchlist = require('../models/Watchlist');
const Content = require('../models/Content');
const Subscription = require('../models/Subscription');

// @desc    Get user's watchlist
// @route   GET /api/watchlist
// @access  Private
const getWatchlist = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = { user: req.user._id };
    if (status) {
      query.status = status;
    }
    
    const watchlist = await Watchlist.find(query)
      .populate('content')
      .sort({ addedAt: -1 });
    
    console.log(`📋 Retrieved watchlist for user ${req.user._id}: ${watchlist.length} items`);
    
    res.json(watchlist);
  } catch (error) {
    console.error('❌ Error getting watchlist:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add to watchlist with recommendation
// @route   POST /api/watchlist
// @access  Private
const addToWatchlist = async (req, res) => {
  try {
    const { contentId, customTitle, customType, status, priority, notes } = req.body;
    
    console.log('📝 Adding to watchlist:', { userId: req.user._id, contentId, customTitle, customType });
    
    // Check for existing watchlist item
    if (contentId) {
      const existing = await Watchlist.findOne({ user: req.user._id, content: contentId });
      if (existing) {
        console.log('⚠️  Item already exists (by contentId):', existing._id);
        return res.status(200).json({ 
          message: 'This item is already in your watchlist',
          existing: true,
          item: existing
        });
      }
    } else if (customTitle) {
      // Case-insensitive check for custom titles
      const existing = await Watchlist.findOne({ 
        user: req.user._id, 
        customTitle: { $regex: new RegExp(`^${customTitle}$`, 'i') }
      });
      if (existing) {
        console.log('⚠️  Item already exists (by customTitle):', existing._id);
        return res.status(200).json({ 
          message: 'This item is already in your watchlist',
          existing: true,
          item: existing
        });
      }
    }
    
    // Get user's active subscriptions
    const userSubscriptions = await Subscription.find({ 
      user: req.user._id, 
      isActive: true 
    }).select('serviceName monthlyPrice');
    
    let recommendedPlatforms = [];
    
    // If adding existing content from database
    if (contentId) {
      const content = await Content.findById(contentId);
      if (!content) {
        return res.status(404).json({ message: 'Content not found' });
      }
      
      // Generate recommendations
      recommendedPlatforms = content.platforms.map(platform => {
        const userHas = userSubscriptions.find(sub => sub.serviceName === platform.name);
        return {
          platform: platform.name,
          userHasSubscription: !!userHas,
          cost: userHas ? 0 : getPlatformCost(platform.name)
        };
      }).sort((a, b) => {
        if (a.userHasSubscription === b.userHasSubscription) {
          return a.cost - b.cost;
        }
        return a.userHasSubscription ? -1 : 1;
      });
    }
    
    const watchlistItem = await Watchlist.create({
      user: req.user._id,
      content: contentId || undefined,
      customTitle: customTitle || undefined,
      customType: customType || undefined,
      status: status || 'Want to Watch',
      priority: priority || 'Medium',
      notes: notes || undefined,
      recommendedPlatforms
    });
    
    console.log('✅ Watchlist item created:', watchlistItem._id, '- Title:', customTitle || 'N/A');
    
    const populated = await Watchlist.findById(watchlistItem._id).populate('content');
    res.status(201).json(populated);
  } catch (error) {
    console.error('❌ Error adding to watchlist:', error.message, error.code);
    if (error.code === 11000) {
      return res.status(200).json({ 
        message: 'This item is already in your watchlist',
        existing: true
      });
    }
    res.status(500).json({ message: error.message, error: error.toString() });
  }
};

// @desc    Update watchlist item
// @route   PUT /api/watchlist/:id
// @access  Private
const updateWatchlistItem = async (req, res) => {
  try {
    const watchlistItem = await Watchlist.findById(req.params.id);
    
    if (!watchlistItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    if (watchlistItem.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    // If marking as completed, set completedAt date
    if (req.body.status === 'Completed' && !watchlistItem.completedAt) {
      req.body.completedAt = Date.now();
    }
    
    const updated = await Watchlist.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('content');
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete watchlist item
// @route   DELETE /api/watchlist/:id
// @access  Private
const deleteWatchlistItem = async (req, res) => {
  try {
    const watchlistItem = await Watchlist.findById(req.params.id);
    
    if (!watchlistItem) {
      return res.status(404).json({ message: 'Watchlist item not found' });
    }
    
    if (watchlistItem.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    
    await Watchlist.findByIdAndDelete(req.params.id);
    res.json({ message: 'Watchlist item removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search and add to watchlist
// @route   POST /api/watchlist/search-add
// @access  Private
const searchAndAddToWatchlist = async (req, res) => {
  try {
    const { title } = req.body;
    
    // Search for content
    const content = await Content.findOne({
      $text: { $search: title }
    });
    
    if (!content) {
      // If not found, allow user to add as custom entry
      return res.json({
        found: false,
        message: 'Content not found in database. You can add it as a custom entry.',
        suggestion: { customTitle: title }
      });
    }
    
    // Get user's subscriptions for recommendations
    const userSubscriptions = await Subscription.find({ 
      user: req.user._id, 
      isActive: true 
    }).select('serviceName');
    
    const userPlatforms = userSubscriptions.map(sub => sub.serviceName);
    
    const recommendedPlatforms = content.platforms.map(platform => {
      const userHas = userPlatforms.includes(platform.name);
      return {
        platform: platform.name,
        userHasSubscription: userHas,
        cost: userHas ? 0 : getPlatformCost(platform.name)
      };
    }).sort((a, b) => {
      if (a.userHasSubscription === b.userHasSubscription) {
        return a.cost - b.cost;
      }
      return a.userHasSubscription ? -1 : 1;
    });
    
    res.json({
      found: true,
      content,
      recommendedPlatforms,
      bestOption: recommendedPlatforms[0]
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPlatformCost = (platformName) => {
  const costs = {
    'Netflix': 15.49,
    'HBO Max': 15.99,
    'Prime Video': 8.99,
    'Peacock': 5.99,
    'Disney+': 10.99,
    'Hulu': 7.99,
    'Apple TV+': 6.99,
    'Paramount+': 5.99
  };
  return costs[platformName] || 9.99;
};

module.exports = {
  getWatchlist,
  addToWatchlist,
  updateWatchlistItem,
  deleteWatchlistItem,
  searchAndAddToWatchlist
};
