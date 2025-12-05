const axios = require('axios');
const NetworkContent = require('../models/NetworkContent');

// JustWatch API configuration (using their public search API)
const JUSTWATCH_BASE_URL = 'https://apis.justwatch.com/content/titles';
const JUSTWATCH_COUNTRY = 'us'; // Country code

// Platform provider IDs on JustWatch (numeric IDs)
const PLATFORM_PROVIDERS = {
  'Netflix': 8,
  'Prime Video': 9,
  'Disney+': 337,
  'HBO Max': 384,
  'Hulu': 15,
  'Apple TV+': 350,
  'Peacock': 387,
  'Paramount+': 531
};

// Genre mappings
const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
  'Documentary', 'Drama', 'Family', 'Fantasy', 'History', 
  'Horror', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 
  'Thriller', 'War', 'Western'
];

class JustWatchService {
  constructor() {
    this.baseUrl = JUSTWATCH_BASE_URL;
    this.country = JUSTWATCH_COUNTRY;
  }

  // Fetch content from JustWatch using their search/filter API
  async fetchContentFromJustWatch(providerId, contentType = null, page = 1, pageSize = 20) {
    try {
      const url = `${this.baseUrl}/${this.country}/popular`;
      
      const params = {
        body: JSON.stringify({
          page: page,
          page_size: pageSize,
          providers: [providerId],
          content_types: contentType ? [contentType.toLowerCase()] : ['movie', 'show']
        })
      };

      console.log(`Fetching from JustWatch: provider=${providerId}, type=${contentType || 'all'}`);
      
      const response = await axios.get(url, {
        params,
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        }
      });

      if (!response.data || !response.data.items) {
        console.log('No items in response');
        return [];
      }

      return this.parseJustWatchResponse(response.data.items);
    } catch (error) {
      console.error(`Error fetching from JustWatch:`, error.message);
      return [];
    }
  }

  // Parse JustWatch response to our format
  parseJustWatchResponse(edges) {
    return edges.map(edge => {
      const node = edge.node;
      const content = node.content;
      
      return {
        title: content.title,
        type: node.objectType === 'MOVIE' ? 'Movie' : 'TV Show',
        genres: content.genres ? content.genres.map(g => this.mapGenre(g.shortName)) : [],
        description: content.shortDescription || '',
        releaseYear: content.originalReleaseYear,
        rating: content.scoring?.imdbScore || content.scoring?.tmdbScore || 0,
        imdbId: content.externalIds?.imdbId || '',
        posterUrl: content.posterUrl ? `https://images.justwatch.com${content.posterUrl.replace('{profile}', 's718')}` : '',
        backdropUrl: content.backdrops && content.backdrops.length > 0 
          ? `https://images.justwatch.com${content.backdrops[0].backdropUrl.replace('{profile}', 's1920')}`
          : '',
        runtime: content.runtime || 0
      };
    }).filter(item => item.title); // Filter out any items without titles
  }

  // Map JustWatch genre shortnames to readable names
  mapGenre(shortName) {
    const genreMap = {
      'act': 'Action',
      'ani': 'Animation',
      'cmy': 'Comedy',
      'crm': 'Crime',
      'doc': 'Documentary',
      'drm': 'Drama',
      'fnt': 'Fantasy',
      'hrr': 'Horror',
      'rma': 'Romance',
      'scf': 'Sci-Fi',
      'trl': 'Thriller',
      'war': 'War',
      'wsn': 'Western',
      'adv': 'Adventure',
      'fml': 'Family',
      'hst': 'History',
      'msc': 'Music',
      'mys': 'Mystery'
    };
    return genreMap[shortName] || shortName;
  }

  // Fetch content for a specific platform
  async fetchContentForPlatform(platformName, limit = 25) {
    const providerShortName = PLATFORM_PROVIDERS[platformName];
    if (!providerShortName) {
      throw new Error(`Provider not found for platform: ${platformName}`);
    }

    console.log(`\n📺 Fetching ${limit} titles for ${platformName}...`);
    
    // Fetch both movies and TV shows
    const movies = await this.fetchContentFromJustWatch(providerShortName, 'MOVIE', Math.ceil(limit / 2));
    await this.delay(500); // Rate limiting
    
    const shows = await this.fetchContentFromJustWatch(providerShortName, 'SHOW', Math.ceil(limit / 2));
    
    const allContent = [...movies, ...shows].slice(0, limit);
    
    // Add platform information
    allContent.forEach(item => {
      item.platform = platformName;
      item.externalSource = 'justwatch';
    });

    console.log(`✓ Fetched ${allContent.length} titles for ${platformName}`);
    return allContent;
  }

  // Save content to database
  async saveContentToDatabase(platformName, contentArray) {
    let saved = 0;
    let skipped = 0;

    for (const content of contentArray) {
      try {
        // Upsert: update if exists, create if not
        await NetworkContent.findOneAndUpdate(
          { 
            title: content.title, 
            platform: platformName 
          },
          {
            ...content,
            lastUpdated: new Date()
          },
          { 
            upsert: true, 
            new: true 
          }
        );
        saved++;
      } catch (error) {
        console.error(`Error saving ${content.title}:`, error.message);
        skipped++;
      }
    }

    console.log(`💾 Saved: ${saved}, Skipped: ${skipped}`);
    return { saved, skipped };
  }

  // Fetch and save all platforms
  async fetchAndSaveAllPlatforms(limit = 25) {
    console.log('🚀 Starting content fetch from JustWatch for all platforms...\n');
    
    const results = {
      total: 0,
      byPlatform: {}
    };

    for (const [platformName, providerShortName] of Object.entries(PLATFORM_PROVIDERS)) {
      try {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Processing: ${platformName}`);
        console.log('='.repeat(60));
        
        const content = await this.fetchContentForPlatform(platformName, limit);
        const saveResult = await this.saveContentToDatabase(platformName, content);
        
        results.byPlatform[platformName] = {
          fetched: content.length,
          saved: saveResult.saved,
          skipped: saveResult.skipped
        };
        results.total += saveResult.saved;
        
        // Rate limiting between platforms
        await this.delay(1000);
      } catch (error) {
        console.error(`❌ Error processing ${platformName}:`, error.message);
        results.byPlatform[platformName] = {
          error: error.message
        };
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ All platforms processed!');
    console.log('='.repeat(60));
    console.log(`\nTotal content saved: ${results.total}`);
    console.log('\nBreakdown by platform:');
    Object.entries(results.byPlatform).forEach(([platform, stats]) => {
      if (stats.error) {
        console.log(`  ${platform}: ERROR - ${stats.error}`);
      } else {
        console.log(`  ${platform}: ${stats.saved} saved (${stats.skipped} skipped)`);
      }
    });

    return results;
  }

  // Helper: delay function for rate limiting
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new JustWatchService();
