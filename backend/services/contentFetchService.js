const axios = require('axios');
const NetworkContent = require('../models/NetworkContent');

// Platform to TMDB watch provider ID mapping
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

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

class ContentFetchService {
  constructor() {
    // You'll need to get a free API key from https://www.themoviedb.org/settings/api
    this.tmdbApiKey = process.env.TMDB_API_KEY || 'YOUR_TMDB_API_KEY_HERE';
    this.tmdbBaseUrl = 'https://api.themoviedb.org/3';
  }

  async fetchContentForPlatform(platformName, limit = 25) {
    const providerId = PLATFORM_PROVIDERS[platformName];
    if (!providerId) {
      throw new Error(`Provider ID not found for platform: ${platformName}`);
    }

    let allContent = [];
    const itemsPerGenre = Math.ceil(limit / GENRES.length);

    for (const genre of GENRES) {
      try {
        // Fetch movies
        const movies = await this.fetchMoviesByGenreAndProvider(genre.id, providerId, itemsPerGenre);
        allContent = allContent.concat(movies);

        // Fetch TV shows
        const tvShows = await this.fetchTVShowsByGenreAndProvider(genre.id, providerId, itemsPerGenre);
        allContent = allContent.concat(tvShows);

        // Add delay to respect API rate limits
        await this.delay(250);
      } catch (error) {
        console.error(`Error fetching ${genre.name} for ${platformName}:`, error.message);
      }
    }

    // Remove duplicates and limit
    const uniqueContent = this.removeDuplicates(allContent);
    return uniqueContent.slice(0, limit);
  }

  async fetchMoviesByGenreAndProvider(genreId, providerId, limit = 5) {
    try {
      const response = await axios.get(`${this.tmdbBaseUrl}/discover/movie`, {
        params: {
          api_key: this.tmdbApiKey,
          with_genres: genreId,
          with_watch_providers: providerId,
          watch_region: 'US',
          sort_by: 'popularity.desc',
          page: 1
        }
      });

      return response.data.results.slice(0, limit).map(movie => ({
        title: movie.title,
        type: 'Movie',
        genres: this.getGenreNames(movie.genre_ids),
        description: movie.overview,
        releaseYear: movie.release_date ? new Date(movie.release_date).getFullYear() : null,
        rating: movie.vote_average ? Math.round(movie.vote_average * 10) / 10 : null,
        tmdbId: movie.id.toString(),
        posterUrl: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : null,
        backdropUrl: movie.backdrop_path ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}` : null,
        externalSource: 'tmdb'
      }));
    } catch (error) {
      console.error(`Error fetching movies for genre ${genreId}:`, error.message);
      return [];
    }
  }

  async fetchTVShowsByGenreAndProvider(genreId, providerId, limit = 5) {
    try {
      const response = await axios.get(`${this.tmdbBaseUrl}/discover/tv`, {
        params: {
          api_key: this.tmdbApiKey,
          with_genres: genreId,
          with_watch_providers: providerId,
          watch_region: 'US',
          sort_by: 'popularity.desc',
          page: 1
        }
      });

      return response.data.results.slice(0, limit).map(show => ({
        title: show.name,
        type: 'TV Show',
        genres: this.getGenreNames(show.genre_ids),
        description: show.overview,
        releaseYear: show.first_air_date ? new Date(show.first_air_date).getFullYear() : null,
        rating: show.vote_average ? Math.round(show.vote_average * 10) / 10 : null,
        tmdbId: show.id.toString(),
        posterUrl: show.poster_path ? `https://image.tmdb.org/t/p/w500${show.poster_path}` : null,
        backdropUrl: show.backdrop_path ? `https://image.tmdb.org/t/p/w1280${show.backdrop_path}` : null,
        externalSource: 'tmdb'
      }));
    } catch (error) {
      console.error(`Error fetching TV shows for genre ${genreId}:`, error.message);
      return [];
    }
  }

  getGenreNames(genreIds) {
    return genreIds.map(id => {
      const genre = GENRES.find(g => g.id === id);
      return genre ? genre.name : null;
    }).filter(Boolean);
  }

  removeDuplicates(content) {
    const seen = new Set();
    return content.filter(item => {
      const key = `${item.title}-${item.type}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async saveContentToDatabase(platformName, content) {
    const results = {
      inserted: 0,
      updated: 0,
      failed: 0
    };

    for (const item of content) {
      try {
        await NetworkContent.findOneAndUpdate(
          { title: item.title, platform: platformName },
          { 
            ...item, 
            platform: platformName,
            lastUpdated: new Date()
          },
          { upsert: true, new: true }
        );
        results.inserted++;
      } catch (error) {
        console.error(`Error saving ${item.title}:`, error.message);
        results.failed++;
      }
    }

    return results;
  }

  async fetchAndSaveAllPlatforms(limit = 25) {
    const platforms = Object.keys(PLATFORM_PROVIDERS);
    const summary = [];

    for (const platform of platforms) {
      console.log(`Fetching content for ${platform}...`);
      try {
        const content = await this.fetchContentForPlatform(platform, limit);
        const results = await this.saveContentToDatabase(platform, content);
        
        summary.push({
          platform,
          fetched: content.length,
          ...results
        });

        console.log(`✓ ${platform}: Fetched ${content.length}, Saved ${results.inserted}`);
        
        // Delay between platforms
        await this.delay(1000);
      } catch (error) {
        console.error(`Error processing ${platform}:`, error.message);
        summary.push({
          platform,
          error: error.message
        });
      }
    }

    return summary;
  }
}

module.exports = new ContentFetchService();
