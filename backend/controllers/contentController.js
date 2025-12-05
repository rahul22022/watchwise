
const Content = require('../models/Content');
const Subscription = require('../models/Subscription');

// @desc    AI-powered intelligent search
// @route   POST /api/content/ai-search
// @access  Private
const aiSearch = async (req, res) => {
  try {
    const { query } = req.body;
    const userId = req.user._id;
    
    // Get user's active subscriptions
    const userSubscriptions = await Subscription.find({ 
      user: userId, 
      isActive: true 
    }).select('serviceName monthlyPrice');
    
    const userPlatforms = userSubscriptions.map(sub => ({
      name: sub.serviceName,
      cost: sub.monthlyPrice
    }));
    
    // AI-powered search logic
    // 1. Extract keywords and intent from query
    const searchIntent = analyzeSearchIntent(query);
    
    // 2. Build smart MongoDB query based on intent
    let mongoQuery = {};
    let searchConditions = [];
    
    // Title search with fuzzy matching - only if title is meaningful
    if (searchIntent.title && searchIntent.title.length > 2) {
      searchConditions.push({
        $or: [
          { title: { $regex: searchIntent.title, $options: 'i' } },
          { description: { $regex: searchIntent.title, $options: 'i' } }
        ]
      });
    }
    
    // Genre filtering
    if (searchIntent.genres && searchIntent.genres.length > 0) {
      searchConditions.push({
        genres: { $in: searchIntent.genres }
      });
    }
    
    // Type filtering (Movie vs TV Show)
    if (searchIntent.type) {
      searchConditions.push({ type: searchIntent.type });
    }
    
    // Platform filtering
    if (searchIntent.platform) {
      searchConditions.push({ 'platforms.name': searchIntent.platform });
    }
    
    // Build final query
    if (searchConditions.length > 0) {
      mongoQuery = searchConditions.length === 1 
        ? searchConditions[0] 
        : { $and: searchConditions };
    } else {
      // If no specific conditions, do a broad search on the original query
      mongoQuery = {
        $or: [
          { title: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { genres: { $regex: query, $options: 'i' } }
        ]
      };
    }
    
    // 3. Execute search with ranking
    let content = await Content.find(mongoQuery)
      .limit(20);
    
    console.log(`AI Search - Query: "${query}"`);
    console.log('Search Intent:', JSON.stringify(searchIntent, null, 2));
    console.log('MongoDB Query:', JSON.stringify(mongoQuery, null, 2));
    console.log(`Results found: ${content.length}`);
    
    // 4. Score and rank results based on relevance
    content = content.map(item => {
      let relevanceScore = 0;
      
      // Title match scoring - use original query for better matching
      const titleLower = item.title.toLowerCase();
      const queryLower = query.toLowerCase();
      const intentTitleLower = searchIntent.title.toLowerCase();
      
      if (titleLower === queryLower || titleLower === intentTitleLower) {
        relevanceScore += 100; // Exact match
      } else if (titleLower.includes(queryLower)) {
        relevanceScore += 70; // Contains search term
      } else if (titleLower.includes(intentTitleLower)) {
        relevanceScore += 50; // Contains extracted title
      } else if (queryLower.includes(titleLower)) {
        relevanceScore += 40; // Search term contains title
      }
      
      // Check if any word from query matches title
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 2);
      const titleWords = titleLower.split(/\s+/);
      const matchingWords = queryWords.filter(qw => titleWords.some(tw => tw.includes(qw) || qw.includes(tw)));
      relevanceScore += matchingWords.length * 15;
      
      // Genre match scoring
      if (searchIntent.genres && searchIntent.genres.length > 0) {
        const matchingGenres = item.genres.filter(g => 
          searchIntent.genres.some(sg => sg.toLowerCase() === g.toLowerCase())
        );
        relevanceScore += matchingGenres.length * 10;
      }
      
      // Platform match scoring
      if (searchIntent.platform) {
        const hasPlatform = item.platforms.some(p => p.name === searchIntent.platform);
        if (hasPlatform) relevanceScore += 25;
      }
      
      // Type match scoring
      if (searchIntent.type && item.type === searchIntent.type) {
        relevanceScore += 15;
      }
      
      // Rating boost
      relevanceScore += (item.rating || 0) * 0.5;
      
      return { ...item.toObject(), relevanceScore };
    });
    
    // Sort by relevance
    content.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // 5. Add AI-powered recommendations
    const aiResults = content.map(item => {
      const availablePlatforms = item.platforms;
      
      // Categorize platforms
      const ownedPlatforms = [];
      const needsSubscription = [];
      
      availablePlatforms.forEach(platform => {
        const userHas = userPlatforms.find(up => 
          up.name.toLowerCase() === platform.name.toLowerCase()
        );
        if (userHas) {
          ownedPlatforms.push({
            platform: platform.name,
            cost: 0,
            status: 'FREE - Already subscribed',
            action: 'Watch Now'
          });
        } else {
          const cost = getPlatformCost(platform.name);
          needsSubscription.push({
            platform: platform.name,
            cost: cost,
            status: `$${cost}/month required`,
            action: 'Subscribe to Watch'
          });
        }
      });
      
      // Determine best recommendation
      let bestOption;
      let recommendation;
      
      if (ownedPlatforms.length > 0) {
        bestOption = ownedPlatforms[0];
        recommendation = `You can watch this on ${bestOption.platform} right now!`;
      } else if (needsSubscription.length > 0) {
        bestOption = needsSubscription.sort((a, b) => a.cost - b.cost)[0];
        recommendation = `Best option: Subscribe to ${bestOption.platform} for $${bestOption.cost}/month`;
      } else {
        bestOption = null;
        recommendation = 'Not currently available on streaming platforms';
      }
      
      return {
        id: item._id,
        title: item.title,
        type: item.type,
        genres: item.genres,
        rating: item.rating,
        releaseYear: item.releaseYear,
        description: item.description,
        relevanceScore: item.relevanceScore,
        aiRecommendation: {
          summary: recommendation,
          bestOption: bestOption,
          allOptions: {
            free: ownedPlatforms,
            paid: needsSubscription
          },
          userHasAccess: ownedPlatforms.length > 0
        }
      };
    });
    
    res.json({
      success: true,
      query: query,
      searchIntent: searchIntent,
      resultsCount: aiResults.length,
      results: aiResults,
      userPlatforms: userPlatforms.map(p => p.name)
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// AI helper function to analyze search intent
const analyzeSearchIntent = (query) => {
  const queryLower = query.toLowerCase();
  
  // Extract title (main search term) - keep original query
  let title = query;
  const originalQuery = query;
  
  // Detect and extract genres
  const genres = [];
  const genreKeywords = {
    'Action': ['action', 'fight'],
    'Adventure': ['adventure'],
    'Comedy': ['comedy', 'funny', 'laugh'],
    'Drama': ['drama', 'serious'],
    'Horror': ['horror', 'scary', 'fear'],
    'Sci-Fi': ['sci-fi', 'science fiction', 'futuristic', 'space'],
    'Thriller': ['thriller', 'suspense'],
    'Romance': ['romance', 'love', 'romantic'],
    'Fantasy': ['fantasy', 'magic', 'magical'],
    'Crime': ['crime', 'detective', 'investigation'],
    'Documentary': ['documentary', 'real story'],
    'Animation': ['animation', 'animated', 'cartoon'],
    'Sports': ['sports', 'sport']
  };
  
  for (const [genre, keywords] of Object.entries(genreKeywords)) {
    if (keywords.some(keyword => queryLower.includes(keyword))) {
      genres.push(genre);
      // Remove genre keywords from title
      keywords.forEach(keyword => {
        title = title.replace(new RegExp(keyword, 'gi'), '').trim();
      });
    }
  }
  
  // Detect type (movie vs tv show)
  let type = null;
  if (queryLower.includes('movie') || queryLower.includes('film')) {
    type = 'Movie';
    title = title.replace(/\b(movie|film)\b/gi, '').trim();
  } else if (queryLower.includes('show') || queryLower.includes('series') || queryLower.includes('tv')) {
    type = 'TV Show';
    title = title.replace(/\b(show|series|tv)\b/gi, '').trim();
  }
  
  // Detect platform mentions with fuzzy matching
  let platform = null;
  const platformPatterns = {
    'Netflix': ['netflix'],
    'HBO Max': ['hbo max', 'hbo', 'hbomax'],
    'Prime Video': ['prime video', 'prime', 'amazon prime'],
    'Disney+': ['disney+', 'disney plus', 'disney'],
    'Hulu': ['hulu'],
    'Apple TV+': ['apple tv+', 'apple tv', 'appletv', 'apple'],
    'Peacock': ['peacock'],
    'Paramount+': ['paramount+', 'paramount plus', 'paramount']
  };
  
  for (const [platformName, patterns] of Object.entries(platformPatterns)) {
    if (patterns.some(pattern => queryLower.includes(pattern))) {
      platform = platformName;
      // Remove platform name from title
      patterns.forEach(pattern => {
        title = title.replace(new RegExp(pattern, 'gi'), '').trim();
      });
      break;
    }
  }
  
  // Clean up title
  title = title.replace(/\s+/g, ' ').trim();
  
  // If title becomes empty after removing keywords, use original query
  if (!title || title.length < 2) {
    title = originalQuery;
  }
  
  return {
    title: title,
    originalQuery: originalQuery,
    genres: genres.length > 0 ? genres : null,
    type,
    platform
  };
};

// @desc    Get all content with filters
// @route   GET /api/content
// @access  Public
const getContent = async (req, res) => {
  try {
    const { genre, platform, type, search } = req.query;
    
    let query = {};
    
    if (genre) {
      query.genres = genre;
    }
    
    if (platform) {
      query['platforms.name'] = platform;
    }
    
    if (type) {
      query.type = type;
    }
    
    if (search) {
      query.$text = { $search: search };
    }
    
    const content = await Content.find(query)
      .sort({ rating: -1, releaseYear: -1 })
      .limit(50);
    
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get content by genre with user's subscription info
// @route   GET /api/content/by-genre
// @access  Private
const getContentByGenre = async (req, res) => {
  try {
    const { genre } = req.query;
    
    // Get user's active subscriptions
    const userSubscriptions = await Subscription.find({ 
      user: req.user._id, 
      isActive: true 
    }).select('serviceName');
    
    const userPlatforms = userSubscriptions.map(sub => sub.serviceName);
    
    let query = genre ? { genres: genre } : {};
    
    const content = await Content.find(query)
      .sort({ rating: -1 })
      .limit(50);
    
    // Add flag to indicate if user has access
    const contentWithAccess = content.map(item => ({
      ...item.toObject(),
      userHasAccess: item.platforms.some(p => userPlatforms.includes(p.name))
    }));
    
    res.json({
      content: contentWithAccess,
      userPlatforms
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Search content and find best way to watch
// @route   GET /api/content/search/:title
// @access  Private
const searchAndRecommend = async (req, res) => {
  try {
    const { title } = req.params;
    
    // Get user's active subscriptions
    const userSubscriptions = await Subscription.find({ 
      user: req.user._id, 
      isActive: true 
    }).select('serviceName monthlyPrice');
    
    const userPlatforms = userSubscriptions.map(sub => ({
      name: sub.serviceName,
      cost: sub.monthlyPrice
    }));
    
    // Search for content
    const content = await Content.find({
      $text: { $search: title }
    }).limit(10);
    
    // Add recommendations for each content item
    const recommendations = content.map(item => {
      const availablePlatforms = item.platforms.filter(p => p.available);
      
      // Categorize platforms
      const ownedPlatforms = [];
      const needsSubscription = [];
      
      availablePlatforms.forEach(platform => {
        const userHas = userPlatforms.find(up => up.name === platform.name);
        if (userHas) {
          ownedPlatforms.push({
            platform: platform.name,
            cost: 0,
            message: 'Already subscribed'
          });
        } else {
          needsSubscription.push({
            platform: platform.name,
            cost: getPlatformCost(platform.name),
            message: 'Requires subscription'
          });
        }
      });
      
      return {
        ...item.toObject(),
        recommendation: {
          bestOption: ownedPlatforms.length > 0 
            ? ownedPlatforms[0] 
            : needsSubscription.sort((a, b) => a.cost - b.cost)[0],
          ownedPlatforms,
          needsSubscription: needsSubscription.sort((a, b) => a.cost - b.cost)
        }
      };
    });
    
    res.json(recommendations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add new content (admin/seeding)
// @route   POST /api/content
// @access  Private
const addContent = async (req, res) => {
  try {
    const content = await Content.create(req.body);
    res.status(201).json(content);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Helper function to get platform costs
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

// @desc    Get all content titles grouped by platform
// @route   GET /api/content/by-platform
// @access  Public
const getContentByPlatform = async (req, res) => {
  try {
    // Get all content
    const allContent = await Content.find({}).sort({ title: 1 });
    
    // Group content by platform
    const platformMap = {};
    
    allContent.forEach(item => {
      item.platforms.forEach(platform => {
        if (!platformMap[platform.name]) {
          platformMap[platform.name] = {
            platform: platform.name,
            totalTitles: 0,
            movies: [],
            tvShows: [],
            allTitles: []
          };
        }
        
        const titleInfo = {
          title: item.title,
          type: item.type,
          genres: item.genres,
          rating: item.rating,
          releaseYear: item.releaseYear
        };
        
        platformMap[platform.name].allTitles.push(titleInfo);
        platformMap[platform.name].totalTitles++;
        
        if (item.type === 'Movie') {
          platformMap[platform.name].movies.push(titleInfo);
        } else if (item.type === 'TV Show') {
          platformMap[platform.name].tvShows.push(titleInfo);
        }
      });
    });
    
    // Convert to array and sort by total titles
    const platforms = Object.values(platformMap).sort((a, b) => b.totalTitles - a.totalTitles);
    
    // Summary statistics
    const summary = {
      totalPlatforms: platforms.length,
      totalUniqueTitles: allContent.length,
      platformBreakdown: platforms.map(p => ({
        platform: p.platform,
        totalTitles: p.totalTitles,
        movies: p.movies.length,
        tvShows: p.tvShows.length
      }))
    };
    
    res.json({
      success: true,
      summary,
      platforms
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// @desc    Get titles for a specific platform
// @route   GET /api/content/platform/:platformName
// @access  Public
const getTitlesByPlatform = async (req, res) => {
  try {
    const { platformName } = req.params;
    
    // Find all content on this platform
    const content = await Content.find({
      'platforms.name': platformName
    }).sort({ rating: -1, title: 1 });
    
    // Separate by type
    const movies = content.filter(item => item.type === 'Movie');
    const tvShows = content.filter(item => item.type === 'TV Show');
    
    res.json({
      success: true,
      platform: platformName,
      totalTitles: content.length,
      movies: {
        count: movies.length,
        titles: movies.map(m => ({
          title: m.title,
          genres: m.genres,
          rating: m.rating,
          releaseYear: m.releaseYear
        }))
      },
      tvShows: {
        count: tvShows.length,
        titles: tvShows.map(s => ({
          title: s.title,
          genres: s.genres,
          rating: s.rating,
          releaseYear: s.releaseYear
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

module.exports = {
  getContent,
  getContentByGenre,
  searchAndRecommend,
  addContent,
  aiSearch,
  getContentByPlatform,
  getTitlesByPlatform
};
