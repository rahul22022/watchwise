import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTitle, setSearchTitle] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [customEntry, setCustomEntry] = useState({
    customTitle: '',
    customType: 'Movie',
    status: 'Want to Watch',
    priority: 'Medium'
  });

  useEffect(() => {
    fetchWatchlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchWatchlist = async () => {
    try {
      const token = localStorage.getItem('token');
      let url = '/api/watchlist';
      if (filterStatus && filterStatus !== 'All') {
        url += `?status=${filterStatus}`;
      }
      
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setWatchlist(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load watchlist');
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTitle.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/api/watchlist/search-add',
        { title: searchTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSearchResult(response.data);
      
      if (!response.data.found) {
        setCustomEntry({ ...customEntry, customTitle: searchTitle });
      }
    } catch (err) {
      setError('Search failed');
    }
  };

  const addFromSearch = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/watchlist',
        { 
          contentId: searchResult.content._id,
          status: 'Want to Watch'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Added to watchlist!');
      setSearchResult(null);
      setSearchTitle('');
      setShowAddForm(false);
      fetchWatchlist();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const addCustomEntry = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/watchlist',
        customEntry,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Added to watchlist!');
      setCustomEntry({
        customTitle: '',
        customType: 'Movie',
        status: 'Want to Watch',
        priority: 'Medium'
      });
      setShowAddForm(false);
      setSearchResult(null);
      fetchWatchlist();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add to watchlist');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/watchlist/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchWatchlist();
    } catch (err) {
      setError('Failed to update status');
    }
  };

  const deleteItem = async (id) => {
    if (window.confirm('Remove from watchlist?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`/api/watchlist/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSuccess('Removed from watchlist');
        fetchWatchlist();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to delete item');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading watchlist...</div>;
  }

  return (
    <div className="container">
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#667eea', fontSize: '28px', fontWeight: '700' }}>My Watchlist</h2>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn btn-primary"
          >
            {showAddForm ? 'Cancel' : '+ Add to Watchlist'}
          </button>
        </div>

        {error && <div className="error" style={{ marginBottom: '20px' }}>{error}</div>}
        {success && <div className="success" style={{ marginBottom: '20px' }}>{success}</div>}

        {/* Add Form */}
        {showAddForm && (
          <div className="card" style={{ background: '#f8f9fa', marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '20px' }}>Search & Add to Watchlist</h3>
            
            {/* Search */}
            <form onSubmit={handleSearch} style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Enter show or movie name..."
                  value={searchTitle}
                  onChange={(e) => setSearchTitle(e.target.value)}
                  style={{ flex: 1 }}
                  required
                />
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </div>
            </form>

            {/* Search Result */}
            {searchResult && searchResult.found && (
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
                <h4 style={{ color: '#667eea', marginBottom: '10px' }}>{searchResult.content.title}</h4>
                <p style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>
                  {searchResult.content.type} • {searchResult.content.releaseYear}
                </p>
                <p style={{ fontSize: '14px', marginBottom: '15px' }}>{searchResult.content.description}</p>
                
                <div style={{ marginBottom: '15px' }}>
                  <strong>Best way to watch:</strong>
                  <div style={{ 
                    background: searchResult.bestOption.userHasSubscription ? '#d4edda' : '#fff3cd',
                    padding: '10px',
                    borderRadius: '6px',
                    marginTop: '8px'
                  }}>
                    <p style={{ fontWeight: '600' }}>{searchResult.bestOption.platform}</p>
                    <p style={{ fontSize: '14px' }}>
                      {searchResult.bestOption.userHasSubscription 
                        ? 'Already subscribed - Watch now!' 
                        : `${searchResult.bestOption.message} - $${searchResult.bestOption.cost}/month`}
                    </p>
                  </div>
                </div>

                <button onClick={addFromSearch} className="btn btn-primary">
                  Add to Watchlist
                </button>
              </div>
            )}

            {/* Custom Entry Form */}
            {(!searchResult || !searchResult.found) && (
              <form onSubmit={addCustomEntry}>
                <h4 style={{ marginBottom: '15px' }}>Or add a custom entry</h4>
                
                <div className="form-group">
                  <label>Title</label>
                  <input
                    type="text"
                    value={customEntry.customTitle}
                    onChange={(e) => setCustomEntry({ ...customEntry, customTitle: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <select
                    value={customEntry.customType}
                    onChange={(e) => setCustomEntry({ ...customEntry, customType: e.target.value })}
                  >
                    <option value="Movie">Movie</option>
                    <option value="TV Show">TV Show</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={customEntry.status}
                    onChange={(e) => setCustomEntry({ ...customEntry, status: e.target.value })}
                  >
                    <option value="Want to Watch">Want to Watch</option>
                    <option value="Currently Watching">Currently Watching</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={customEntry.priority}
                    onChange={(e) => setCustomEntry({ ...customEntry, priority: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Add Custom Entry
                </button>
              </form>
            )}
          </div>
        )}

        {/* Filter */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>Filter by Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '2px solid #e0e0e0' }}
          >
            <option value="All">All</option>
            <option value="Want to Watch">Want to Watch</option>
            <option value="Currently Watching">Currently Watching</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Watchlist Items */}
        {watchlist.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#666', padding: '40px' }}>
            No items in your watchlist. Start adding shows and movies!
          </p>
        ) : (
          <div className="grid">
            {watchlist.map((item) => {
              const title = item.content?.title || item.customTitle;
              const type = item.content?.type || item.customType;
              
              return (
                <div key={item._id} className="subscription-card">
                  <div style={{ marginBottom: '15px' }}>
                    <h3 style={{ color: '#667eea', marginBottom: '5px' }}>{title}</h3>
                    <span className="badge" style={{ background: '#e3f2fd', color: '#333' }}>
                      {type}
                    </span>
                    <span 
                      className="badge" 
                      style={{ 
                        marginLeft: '5px',
                        background: item.priority === 'High' ? '#ffebee' : item.priority === 'Medium' ? '#fff8e1' : '#f1f8e9',
                        color: '#333'
                      }}
                    >
                      {item.priority} Priority
                    </span>
                  </div>

                  <div className="form-group">
                    <label style={{ fontSize: '14px' }}>Status</label>
                    <select
                      value={item.status}
                      onChange={(e) => updateStatus(item._id, e.target.value)}
                      style={{ padding: '8px' }}
                    >
                      <option value="Want to Watch">Want to Watch</option>
                      <option value="Currently Watching">Currently Watching</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>

                  {item.recommendedPlatforms && item.recommendedPlatforms.length > 0 && (
                    <div style={{ marginBottom: '15px' }}>
                      <strong style={{ fontSize: '14px' }}>Where to watch:</strong>
                      <div style={{ marginTop: '8px' }}>
                        {item.recommendedPlatforms.slice(0, 3).map((rec, idx) => (
                          <div 
                            key={idx}
                            style={{ 
                              background: rec.userHasSubscription ? '#d4edda' : '#fff3cd',
                              padding: '8px',
                              borderRadius: '6px',
                              marginBottom: '5px',
                              fontSize: '13px'
                            }}
                          >
                            <strong>{rec.platform}</strong>
                            {rec.userHasSubscription ? ' (Subscribed)' : ` - $${rec.cost}/mo`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.notes && (
                    <p style={{ fontSize: '14px', color: '#666', fontStyle: 'italic', marginBottom: '15px' }}>
                      {item.notes}
                    </p>
                  )}

                  <button 
                    onClick={() => deleteItem(item._id)}
                    className="btn btn-danger"
                    style={{ width: '100%' }}
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Watchlist;
