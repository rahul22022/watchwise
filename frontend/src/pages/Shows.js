import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Shows() {
  const [userPlatforms, setUserPlatforms] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    fetchUserPlatforms();
  }, []);

  const fetchUserPlatforms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/subscriptions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const platforms = response.data.subscriptions
        .filter(s => s.isActive)
        .map(s => s.serviceName);
      setUserPlatforms(platforms);
    } catch (err) {
      console.error('Failed to load subscriptions:', err);
    }
  };


  const generateWebSearchResults = (query) => {
    const lowerQuery = query.toLowerCase();
    const results = [];

    // Comprehensive mock database of popular shows/movies
    const webDatabase = [
      // Classic Movies
      { title: 'The Godfather', type: 'Movie', genres: ['Crime', 'Drama'], platforms: ['Paramount+'], year: 1972, rating: 9.2, description: 'Aging patriarch of organized crime dynasty transfers control to reluctant son' },
      { title: 'The Godfather Part II', type: 'Movie', genres: ['Crime', 'Drama'], platforms: ['Paramount+'], year: 1974, rating: 9.0, description: 'Early life of Vito Corleone in 1920s New York and his son Michael expands family crime empire' },
      { title: 'The Shawshank Redemption', type: 'Movie', genres: ['Drama'], platforms: ['Netflix'], year: 1994, rating: 9.3, description: 'Two imprisoned men bond over years, finding redemption through acts of common decency' },
      { title: 'Pulp Fiction', type: 'Movie', genres: ['Crime', 'Drama'], platforms: ['Netflix'], year: 1994, rating: 8.9, description: 'Interwoven stories of Los Angeles criminals' },
      { title: 'The Dark Knight', type: 'Movie', genres: ['Action', 'Crime', 'Drama'], platforms: ['HBO Max'], year: 2008, rating: 9.0, description: 'Batman faces the Joker in Gotham' },
      { title: 'Forrest Gump', type: 'Movie', genres: ['Drama', 'Romance'], platforms: ['Paramount+'], year: 1994, rating: 8.8, description: 'Slow-witted but kind-hearted man witnesses and influences several defining historical events' },
      { title: 'Inception', type: 'Movie', genres: ['Action', 'Sci-Fi', 'Thriller'], platforms: ['Netflix'], year: 2010, rating: 8.8, description: 'Thieves who steal corporate secrets through dream-sharing' },
      { title: 'The Matrix', type: 'Movie', genres: ['Action', 'Sci-Fi'], platforms: ['HBO Max'], year: 1999, rating: 8.7, description: 'Computer hacker learns reality is a simulation created by machines' },
      { title: 'Goodfellas', type: 'Movie', genres: ['Crime', 'Drama'], platforms: ['HBO Max'], year: 1990, rating: 8.7, description: 'Story of Henry Hill and his life in the mob' },
      { title: 'Interstellar', type: 'Movie', genres: ['Adventure', 'Drama', 'Sci-Fi'], platforms: ['Paramount+'], year: 2014, rating: 8.6, description: 'Team of explorers travel through a wormhole in space' },
      { title: 'Gladiator', type: 'Movie', genres: ['Action', 'Adventure', 'Drama'], platforms: ['Paramount+'], year: 2000, rating: 8.5, description: 'Roman general becomes a gladiator and seeks revenge' },
      { title: 'The Departed', type: 'Movie', genres: ['Crime', 'Drama', 'Thriller'], platforms: ['HBO Max'], year: 2006, rating: 8.5, description: 'Undercover cop and mole in police try to identify each other' },
      
      // Recent Hit Movies
      { title: 'Oppenheimer', type: 'Movie', genres: ['Biography', 'Drama', 'History'], platforms: ['Peacock'], year: 2023, rating: 8.5, description: 'The story of J. Robert Oppenheimer and the atomic bomb' },
      { title: 'Top Gun: Maverick', type: 'Movie', genres: ['Action', 'Drama'], platforms: ['Paramount+'], year: 2022, rating: 8.3, description: 'Maverick trains young pilots for a dangerous mission' },
      { title: 'Everything Everywhere All at Once', type: 'Movie', genres: ['Action', 'Adventure', 'Comedy'], platforms: ['Prime Video'], year: 2022, rating: 7.8, description: 'Woman explores parallel universes' },
      { title: 'The Batman', type: 'Movie', genres: ['Action', 'Crime', 'Drama'], platforms: ['HBO Max'], year: 2022, rating: 7.8, description: 'Batman investigates corruption in Gotham' },
      { title: 'Dune', type: 'Movie', genres: ['Action', 'Adventure', 'Drama'], platforms: ['HBO Max'], year: 2021, rating: 8.0, description: 'Paul Atreides leads a rebellion on Arrakis' },
      { title: 'Barbie', type: 'Movie', genres: ['Adventure', 'Comedy', 'Fantasy'], platforms: ['HBO Max'], year: 2023, rating: 6.9, description: 'Barbie and Ken explore the real world' },
      
      // Superhero Movies
      { title: 'The Avengers', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], platforms: ['Disney+'], year: 2012, rating: 8.0, description: 'Earth\'s mightiest heroes assemble' },
      { title: 'Avengers: Endgame', type: 'Movie', genres: ['Action', 'Adventure', 'Drama'], platforms: ['Disney+'], year: 2019, rating: 8.4, description: 'After devastating events, Avengers assemble once more to reverse Thanos\' actions' },
      { title: 'Avengers: Infinity War', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], platforms: ['Disney+'], year: 2018, rating: 8.4, description: 'Avengers unite to stop Thanos from collecting all Infinity Stones' },
      { title: 'Spider-Man: No Way Home', type: 'Movie', genres: ['Action', 'Adventure', 'Fantasy'], platforms: ['Disney+'], year: 2021, rating: 8.2, description: 'Spider-Man deals with his identity being revealed' },
      { title: 'Black Panther', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], platforms: ['Disney+'], year: 2018, rating: 7.3, description: 'T\'Challa returns home to be crowned King of Wakanda' },
      { title: 'Iron Man', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], platforms: ['Disney+'], year: 2008, rating: 7.9, description: 'Industrialist Tony Stark builds an armored suit' },
      
      // Action/Thriller Movies
      { title: 'Die Hard', type: 'Movie', genres: ['Action', 'Thriller'], platforms: ['Hulu'], year: 1988, rating: 8.2, description: 'NYPD officer battles terrorists in LA skyscraper' },
      { title: 'Mad Max: Fury Road', type: 'Movie', genres: ['Action', 'Adventure', 'Sci-Fi'], platforms: ['HBO Max'], year: 2015, rating: 8.1, description: 'Post-apocalyptic desert chase with rebel warrior' },
      { title: 'John Wick', type: 'Movie', genres: ['Action', 'Crime', 'Thriller'], platforms: ['Hulu'], year: 2014, rating: 7.4, description: 'Ex-hitman comes out of retirement' },
      
      // Drama Shows
      { title: 'Breaking Bad', type: 'TV Show', genres: ['Crime', 'Drama', 'Thriller'], platforms: ['Netflix'], year: 2008, rating: 9.5, description: 'A chemistry teacher turned meth manufacturer' },
      { title: 'The Sopranos', type: 'TV Show', genres: ['Crime', 'Drama'], platforms: ['HBO Max'], year: 1999, rating: 9.2, description: 'New Jersey mob boss struggles with personal and professional issues' },
      { title: 'The Wire', type: 'TV Show', genres: ['Crime', 'Drama'], platforms: ['HBO Max'], year: 2002, rating: 9.3, description: 'Baltimore drug scene through the eyes of law enforcement' },
      { title: 'Better Call Saul', type: 'TV Show', genres: ['Crime', 'Drama'], platforms: ['Netflix'], year: 2015, rating: 9.0, description: 'The transformation of lawyer Saul Goodman' },
      { title: 'Succession', type: 'TV Show', genres: ['Drama'], platforms: ['HBO Max'], year: 2018, rating: 8.9, description: 'Power struggles in a media dynasty' },
      { title: 'Mad Men', type: 'TV Show', genres: ['Drama'], platforms: ['Prime Video'], year: 2007, rating: 8.7, description: 'Drama about advertising executives in 1960s New York' },
      { title: 'The Crown', type: 'TV Show', genres: ['Drama', 'History'], platforms: ['Netflix'], year: 2016, rating: 8.6, description: 'The reign of Queen Elizabeth II' },
      { title: 'Ozark', type: 'TV Show', genres: ['Crime', 'Drama', 'Thriller'], platforms: ['Netflix'], year: 2017, rating: 8.5, description: 'Financial advisor launders money in the Ozarks' },
      { title: 'Peaky Blinders', type: 'TV Show', genres: ['Crime', 'Drama'], platforms: ['Netflix'], year: 2013, rating: 8.8, description: 'Birmingham gang family in post-WWI England' },
      { title: 'True Detective', type: 'TV Show', genres: ['Crime', 'Drama', 'Mystery'], platforms: ['HBO Max'], year: 2014, rating: 8.9, description: 'Seasonal anthology of police investigations' },
      { title: 'Euphoria', type: 'TV Show', genres: ['Drama'], platforms: ['HBO Max'], year: 2019, rating: 8.3, description: 'High school students grapple with drugs, sex, and violence' },
      
      // Fantasy/Sci-Fi Shows
      { title: 'Game of Thrones', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], platforms: ['HBO Max'], year: 2011, rating: 9.2, description: 'Nine noble families fight for control of the Seven Kingdoms' },
      { title: 'House of the Dragon', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], platforms: ['HBO Max'], year: 2022, rating: 8.4, description: 'Targaryen civil war 200 years before Game of Thrones' },
      { title: 'Stranger Things', type: 'TV Show', genres: ['Sci-Fi', 'Horror', 'Drama'], platforms: ['Netflix'], year: 2016, rating: 8.7, description: 'Kids encounter supernatural forces in 1980s Indiana' },
      { title: 'The Last of Us', type: 'TV Show', genres: ['Action', 'Adventure', 'Drama'], platforms: ['HBO Max'], year: 2023, rating: 8.8, description: 'Post-apocalyptic journey across America' },
      { title: 'The Mandalorian', type: 'TV Show', genres: ['Action', 'Adventure', 'Sci-Fi'], platforms: ['Disney+'], year: 2019, rating: 8.7, description: 'A lone bounty hunter in the Star Wars universe' },
      { title: 'The Witcher', type: 'TV Show', genres: ['Action', 'Adventure', 'Fantasy'], platforms: ['Netflix'], year: 2019, rating: 8.2, description: 'Monster hunter Geralt in a world of magic' },
      { title: 'Westworld', type: 'TV Show', genres: ['Drama', 'Mystery', 'Sci-Fi'], platforms: ['HBO Max'], year: 2016, rating: 8.5, description: 'Theme park populated by AI hosts' },
      { title: 'Black Mirror', type: 'TV Show', genres: ['Sci-Fi', 'Thriller', 'Drama'], platforms: ['Netflix'], year: 2011, rating: 8.8, description: 'Anthology exploring dark side of technology' },
      { title: 'Severance', type: 'TV Show', genres: ['Drama', 'Mystery', 'Sci-Fi'], platforms: ['Apple TV+'], year: 2022, rating: 8.7, description: 'Employees surgically divide work and personal memories' },
      
      // Comedy Shows
      { title: 'The Office', type: 'TV Show', genres: ['Comedy'], platforms: ['Peacock'], year: 2005, rating: 9.0, description: 'A mockumentary on office workers' },
      { title: 'Friends', type: 'TV Show', genres: ['Comedy', 'Romance'], platforms: ['HBO Max'], year: 1994, rating: 8.9, description: 'Six friends navigate life in New York' },
      { title: 'Ted Lasso', type: 'TV Show', genres: ['Comedy', 'Drama', 'Sport'], platforms: ['Apple TV+'], year: 2020, rating: 8.8, description: 'American football coach manages a British soccer team' },
      { title: 'The Bear', type: 'TV Show', genres: ['Comedy', 'Drama'], platforms: ['Hulu'], year: 2022, rating: 8.6, description: 'Chef returns to run family sandwich shop' },
      { title: 'Only Murders in the Building', type: 'TV Show', genres: ['Comedy', 'Crime', 'Mystery'], platforms: ['Hulu'], year: 2021, rating: 8.1, description: 'Three strangers investigate murders in their building' },
      { title: 'The White Lotus', type: 'TV Show', genres: ['Comedy', 'Drama', 'Mystery'], platforms: ['HBO Max'], year: 2021, rating: 8.0, description: 'Guests and employees at a tropical resort' },
      { title: 'Wednesday', type: 'TV Show', genres: ['Comedy', 'Horror', 'Mystery'], platforms: ['Netflix'], year: 2022, rating: 8.1, description: 'Wednesday Addams at Nevermore Academy' },
      
      // Action/Adventure Shows
      { title: 'The Boys', type: 'TV Show', genres: ['Action', 'Comedy', 'Crime'], platforms: ['Prime Video'], year: 2019, rating: 8.7, description: 'Vigilantes take down corrupt superheroes' },
      { title: 'Yellowstone', type: 'TV Show', genres: ['Drama', 'Western'], platforms: ['Peacock'], year: 2018, rating: 8.7, description: 'Montana ranching family protects their land' },
      { title: 'The Handmaid\'s Tale', type: 'TV Show', genres: ['Drama', 'Sci-Fi', 'Thriller'], platforms: ['Hulu'], year: 2017, rating: 8.4, description: 'Dystopian future where women are enslaved' },
      { title: 'Reacher', type: 'TV Show', genres: ['Action', 'Crime', 'Drama'], platforms: ['Prime Video'], year: 2022, rating: 8.0, description: 'Former military police officer investigates deadly conspiracy' }
    ];

    // Search algorithm
    webDatabase.forEach(item => {
      const titleMatch = item.title.toLowerCase().includes(lowerQuery);
      const genreMatch = item.genres.some(g => g.toLowerCase().includes(lowerQuery));
      const platformMatch = item.platforms.some(p => p.toLowerCase().includes(lowerQuery));
      const descriptionMatch = item.description.toLowerCase().includes(lowerQuery);
      
      if (titleMatch || genreMatch || platformMatch || descriptionMatch) {
        results.push({
          ...item,
          source: 'web',
          _id: `web-${item.title.replace(/\s/g, '-').toLowerCase()}`
        });
      }
    });

    return results.slice(0, 20);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      setError('Please enter a search query');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);

    try {
      // Try OMDB API first (free, no key required for basic search)
      const omdbResponse = await axios.get(`https://www.omdbapi.com/?apikey=trilogy&s=${encodeURIComponent(searchQuery)}&type=movie`);
      
      if (omdbResponse.data.Response === 'True' && omdbResponse.data.Search) {
        // Get detailed info for each result (up to 10)
        const detailedPromises = omdbResponse.data.Search.slice(0, 10).map(movie => 
          axios.get(`https://www.omdbapi.com/?apikey=trilogy&i=${movie.imdbID}&plot=short`)
        );
        
        const detailedResults = await Promise.all(detailedPromises);
        
        const formattedResults = detailedResults.map(res => {
          const data = res.data;
          // Map to popular platforms based on year and type
          const platforms = guessPlatform(data.Year, data.Genre);
          
          return {
            _id: `omdb-${data.imdbID}`,
            title: data.Title,
            type: data.Type === 'series' ? 'TV Show' : 'Movie',
            genres: data.Genre ? data.Genre.split(', ') : [],
            platforms: platforms,
            year: parseInt(data.Year),
            rating: data.imdbRating !== 'N/A' ? parseFloat(data.imdbRating) : null,
            description: data.Plot !== 'N/A' ? data.Plot : 'No description available',
            source: 'omdb'
          };
        });
        
        setSearchResults(formattedResults);
        setSearchLoading(false);
        return;
      }
    } catch (apiError) {
      console.log('OMDB API failed, using local database:', apiError);
    }

    // Fallback to local database
    setTimeout(() => {
      const results = generateWebSearchResults(searchQuery);
      setSearchResults(results);
      setSearchLoading(false);
      
      if (results.length === 0) {
        setError('No results found. Try a different search term.');
        setTimeout(() => setError(''), 3000);
      }
    }, 500);
  };

  // Guess platform based on year and genre
  const guessPlatform = (year, genreString) => {
    const yearNum = parseInt(year);
    const genres = genreString ? genreString.toLowerCase() : '';
    
    // Recent content (2020+)
    if (yearNum >= 2020) {
      if (genres.includes('animation') || genres.includes('family')) return ['Disney+'];
      if (genres.includes('sci-fi') || genres.includes('fantasy')) return ['HBO Max', 'Netflix'];
      if (genres.includes('action') || genres.includes('thriller')) return ['Netflix', 'Prime Video'];
      if (genres.includes('comedy')) return ['Hulu', 'Netflix'];
      if (genres.includes('drama')) return ['HBO Max', 'Netflix'];
      return ['Netflix', 'Prime Video'];
    }
    
    // Classic content (pre-2000)
    if (yearNum < 2000) {
      if (genres.includes('animation')) return ['Disney+'];
      return ['Paramount+', 'HBO Max'];
    }
    
    // 2000-2019
    if (genres.includes('animation')) return ['Disney+'];
    if (genres.includes('action') || genres.includes('superhero')) return ['Disney+', 'HBO Max'];
    if (genres.includes('drama') || genres.includes('crime')) return ['HBO Max', 'Netflix'];
    if (genres.includes('comedy')) return ['HBO Max', 'Peacock'];
    
    return ['Netflix', 'Prime Video'];
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setHasSearched(false);
  };

  const addToWatchlist = async (contentItem) => {
    try {
      const token = localStorage.getItem('token');
      
      // For search results (web or OMDB), create watchlist with custom fields
      const isSearchResult = contentItem._id.startsWith('web-') || contentItem._id.startsWith('omdb-');
      
      const contentData = isSearchResult
        ? {
            customTitle: contentItem.title,
            customType: contentItem.type,
            status: 'Want to Watch',
            priority: 'Medium',
            notes: `${contentItem.description || ''}\n\nGenres: ${contentItem.genres.join(', ')}\nPlatforms: ${contentItem.platforms.join(', ')}\nRating: ${contentItem.rating || 'N/A'}`
          }
        : { contentId: contentItem._id };
      
      const response = await axios.post('/api/watchlist', 
        contentData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.existing) {
        setSuccess(`"${contentItem.title}" is already in your watchlist!`);
      } else {
        setSuccess(`✅ Added "${contentItem.title}" to watchlist!`);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error adding to watchlist:', err);
      setError(err.response?.data?.message || 'Failed to add to watchlist');
      setTimeout(() => setError(''), 3000);
    }
  };

  const addToInterests = async (show) => {
    try {
      const token = localStorage.getItem('token');
      
      // Add each genre from the show as an interest
      const promises = show.genres.map(genre =>
        axios.post('/api/interests',
          { name: genre },
          { headers: { Authorization: `Bearer ${token}` } }
        ).catch(err => {
          // Ignore duplicate errors
          if (!err.response?.data?.message?.includes('already exists')) {
            throw err;
          }
        })
      );

      await Promise.all(promises);
      setSuccess(`Added "${show.title}" genres to your interests!`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add to interests');
      setTimeout(() => setError(''), 3000);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2 style={{ color: '#667eea', marginBottom: '20px', fontSize: '28px', fontWeight: '700' }}>
          Search Shows & Movies
        </h2>

        {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '20px' }}>{success}</div>}

        {userPlatforms.length > 0 && (
          <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
            <strong style={{ color: '#2e7d32' }}>Your Active Subscriptions:</strong> <span style={{ color: '#555' }}>{userPlatforms.join(', ')}</span>
          </div>
        )}

        {/* Search Bar */}
        <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
          <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
            <label style={{ display: 'block', color: 'white', marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>
              Search IMDB Database
            </label>
            <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: '13px', marginBottom: '12px' }}>
              Try: "godfather", "inception", "breaking bad"
            </p>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              <input
                type="text"
                placeholder="Search for any show or movie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ 
                  flex: '1 1 auto', 
                  minWidth: '200px',
                  padding: '14px', 
                  borderRadius: '8px', 
                  border: 'none',
                  fontSize: '15px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}
              />
              <button type="submit" className="btn" style={{ 
                background: 'white', 
                color: '#667eea',
                fontWeight: '700',
                padding: '14px 28px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }} disabled={searchLoading}>
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
              {hasSearched && (
                <button 
                  type="button" 
                  onClick={clearSearch} 
                  className="btn" 
                  style={{ 
                    background: '#dc3545', 
                    color: 'white', 
                    whiteSpace: 'nowrap',
                    padding: '14px 24px',
                    flexShrink: 0
                  }}
                >
                  Clear
                </button>
              )}
            </div>
            <p style={{ color: 'rgba(255,255,255,0.9)', marginTop: '10px', fontSize: '13px' }}>
              Searches real IMDB database. Click "Track Genres" to add genres to your interests.
            </p>
          </div>
        </form>

        {hasSearched && searchResults.length > 0 && (
          <div style={{ background: '#e3f2fd', padding: '15px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #90caf9' }}>
            <strong style={{ color: '#1565c0' }}>Search Results:</strong> <span style={{ color: '#424242' }}>Found {searchResults.length} shows/movies from IMDB</span>
          </div>
        )}

        {/* Results */}
        {hasSearched && searchResults.length === 0 && !searchLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: '#666' }}>No results found</h3>
            <p style={{ color: '#999' }}>Try a different search term</p>
          </div>
        ) : !hasSearched ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '24px', fontWeight: '600' }}>Start Searching</h3>
            <p style={{ color: '#666', marginBottom: '25px', fontSize: '15px' }}>
              Search for any show or movie from IMDB database
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '10px', maxWidth: '600px', margin: '0 auto' }}>
              <span style={{ background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', fontSize: '14px' }}>Breaking Bad</span>
              <span style={{ background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', fontSize: '14px' }}>Game of Thrones</span>
              <span style={{ background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', fontSize: '14px' }}>Stranger Things</span>
              <span style={{ background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', fontSize: '14px' }}>Ted Lasso</span>
              <span style={{ background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', fontSize: '14px' }}>The Office</span>
              <span style={{ background: '#f5f5f5', padding: '8px 15px', borderRadius: '20px', fontSize: '14px' }}>Oppenheimer</span>
            </div>
          </div>
        ) : (
          <div className="grid">
            {searchResults.map((item) => {
              const platformNames = item.platforms ? 
                (Array.isArray(item.platforms) ? 
                  item.platforms : 
                  [item.platform]) : 
                (item.platform ? [item.platform] : []);
              
              const hasAccess = platformNames.some(p => userPlatforms.includes(p));

              return (
                <div key={item._id} className="content-card" style={{ 
                  border: hasAccess ? '2px solid #4caf50' : '1px solid #ddd',
                  position: 'relative'
                }}>
                  {hasAccess && (
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      right: '12px', 
                      background: '#4caf50', 
                      color: 'white', 
                      padding: '5px 12px', 
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '600',
                      letterSpacing: '0.5px'
                    }}>
                      YOU HAVE ACCESS
                    </div>
                  )}
                  
                  <a 
                    href={`https://www.imdb.com/find?q=${encodeURIComponent(item.title)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ textDecoration: 'none' }}
                  >
                    <h3 style={{ marginBottom: '10px', color: '#667eea', cursor: 'pointer' }}>{item.title}</h3>
                  </a>
                  
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>
                      {item.type}
                    </span>
                    {item.rating && (
                      <span style={{ background: '#fff3e0', color: '#f57c00', padding: '4px 10px', borderRadius: '4px', fontSize: '13px', fontWeight: '600' }}>
                        {item.rating} / 10
                      </span>
                    )}
                    {item.year && (
                      <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>
                        {item.year}
                      </span>
                    )}
                    {item.releaseYear && !item.year && (
                      <span style={{ background: '#f3e5f5', color: '#7b1fa2', padding: '4px 10px', borderRadius: '4px', fontSize: '13px' }}>
                        {item.releaseYear}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: '10px' }}>
                    {(item.genres || []).map((genre, idx) => (
                      <span key={idx} style={{ 
                        display: 'inline-block',
                        background: '#f5f5f5', 
                        padding: '3px 8px', 
                        borderRadius: '3px', 
                        fontSize: '12px',
                        marginRight: '5px',
                        marginBottom: '5px'
                      }}>
                        {genre}
                      </span>
                    ))}
                  </div>

                  {item.description && (
                    <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px', lineHeight: '1.5' }}>
                      {item.description.substring(0, 100)}{item.description.length > 100 ? '...' : ''}
                    </p>
                  )}

                  <div style={{ borderTop: '1px solid #eee', paddingTop: '10px', marginTop: '10px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px', color: '#555' }}>
                      Available on:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px' }}>
                      {platformNames.map((platform, idx) => (
                        <span key={idx} style={{ 
                          background: userPlatforms.includes(platform) ? '#4caf50' : '#9e9e9e',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                    <button 
                      onClick={() => addToWatchlist(item)}
                      className="btn btn-primary"
                      style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                    >
                      + Watchlist
                    </button>
                    <button 
                      onClick={() => addToInterests(item)}
                      className="btn btn-secondary"
                      style={{ flex: 1, fontSize: '13px', padding: '8px' }}
                    >
                      Track Genres
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Shows;
