const NetworkContent = require('../models/NetworkContent');
const Subscription = require('../models/Subscription');
const Interest = require('../models/Interest');
// Using mock service for now - replace with justwatchService when API is ready
const mockContentService = require('../services/mockContentService');

// @desc    Fetch content from external APIs and save to database
// @route   POST /api/network/fetch
// @access  Private (Admin only for now)
const fetchAndSaveContent = async (req, res) => {
  try {
    const { platform, limit } = req.body;

    if (platform) {
      // Fetch for specific platform
      console.log(`Fetching content for ${platform}...`);
      const content = await mockContentService.fetchContentForPlatform(platform, limit || 25);
      const results = await mockContentService.saveContentToDatabase(platform, content);
      
      res.json({
        success: true,
        message: `Content fetched and saved for ${platform}`,
        platform,
        fetched: content.length,
        results
      });
    } else {
      // Fetch for all platforms
      console.log('Fetching content for all platforms...');
      const summary = await mockContentService.fetchAndSaveAllPlatforms(limit || 25);
      
      res.json({
        success: true,
        message: 'Content fetched and saved for all platforms',
        summary
      });
    }
  } catch (error) {
    console.error('Fetch error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get personalized recommendations with subscription insights
// @route   GET /api/network/recommendations
// @access  Private
const getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 10;

    // Get user's active subscriptions
    const userSubscriptions = await Subscription.find({ 
      user: userId, 
      isActive: true 
    }).select('serviceName cost');
    
    const userPlatforms = userSubscriptions.map(sub => sub.serviceName);
    const totalCost = userSubscriptions.reduce((sum, sub) => sum + (sub.cost || 0), 0);

    // Get user's interests
    const userInterest = await Interest.findOne({ user: userId });
    const userGenres = userInterest?.genres || [];

    // Get user's watchlist to understand what they're interested in
    const Watchlist = require('../models/Watchlist');
    const watchlistItems = await Watchlist.find({ user: userId }).select('title genre');

    // If no subscriptions, analyze ALL platforms and recommend which to subscribe to
    if (userPlatforms.length === 0) {
      const platformAnalysis = await analyzePlatformsForUser(userGenres, watchlistItems);
      
      return res.json({
        success: true,
        message: 'No active subscriptions. Here are our recommendations:',
        recommendations: [],
        userPlatforms: [],
        userGenres,
        insights: {
          suggestedPlatforms: platformAnalysis.suggested,
          message: 'Based on your interests, we recommend starting with these platforms:'
        }
      });
    }

    // Build query for current subscriptions
    let query = {
      platform: { $in: userPlatforms }
    };

    if (userGenres.length > 0) {
      query.genres = { $in: userGenres };
    }

    // Fetch recommendations from current subscriptions
    const recommendations = await NetworkContent.find(query)
      .sort({ rating: -1, releaseYear: -1 })
      .limit(limit)
      .select('-__v');

    // Analyze subscription value and provide insights
    const insights = await analyzeSubscriptionValue(userId, userPlatforms, userGenres, watchlistItems, userSubscriptions);

    res.json({
      success: true,
      count: recommendations.length,
      userPlatforms,
      userGenres,
      totalMonthlyCost: totalCost,
      recommendations,
      insights
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      recommendations: []
    });
  }
};

// Helper: Analyze platforms for users with no subscriptions
async function analyzePlatformsForUser(userGenres, watchlistItems) {
  try {
    const allPlatforms = ['Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+', 'Peacock', 'Paramount+'];
    
    const platformScores = await Promise.all(
      allPlatforms.map(async (platform) => {
        let matchQuery = { platform };
        
        if (userGenres.length > 0) {
          matchQuery.genres = { $in: userGenres };
        }
        
        const contentCount = await NetworkContent.countDocuments(matchQuery);
        const avgRating = await NetworkContent.aggregate([
          { $match: matchQuery },
          { $group: { _id: null, avgRating: { $avg: '$rating' } } }
        ]);
        
        return {
          platform,
          matchingContent: contentCount,
          averageRating: avgRating[0]?.avgRating || 0,
          score: contentCount * (avgRating[0]?.avgRating || 0)
        };
      })
    );
    
    // Sort by score and return top 3
    const suggested = platformScores
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(p => ({
        platform: p.platform,
        matchingContent: p.matchingContent,
        averageRating: p.averageRating.toFixed(1),
        reason: `${p.matchingContent} titles matching your interests with ${p.averageRating.toFixed(1)}⭐ avg rating`
      }));
    
    return { suggested };
  } catch (error) {
    console.error('Platform analysis error:', error);
    return { suggested: [] };
  }
}

// Helper: Analyze subscription value and provide insights
async function analyzeSubscriptionValue(userId, userPlatforms, userGenres, watchlistItems, subscriptions) {
  try {
    const insights = {
      redundantPlatforms: [],
      underutilizedPlatforms: [],
      suggestedPlatforms: [],
      rotationStrategy: null,
      costSavings: 0
    };

    // 1. Check for content overlap between platforms (redundancy)
    const platformContent = await Promise.all(
      userPlatforms.map(async (platform) => {
        const content = await NetworkContent.find({
          platform,
          genres: { $in: userGenres }
        }).select('title genres rating');
        
        return {
          platform,
          content,
          count: content.length
        };
      })
    );

    // Find platforms with similar content
    for (let i = 0; i < platformContent.length; i++) {
      for (let j = i + 1; j < platformContent.length; j++) {
        const platform1 = platformContent[i];
        const platform2 = platformContent[j];
        
        // Check genre overlap
        const titles1 = new Set(platform1.content.map(c => c.title.toLowerCase()));
        const titles2 = new Set(platform2.content.map(c => c.title.toLowerCase()));
        
        // If platforms have very similar genres and low unique content
        const genres1 = new Set(platform1.content.flatMap(c => c.genres));
        const genres2 = new Set(platform2.content.flatMap(c => c.genres));
        const genreOverlap = [...genres1].filter(g => genres2.has(g)).length;
        
        if (genreOverlap > 2 && platform1.count < 5 && platform2.count < 5) {
          const cost1 = subscriptions.find(s => s.serviceName === platform1.platform)?.cost || 0;
          const cost2 = subscriptions.find(s => s.serviceName === platform2.platform)?.cost || 0;
          
          if (cost1 > cost2) {
            insights.redundantPlatforms.push({
              platform: platform1.platform,
              similarTo: platform2.platform,
              reason: `Similar content to ${platform2.platform} but costs $${cost1 - cost2} more per month`,
              potentialSavings: cost1 - cost2
            });
          }
        }
      }
    }

    // 2. Check for underutilized platforms (few matching shows)
    platformContent.forEach(pc => {
      if (pc.count < 5) {
        const subscription = subscriptions.find(s => s.serviceName === pc.platform);
        insights.underutilizedPlatforms.push({
          platform: pc.platform,
          matchingShows: pc.count,
          monthlyCost: subscription?.cost || 0,
          reason: `Only ${pc.count} shows match your interests. Consider canceling after watching them.`
        });
      }
    });

    // 3. Suggest platforms NOT subscribed to with great matching content
    const allPlatforms = ['Netflix', 'Prime Video', 'Disney+', 'HBO Max', 'Hulu', 'Apple TV+', 'Peacock', 'Paramount+'];
    const unsubscribedPlatforms = allPlatforms.filter(p => !userPlatforms.includes(p));
    
    const suggestions = await Promise.all(
      unsubscribedPlatforms.map(async (platform) => {
        const matchingContent = await NetworkContent.countDocuments({
          platform,
          genres: { $in: userGenres }
        });
        
        const topShows = await NetworkContent.find({
          platform,
          genres: { $in: userGenres }
        }).sort({ rating: -1 }).limit(3).select('title rating');
        
        return {
          platform,
          matchingContent,
          topShows: topShows.map(s => `${s.title} (${s.rating}⭐)`)
        };
      })
    );
    
    insights.suggestedPlatforms = suggestions
      .filter(s => s.matchingContent > 5)
      .sort((a, b) => b.matchingContent - a.matchingContent)
      .slice(0, 2)
      .map(s => ({
        platform: s.platform,
        matchingShows: s.matchingContent,
        topPicks: s.topShows,
        reason: `${s.matchingContent} highly-rated shows matching your interests`
      }));

    // 4. Create rotation strategy
    if (insights.underutilizedPlatforms.length > 0) {
      const underutilized = insights.underutilizedPlatforms[0];
      const totalShows = platformContent.find(pc => pc.platform === underutilized.platform)?.count || 0;
      
      insights.rotationStrategy = {
        currentPlatform: underutilized.platform,
        showsAvailable: totalShows,
        suggestion: `Watch all ${totalShows} shows from ${underutilized.platform}, then cancel and switch to ${insights.suggestedPlatforms[0]?.platform || 'a new platform'}`,
        estimatedSavings: `Save $${underutilized.monthlyCost} per month when not subscribed`,
        strategy: 'rotation'
      };
    }

    // Calculate potential cost savings
    insights.costSavings = insights.redundantPlatforms.reduce((sum, p) => sum + (p.potentialSavings || 0), 0);

    return insights;
  } catch (error) {
    console.error('Subscription analysis error:', error);
    return {
      redundantPlatforms: [],
      underutilizedPlatforms: [],
      suggestedPlatforms: [],
      rotationStrategy: null,
      costSavings: 0
    };
  }
}

// @desc    Get content from network collection with filters
// @route   GET /api/network/content
// @access  Public
const getNetworkContent = async (req, res) => {
  try {
    const { platform, genre, type, search, limit, page } = req.query;
    
    let query = {};
    
    if (platform) {
      query.platform = platform;
    }
    
    if (genre) {
      query.genres = genre;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 50;
    const skip = (pageNum - 1) * limitNum;

    const content = await NetworkContent.find(query)
      .sort({ rating: -1, releaseYear: -1 })
      .skip(skip)
      .limit(limitNum)
      .select('-__v');

    const total = await NetworkContent.countDocuments(query);

    res.json({
      success: true,
      count: content.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      content
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get statistics about network content
// @route   GET /api/network/stats
// @access  Public
const getNetworkStats = async (req, res) => {
  try {
    const totalContent = await NetworkContent.countDocuments();
    
    // Count by platform
    const platformStats = await NetworkContent.aggregate([
      {
        $group: {
          _id: '$platform',
          count: { $sum: 1 },
          avgRating: { $avg: '$rating' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Count by type
    const typeStats = await NetworkContent.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Top genres
    const genreStats = await NetworkContent.aggregate([
      {
        $unwind: '$genres'
      },
      {
        $group: {
          _id: '$genres',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 15
      }
    ]);

    // Last updated
    const lastUpdated = await NetworkContent.findOne()
      .sort({ lastUpdated: -1 })
      .select('lastUpdated');

    res.json({
      success: true,
      stats: {
        totalContent,
        lastUpdated: lastUpdated?.lastUpdated,
        platforms: platformStats,
        types: typeStats,
        topGenres: genreStats
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Search across all network content
// @route   GET /api/network/search
// @access  Public
const searchNetworkContent = async (req, res) => {
  try {
    const { q, limit } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const limitNum = parseInt(limit) || 20;

    const results = await NetworkContent.find({
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    })
      .sort({ rating: -1 })
      .limit(limitNum)
      .select('-__v');

    res.json({
      success: true,
      query: q,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  fetchAndSaveContent,
  getPersonalizedRecommendations,
  getNetworkContent,
  getNetworkStats,
  searchNetworkContent
};
