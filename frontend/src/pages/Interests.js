import React, { useState, useEffect } from 'react';
import axios from 'axios';

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'Horror', 'Mystery',
  'Romance', 'Sci-Fi', 'Thriller', 'Western', 'Musical',
  'Biography', 'Family', 'History', 'War', 'Sports'
];

function Interests() {
  const [interests, setInterests] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [userPlatforms, setUserPlatforms] = useState([]);
  const [formData, setFormData] = useState({
    genres: [],
    preferredContentType: 'Both',
    watchingTime: 'Anytime',
    favoriteShows: [],
    favoriteMovies: []
  });
  const [newShow, setNewShow] = useState({ name: '', platform: '' });
  const [newMovie, setNewMovie] = useState({ name: '', platform: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInterests();
    fetchUserPlatforms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchRecommendations = async () => {
    try {
      setLoadingRecs(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/network/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Handle both array and object responses
      const recsData = Array.isArray(response.data) 
        ? response.data 
        : (response.data.recommendations || []);
      setRecommendations(recsData);
      setLoadingRecs(false);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
      setRecommendations([]);
      setLoadingRecs(false);
    }
  };

  const fetchInterests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/interests', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setInterests(response.data);
      setFormData({
        genres: response.data.genres || [],
        preferredContentType: response.data.preferredContentType || 'Both',
        watchingTime: response.data.watchingTime || 'Anytime',
        favoriteShows: response.data.favoriteShows || [],
        favoriteMovies: response.data.favoriteMovies || []
      });
      setLoading(false);
      
      // Fetch recommendations if user has interests
      if (response.data.genres && response.data.genres.length > 0) {
        fetchRecommendations();
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setEditing(true);
      }
      setLoading(false);
    }
  };

  const handleGenreToggle = (genre) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }));
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleAddShow = () => {
    if (newShow.name && newShow.platform) {
      setFormData(prev => ({
        ...prev,
        favoriteShows: [...prev.favoriteShows, { ...newShow, addedAt: new Date() }]
      }));
      setNewShow({ name: '', platform: '' });
    }
  };

  const handleAddMovie = () => {
    if (newMovie.name && newMovie.platform) {
      setFormData(prev => ({
        ...prev,
        favoriteMovies: [...prev.favoriteMovies, { ...newMovie, addedAt: new Date() }]
      }));
      setNewMovie({ name: '', platform: '' });
    }
  };

  const handleRemoveShow = (index) => {
    setFormData(prev => ({
      ...prev,
      favoriteShows: prev.favoriteShows.filter((_, i) => i !== index)
    }));
  };

  const handleRemoveMovie = (index) => {
    setFormData(prev => ({
      ...prev,
      favoriteMovies: prev.favoriteMovies.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/interests', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccess('Interests saved successfully!');
      setEditing(false);
      fetchInterests();
      fetchRecommendations();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save interests');
    }
  };

  if (loading) {
    return <div className="loading">Loading interests...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#667eea' }}>My Interests</h2>
          {!editing && interests && (
            <button 
              onClick={() => setEditing(true)} 
              className="btn btn-primary"
            >
              Edit Interests
            </button>
          )}
        </div>

        {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '20px' }}>{success}</div>}

        {editing ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Favorite Genres</label>
              <div className="genre-tags">
                {GENRES.map(genre => (
                  <div
                    key={genre}
                    onClick={() => handleGenreToggle(genre)}
                    className="genre-tag"
                    style={{
                      cursor: 'pointer',
                      opacity: formData.genres.includes(genre) ? 1 : 0.5,
                      transform: formData.genres.includes(genre) ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {genre}
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="preferredContentType">Preferred Content Type</label>
              <select
                id="preferredContentType"
                name="preferredContentType"
                value={formData.preferredContentType}
                onChange={handleChange}
              >
                <option value="Movies">Movies</option>
                <option value="TV Shows">TV Shows</option>
                <option value="Both">Both</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="watchingTime">Preferred Watching Time</label>
              <select
                id="watchingTime"
                name="watchingTime"
                value={formData.watchingTime}
                onChange={handleChange}
              >
                <option value="Morning">Morning</option>
                <option value="Afternoon">Afternoon</option>
                <option value="Evening">Evening</option>
                <option value="Night">Night</option>
                <option value="Anytime">Anytime</option>
              </select>
            </div>

            <div className="form-group">
              <label>Favorite Shows</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Show name"
                  value={newShow.name}
                  onChange={(e) => setNewShow({ ...newShow, name: e.target.value })}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Platform"
                  value={newShow.platform}
                  onChange={(e) => setNewShow({ ...newShow, platform: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleAddShow} className="btn btn-primary">
                  Add
                </button>
              </div>
              <div>
                {formData.favoriteShows.map((show, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '5px', marginBottom: '5px' }}>
                    <span>{show.name} - {show.platform}</span>
                    <button type="button" onClick={() => handleRemoveShow(index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Favorite Movies</label>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Movie name"
                  value={newMovie.name}
                  onChange={(e) => setNewMovie({ ...newMovie, name: e.target.value })}
                  style={{ flex: 1 }}
                />
                <input
                  type="text"
                  placeholder="Platform"
                  value={newMovie.platform}
                  onChange={(e) => setNewMovie({ ...newMovie, platform: e.target.value })}
                  style={{ flex: 1 }}
                />
                <button type="button" onClick={handleAddMovie} className="btn btn-primary">
                  Add
                </button>
              </div>
              <div>
                {formData.favoriteMovies.map((movie, index) => (
                  <div key={index} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f8f9fa', borderRadius: '5px', marginBottom: '5px' }}>
                    <span>{movie.name} - {movie.platform}</span>
                    <button type="button" onClick={() => handleRemoveMovie(index)} style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer' }}>
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary">
                Save Interests
              </button>
              {interests && (
                <button type="button" onClick={() => setEditing(false)} className="btn btn-secondary">
                  Cancel
                </button>
              )}
            </div>
          </form>
        ) : interests ? (
          <div>
            <div style={{ marginBottom: '30px' }}>
              <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Favorite Genres</h3>
              <div className="genre-tags">
                {interests.genres.map(genre => (
                  <div key={genre} className="genre-tag">
                    {genre}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginBottom: '30px' }}>
              <div>
                <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Preferences</h3>
                <p><strong>Content Type:</strong> {interests.preferredContentType}</p>
                <p><strong>Watching Time:</strong> {interests.watchingTime}</p>
              </div>
            </div>

            {interests.favoriteShows.length > 0 && (
              <div style={{ marginBottom: '30px' }}>
                <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Favorite Shows</h3>
                <div className="grid">
                  {interests.favoriteShows.map((show, index) => (
                    <div key={index} className="subscription-card">
                      <h4>{show.name}</h4>
                      <p style={{ color: '#666' }}>Platform: {show.platform}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {interests.favoriteMovies.length > 0 && (
              <div>
                <h3 style={{ marginBottom: '15px', color: '#667eea' }}>Favorite Movies</h3>
                <div className="grid">
                  {interests.favoriteMovies.map((movie, index) => (
                    <div key={index} className="subscription-card">
                      <h4>{movie.name}</h4>
                      <p style={{ color: '#666' }}>Platform: {movie.platform}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No interests set yet. Add your interests to get personalized recommendations!
          </p>
        )}
      </div>

      {/* Recommendations Section */}
      {!editing && interests && interests.genres.length > 0 && (
        <div className="card" style={{ marginTop: '30px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ color: '#667eea', fontSize: '28px', fontWeight: '700' }}>Top 10 Recommendations</h2>
            <button 
              onClick={fetchRecommendations} 
              className="btn btn-primary"
              disabled={loadingRecs}
            >
              {loadingRecs ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {userPlatforms.length > 0 && (
            <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>
              <strong style={{ color: '#2e7d32' }}>Based on your subscriptions:</strong> <span style={{ color: '#555' }}>{userPlatforms.join(', ')}</span>
            </div>
          )}

          <p style={{ color: '#666', marginBottom: '20px', fontSize: '15px' }}>
            Personalized picks based on your selected genres: <strong>{interests.genres.join(', ')}</strong>
          </p>

          {loadingRecs ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              Loading recommendations...
            </div>
          ) : recommendations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <h3 style={{ color: '#666', marginBottom: '10px' }}>No recommendations yet</h3>
              <p style={{ color: '#999', fontSize: '14px' }}>
                Add subscriptions and update your genre preferences to get personalized recommendations
              </p>
            </div>
          ) : (
            <div className="grid">
              {recommendations.map((item, index) => {
                const platformNames = item.platform ? [item.platform] : [];
                const hasAccess = platformNames.some(p => userPlatforms.includes(p));

                return (
                  <div key={item._id} className="content-card" style={{ 
                    border: hasAccess ? '2px solid #4caf50' : '1px solid #ddd',
                    position: 'relative'
                  }}>
                    <div style={{ 
                      position: 'absolute', 
                      top: '12px', 
                      left: '12px', 
                      background: '#667eea', 
                      color: 'white', 
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700'
                    }}>
                      #{index + 1}
                    </div>

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
                      <h3 style={{ marginTop: '35px', marginBottom: '10px', color: '#667eea', cursor: 'pointer' }}>
                        {item.title}
                      </h3>
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
                      {item.releaseYear && (
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
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        <span style={{ 
                          background: userPlatforms.includes(item.platform) ? '#4caf50' : '#9e9e9e',
                          color: 'white',
                          padding: '4px 10px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '600'
                        }}>
                          {item.platform}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Interests;
