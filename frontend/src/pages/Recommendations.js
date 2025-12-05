import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Recommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [totalCost, setTotalCost] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRecommendations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchRecommendations = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.get('/api/network/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setRecommendations(response.data.recommendations || []);
      setInsights(response.data.insights || null);
      setTotalCost(response.data.totalMonthlyCost || 0);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      setError(error.response?.data?.message || 'Failed to load recommendations');
      setLoading(false);
      
      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>
          <div style={styles.spinner}></div>
          <p>Loading your personalized recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>
          <h2>{error}</h2>
          <button onClick={fetchRecommendations} style={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.empty}>
          <h2>No Recommendations Yet</h2>
          <p>To get personalized recommendations:</p>
          <ul style={styles.tipsList}>
            <li>Add your streaming subscriptions</li>
            <li>Select your genre interests</li>
            <li>Make sure content is available in the database</li>
          </ul>
          <button onClick={() => navigate('/subscriptions')} style={styles.actionButton}>
            Manage Subscriptions
          </button>
          <button onClick={() => navigate('/interests')} style={styles.actionButton}>
            Set Interests
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1>Recommended for You</h1>
        <p style={styles.subtitle}>
          Based on your subscriptions and interests • Top {recommendations.length} picks
        </p>
        {totalCost > 0 && (
          <p style={styles.costBadge}>
            Monthly Cost: ${totalCost.toFixed(2)}
          </p>
        )}
      </div>

      {/* Subscription Insights Section */}
      {insights && (
        <div style={styles.insightsContainer}>
          <h2 style={styles.insightsTitle}>Subscription Insights</h2>
          
          {/* Cost Savings Alert */}
          {insights.costSavings > 0 && (
            <div style={styles.alertBox}>
              <h3>💸 Potential Savings: ${insights.costSavings}/month</h3>
              <p>We found ways you could optimize your subscriptions!</p>
            </div>
          )}

          {/* Redundant Platforms */}
          {insights.redundantPlatforms && insights.redundantPlatforms.length > 0 && (
            <div style={styles.insightCard}>
              <h3 style={styles.insightCardTitle}>Redundant Subscriptions</h3>
              {insights.redundantPlatforms.map((item, idx) => (
                <div key={idx} style={styles.insightItem}>
                  <strong>{item.platform}</strong>
                  <p>{item.reason}</p>
                  <span style={styles.savingsBadge}>Save ${item.potentialSavings}/mo</span>
                </div>
              ))}
            </div>
          )}

          {/* Underutilized Platforms */}
          {insights.underutilizedPlatforms && insights.underutilizedPlatforms.length > 0 && (
            <div style={styles.insightCard}>
              <h3 style={styles.insightCardTitle}>Underutilized Subscriptions</h3>
              {insights.underutilizedPlatforms.map((item, idx) => (
                <div key={idx} style={styles.insightItem}>
                  <strong>{item.platform}</strong>
                  <p>{item.reason}</p>
                  <span style={styles.warningBadge}>{item.matchingShows} matching shows</span>
                </div>
              ))}
            </div>
          )}

          {/* Rotation Strategy */}
          {insights.rotationStrategy && (
            <div style={styles.strategyCard}>
              <h3 style={styles.insightCardTitle}>🔄 Smart Rotation Strategy</h3>
              <div style={styles.strategyContent}>
                <p><strong>Current Platform:</strong> {insights.rotationStrategy.currentPlatform}</p>
                <p><strong>Shows Available:</strong> {insights.rotationStrategy.showsAvailable}</p>
                <div style={styles.strategySuggestion}>
                  <p><strong>Suggestion:</strong></p>
                  <p>{insights.rotationStrategy.suggestion}</p>
                  <p style={styles.savingsText}>{insights.rotationStrategy.estimatedSavings}</p>
                </div>
              </div>
            </div>
          )}

          {/* Suggested Platforms */}
          {insights.suggestedPlatforms && insights.suggestedPlatforms.length > 0 && (
            <div style={styles.insightCard}>
              <h3 style={styles.insightCardTitle}>Platforms You Might Love</h3>
              {insights.suggestedPlatforms.map((item, idx) => (
                <div key={idx} style={styles.suggestionItem}>
                  <h4>{item.platform}</h4>
                  <p>{item.reason}</p>
                  <div style={styles.topPicksList}>
                    <strong>Top Picks:</strong>
                    <ul>
                      {item.topPicks.map((show, i) => (
                        <li key={i}>{show}</li>
                      ))}
                    </ul>
                  </div>
                  <button 
                    onClick={() => navigate('/subscriptions')}
                    style={styles.addButton}
                  >
                    Add Subscription
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Recommendations Grid */}
      <div style={styles.grid}>
        {recommendations.map((item, index) => (
          <div key={item._id} style={styles.card}>
            <div style={styles.rank}>#{index + 1}</div>
            
            {item.posterUrl && (
              <img 
                src={item.posterUrl} 
                alt={item.title}
                style={styles.poster}
                onError={(e) => {e.target.style.display = 'none'}}
              />
            )}
            
            <div style={styles.cardContent}>
              <h3 style={styles.title}>{item.title}</h3>
              
              <div style={styles.meta}>
                <span style={styles.badge}>{item.type}</span>
                <span style={styles.year}>{item.releaseYear}</span>
                <span style={styles.rating}>⭐ {item.rating?.toFixed(1) || 'N/A'}</span>
              </div>

              <div style={styles.platform}>
                <span style={styles.platformBadge}>{item.platform}</span>
              </div>

              <div style={styles.genres}>
                {item.genres.map((genre, idx) => (
                  <span key={idx} style={styles.genreTag}>{genre}</span>
                ))}
              </div>

              {item.description && (
                <p style={styles.description}>{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={styles.footer}>
        <button onClick={fetchRecommendations} style={styles.refreshButton}>
          🔄 Refresh Recommendations
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px',
  },
  subtitle: {
    color: '#666',
    fontSize: '14px',
    marginTop: '10px',
  },
  costBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    display: 'inline-block',
    marginTop: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  insightsContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '40px',
  },
  insightsTitle: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  alertBox: {
    backgroundColor: '#fff3cd',
    border: '2px solid #ffc107',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
  },
  insightCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
  },
  insightCardTitle: {
    fontSize: '18px',
    marginBottom: '15px',
    color: '#333',
  },
  insightItem: {
    borderLeft: '4px solid #ff9800',
    paddingLeft: '15px',
    marginBottom: '15px',
  },
  savingsBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '5px',
  },
  warningBadge: {
    backgroundColor: '#ff9800',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 'bold',
    display: 'inline-block',
    marginTop: '5px',
  },
  strategyCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    border: '2px solid #2196f3',
  },
  strategyContent: {
    lineHeight: '1.8',
  },
  strategySuggestion: {
    backgroundColor: 'white',
    padding: '15px',
    borderRadius: '6px',
    marginTop: '15px',
  },
  savingsText: {
    color: '#4caf50',
    fontWeight: 'bold',
    marginTop: '10px',
  },
  suggestionItem: {
    borderLeft: '4px solid #2196f3',
    paddingLeft: '15px',
    marginBottom: '20px',
  },
  topPicksList: {
    marginTop: '10px',
    marginBottom: '10px',
  },
  addButton: {
    backgroundColor: '#2196f3',
    color: 'white',
    border: 'none',
    padding: '8px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '14px',
    marginTop: '10px',
  },
  loading: {
    textAlign: 'center',
    padding: '100px 20px',
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid #f3f3f3',
    borderTop: '4px solid #007bff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px',
  },
  error: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#d32f2f',
  },
  empty: {
    textAlign: 'center',
    padding: '60px 20px',
    maxWidth: '600px',
    margin: '0 auto',
  },
  tipsList: {
    textAlign: 'left',
    lineHeight: '2',
    marginBottom: '30px',
  },
  actionButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    margin: '10px',
    transition: 'background-color 0.3s',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '25px',
    marginBottom: '40px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    position: 'relative',
    cursor: 'pointer',
  },
  rank: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    backgroundColor: 'rgba(0,0,0,0.8)',
    color: '#ffd700',
    padding: '5px 12px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '14px',
    zIndex: 1,
  },
  poster: {
    width: '100%',
    height: '400px',
    objectFit: 'cover',
  },
  cardContent: {
    padding: '20px',
  },
  title: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
    color: '#333',
  },
  meta: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  badge: {
    backgroundColor: '#e3f2fd',
    color: '#1976d2',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: 'bold',
  },
  year: {
    color: '#666',
    fontSize: '14px',
  },
  rating: {
    backgroundColor: '#fff3e0',
    color: '#f57c00',
    padding: '4px 8px',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  platform: {
    marginBottom: '12px',
  },
  platformBadge: {
    backgroundColor: '#4caf50',
    color: 'white',
    padding: '6px 12px',
    borderRadius: '6px',
    fontSize: '13px',
    fontWeight: 'bold',
    display: 'inline-block',
  },
  genres: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: '12px',
  },
  genreTag: {
    backgroundColor: '#f5f5f5',
    color: '#555',
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
  },
  description: {
    color: '#666',
    fontSize: '14px',
    lineHeight: '1.5',
    marginTop: '10px',
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.3s',
  },
  retryButton: {
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '20px',
  },
};

// Add CSS for spinner animation
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15) !important;
  }
  
  button:hover {
    opacity: 0.9;
  }
`;
document.head.appendChild(styleSheet);

export default Recommendations;
