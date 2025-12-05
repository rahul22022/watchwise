import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const Recommendations = () => {
  const [optimization, setOptimization] = useState(null);
  const [schedule, setSchedule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeView, setActiveView] = useState('schedule'); // 'schedule', 'savings', 'rotation'
  const navigate = useNavigate();

  useEffect(() => {
    fetchOptimizationData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchOptimizationData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);

      // Fetch optimization recommendations
      const optResponse = await axios.get('/api/optimization/recommendations', {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Fetch subscription schedule
      const schedResponse = await axios.get('/api/optimization/schedule', {
        headers: { Authorization: `Bearer ${token}` }
      });

      setOptimization(optResponse.data.recommendations);
      setSchedule(schedResponse.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching optimization data:', error);
      setError(error.response?.data?.message || 'Failed to load recommendations');
      setLoading(false);

      if (error.response?.status === 401) {
        navigate('/login');
      }
    }
  };

  const addToWatchlist = async (item) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await axios.post(
        '/api/watchlist',
        {
          customTitle: item.title,
          customType: item.type || 'TV Show',
          status: 'Want to Watch',
          notes: `From ${item.platform} - Added from rotation plan`
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Check if item already exists (backend returns existing: true)
      if (response.data.existing) {
        alert(`"${item.title}" is already in your watchlist!`);
      } else {
        alert(`✅ "${item.title}" added to your watchlist!`);
      }
    } catch (error) {
      console.error('Error adding to watchlist:', error);
      alert('Failed to add to watchlist. Please try again.');
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>🤖</div>
            <h2 style={{ color: '#667eea', marginBottom: '10px' }}>Analyzing Your Subscriptions...</h2>
            <p style={{ color: '#666' }}>Our AI is reviewing your data to find the best savings opportunities</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>⚠️</div>
            <h2 style={{ color: '#666', marginBottom: '10px' }}>Error</h2>
            <p style={{ color: '#999', marginBottom: '20px' }}>{error}</p>
            <button onClick={fetchOptimizationData} className="btn btn-primary">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!optimization) {
    return (
      <div className="container">
        <div className="card">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>📊</div>
            <h2 style={{ color: '#667eea', marginBottom: '15px' }}>No Subscriptions to Analyze</h2>
            <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
              Add your subscriptions to get personalized optimization recommendations and save money!
            </p>
            <button
              onClick={() => navigate('/subscriptions')}
              className="btn btn-primary"
              style={{ fontSize: '16px', padding: '12px 30px' }}
            >
              Add Subscriptions
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header */}
      <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <h1 style={{ marginBottom: '10px', fontSize: '32px' }}>💰 Subscription Optimizer</h1>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>AI-powered recommendations to save money on your subscriptions</p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', opacity: 0.8, marginBottom: '5px' }}>Current Monthly Spending</div>
            <div style={{ fontSize: '36px', fontWeight: '700' }}>
              {formatCurrency(optimization.currentSpending)}
            </div>
          </div>
        </div>
      </div>

      {/* View Tabs */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          borderBottom: '2px solid #e0e0e0',
          flexWrap: 'wrap'
        }}>
          <button
            onClick={() => setActiveView('schedule')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'schedule' ? '3px solid #667eea' : '3px solid transparent',
              color: activeView === 'schedule' ? '#667eea' : '#666',
              fontWeight: activeView === 'schedule' ? '600' : '400',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            📅 3-Month Schedule
          </button>
          <button
            onClick={() => setActiveView('savings')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'savings' ? '3px solid #667eea' : '3px solid transparent',
              color: activeView === 'savings' ? '#667eea' : '#666',
              fontWeight: activeView === 'savings' ? '600' : '400',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            💰 Savings
          </button>
          <button
            onClick={() => setActiveView('rotation')}
            style={{
              padding: '12px 24px',
              background: 'none',
              border: 'none',
              borderBottom: activeView === 'rotation' ? '3px solid #667eea' : '3px solid transparent',
              color: activeView === 'rotation' ? '#667eea' : '#666',
              fontWeight: activeView === 'rotation' ? '600' : '400',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s'
            }}
          >
            🔄 Rotation Plan
          </button>
        </div>
      </div>

      {/* 3-Month Schedule Tab */}
      {activeView === 'schedule' && (
        <>
          {optimization.spendingBreakdown && optimization.spendingBreakdown.threeMonthSchedule && optimization.spendingBreakdown.threeMonthSchedule.length > 0 ? (
            <>
              {/* Info Banner */}
              <div className="card" style={{ marginBottom: '20px', background: '#e3f2fd', border: '1px solid #2196f3' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px' }}>ℹ️</div>
                  <div>
                    <div style={{ fontSize: '14px', color: '#1565c0', fontWeight: '600', marginBottom: '4px' }}>
                      Using Your Subscriptions
                    </div>
                    <div style={{ fontSize: '13px', color: '#1976d2' }}>
                      This analysis uses subscriptions from your Subscriptions page. Add or update subscriptions there to see updated recommendations.
                    </div>
                  </div>
                </div>
              </div>

              {/* Recommendations Summary */}
              {(optimization.recommendations.keep.length > 0 || optimization.recommendations.cancel.length > 0) && (
                <div className="card" style={{ marginBottom: '20px' }}>
                  <h2 style={{ color: '#667eea', marginBottom: '15px', fontSize: '20px' }}>
                    💡 Quick Recommendations
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '15px' }}>
                    {optimization.recommendations.keep.length > 0 && (
                      <div style={{ padding: '15px', background: '#f1f8f4', borderLeft: '3px solid #4caf50', borderRadius: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#2e7d32', marginBottom: '10px' }}>
                          ✅ Keep ({optimization.recommendations.keep.length})
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {optimization.recommendations.keep.slice(0, 2).map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '6px' }}>{item}</div>
                          ))}
                          {optimization.recommendations.keep.length > 2 && (
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                              +{optimization.recommendations.keep.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {optimization.recommendations.cancel.length > 0 && (
                      <div style={{ padding: '15px', background: '#fff3e0', borderLeft: '3px solid #ff9800', borderRadius: '6px' }}>
                        <div style={{ fontSize: '14px', fontWeight: '600', color: '#e65100', marginBottom: '10px' }}>
                          ⚠️ Consider Rotating ({optimization.recommendations.cancel.length})
                        </div>
                        <div style={{ fontSize: '13px', color: '#666' }}>
                          {optimization.recommendations.cancel.slice(0, 2).map((item, idx) => (
                            <div key={idx} style={{ marginBottom: '6px' }}>{item}</div>
                          ))}
                          {optimization.recommendations.cancel.length > 2 && (
                            <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
                              +{optimization.recommendations.cancel.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="card" style={{ marginBottom: '20px' }}>
                <h2 style={{ color: '#667eea', marginBottom: '20px', fontSize: '24px' }}>
                  📅 Next 3 Months Schedule
                </h2>
            
            {optimization.spendingBreakdown.threeMonthSchedule.map((month, index) => (
              <div
                key={index}
                style={{
                  marginBottom: '20px',
                  padding: '20px',
                  background: index === 0 ? '#f5f7ff' : index === 1 ? '#fff8e1' : '#f1f8f4',
                  border: index === 0 ? '2px solid #667eea' : '1px solid #e0e0e0',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ color: '#333', fontSize: '20px', fontWeight: '600' }}>
                    {index === 0 ? '▶️ ' : ''}{month.month}
                    {index === 0 && <span style={{ fontSize: '14px', color: '#667eea', marginLeft: '10px' }}>(Current)</span>}
                    {index === 1 && <span style={{ fontSize: '14px', color: '#ff9800', marginLeft: '10px' }}>(With Recommendations)</span>}
                  </h3>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: index === 0 ? '#667eea' : '#4caf50' }}>
                      {formatCurrency(month.total)}
                    </div>
                    {index > 0 && optimization.spendingBreakdown.monthlySavings > 0 && (
                      <div style={{ fontSize: '12px', color: '#4caf50', marginTop: '4px' }}>
                        💰 Saves {formatCurrency(optimization.spendingBreakdown.monthlySavings)}/mo
                      </div>
                    )}
                  </div>
                </div>

                {/* Active Subscriptions */}
                <div style={{ marginBottom: '15px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
                    Active Subscriptions ({month.subscriptions.length}):
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {month.subscriptions.map((sub, subIdx) => (
                      <div
                        key={subIdx}
                        style={{
                          padding: '8px 14px',
                          background: 'white',
                          border: '2px solid #667eea',
                          borderRadius: '6px',
                          fontSize: '13px'
                        }}
                      >
                        <div style={{ fontWeight: '600', color: '#333' }}>{sub.name}</div>
                        <div style={{ fontSize: '12px', color: '#667eea' }}>{formatCurrency(sub.cost)}/mo</div>
                        {sub.watchlistItems > 0 && (
                          <div style={{ fontSize: '11px', color: '#4caf50', marginTop: '2px' }}>
                            📺 {sub.watchlistItems} items
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Content */}
                {month.availableContent && month.availableContent.length > 0 && (
                  <div style={{ marginTop: '15px', padding: '12px', background: 'rgba(255,255,255,0.6)', borderRadius: '6px' }}>
                    <div style={{ fontSize: '13px', color: '#4caf50', marginBottom: '8px', fontWeight: '600' }}>
                      ✅ You Can Watch ({month.contentCount} titles):
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {month.availableContent.map((item, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '4px 10px',
                            background: 'white',
                            border: '1px solid #4caf50',
                            borderRadius: '12px',
                            fontSize: '12px'
                          }}
                        >
                          <span style={{ color: '#2e7d32' }}>
                            {item.title} ({item.platform})
                          </span>
                          <button
                            onClick={() => addToWatchlist(item)}
                            style={{
                              padding: '2px 8px',
                              background: '#4caf50',
                              color: 'white',
                              border: 'none',
                              borderRadius: '8px',
                              fontSize: '11px',
                              cursor: 'pointer',
                              fontWeight: '600'
                            }}
                          >
                            + Track
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
            </>
          ) : (
            /* Fallback if no schedule data */
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>📅</div>
              <h2 style={{ color: '#667eea', marginBottom: '15px' }}>Schedule Not Available</h2>
              <p style={{ color: '#666', fontSize: '16px' }}>
                Add subscriptions and items to your watchlist to see your optimized schedule.
              </p>
            </div>
          )}
        </>
      )}

      {/* Savings Tab */}
      {activeView === 'savings' && (
        <>
          {optimization.spendingBreakdown && optimization.spendingBreakdown.monthlySavings !== undefined ? (
            <>
              {/* Savings Overview */}
              <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)', color: 'white' }}>
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <div style={{ fontSize: '20px', marginBottom: '10px', opacity: 0.9 }}>💸 Total Potential Savings</div>
                  <div style={{ fontSize: '56px', fontWeight: '700', marginBottom: '10px' }}>
                    {formatCurrency(optimization.spendingBreakdown.monthlySavings)}
                  </div>
                  <div style={{ fontSize: '18px', opacity: 0.9 }}>per month</div>
                  <div style={{ fontSize: '24px', marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.2)', borderRadius: '8px' }}>
                    {formatCurrency(optimization.spendingBreakdown.yearlySavings)} per year
                  </div>
                </div>
              </div>

          {/* Spending Comparison */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ color: '#667eea', marginBottom: '20px', fontSize: '24px' }}>
              📊 Spending Comparison
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {/* Current Month */}
              <div style={{ padding: '20px', background: '#fff3e0', borderRadius: '8px', border: '2px solid #ff9800' }}>
                <div style={{ fontSize: '14px', color: '#e65100', marginBottom: '8px', fontWeight: '600' }}>
                  CURRENT MONTH
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#e65100', marginBottom: '10px' }}>
                  {formatCurrency(optimization.spendingBreakdown.currentMonth.total)}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {optimization.spendingBreakdown.currentMonth.subscriptions.length} active subscriptions
                </div>
                <div style={{ marginTop: '15px', fontSize: '12px' }}>
                  {optimization.spendingBreakdown.currentMonth.subscriptions.map((sub, idx) => (
                    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #ffe0b2' }}>
                      <span style={{ fontWeight: '600' }}>{sub.name}</span>
                      <span style={{ float: 'right' }}>{formatCurrency(sub.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next Month (Optimized) */}
              <div style={{ padding: '20px', background: '#e8f5e9', borderRadius: '8px', border: '2px solid #4caf50' }}>
                <div style={{ fontSize: '14px', color: '#2e7d32', marginBottom: '8px', fontWeight: '600' }}>
                  NEXT MONTH (OPTIMIZED)
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#2e7d32', marginBottom: '10px' }}>
                  {formatCurrency(optimization.spendingBreakdown.nextMonth.total)}
                </div>
                <div style={{ fontSize: '13px', color: '#666' }}>
                  {optimization.spendingBreakdown.nextMonth.subscriptions.length} recommended subscriptions
                </div>
                <div style={{ marginTop: '15px', fontSize: '12px' }}>
                  {optimization.spendingBreakdown.nextMonth.subscriptions.map((sub, idx) => (
                    <div key={idx} style={{ padding: '4px 0', borderBottom: '1px solid #c8e6c9' }}>
                      <span style={{ fontWeight: '600' }}>{sub.name}</span>
                      <span style={{ float: 'right' }}>{formatCurrency(sub.cost)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Savings Breakdown */}
              <div style={{ padding: '20px', background: '#f3e5f5', borderRadius: '8px', border: '2px solid #9c27b0' }}>
                <div style={{ fontSize: '14px', color: '#6a1b9a', marginBottom: '8px', fontWeight: '600' }}>
                  YOUR SAVINGS
                </div>
                <div style={{ fontSize: '36px', fontWeight: '700', color: '#6a1b9a', marginBottom: '10px' }}>
                  {formatCurrency(optimization.spendingBreakdown.monthlySavings)}
                </div>
                <div style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                  {Math.round((optimization.spendingBreakdown.monthlySavings / optimization.currentSpending) * 100)}% reduction
                </div>
                <div style={{ marginTop: '15px', fontSize: '13px', padding: '10px', background: 'rgba(156, 39, 176, 0.1)', borderRadius: '6px' }}>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Monthly:</strong> {formatCurrency(optimization.spendingBreakdown.monthlySavings)}
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Quarterly:</strong> {formatCurrency(optimization.spendingBreakdown.monthlySavings * 3)}
                  </div>
                  <div>
                    <strong>Yearly:</strong> {formatCurrency(optimization.spendingBreakdown.yearlySavings)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* What Gets Canceled */}
          {optimization.recommendations.cancel.length > 0 && (
            <div className="card" style={{ marginBottom: '20px' }}>
              <h2 style={{ color: '#e65100', marginBottom: '15px', fontSize: '20px' }}>
                🔻 Subscriptions to Cancel or Rotate
              </h2>
              <div style={{ display: 'grid', gap: '10px' }}>
                {optimization.recommendations.cancel.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      padding: '12px 16px',
                      background: '#fff3e0',
                      border: '1px solid #ffb74d',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: '#e65100'
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Money-Saving Tips */}
          <div className="card">
            <h2 style={{ color: '#667eea', marginBottom: '15px', fontSize: '20px' }}>
              💡 Additional Money-Saving Tips
            </h2>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8' }}>
              {optimization.recommendations.alternatives.map((tip, index) => (
                <li key={index} style={{ marginBottom: '8px', color: '#666' }}>{tip}</li>
              ))}
            </ul>
          </div>
            </>
          ) : (
            /* No Savings Available */
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div style={{ fontSize: '64px', marginBottom: '20px' }}>✅</div>
              <h2 style={{ color: '#4caf50', marginBottom: '15px' }}>You're Already Optimized!</h2>
              <p style={{ color: '#666', marginBottom: '30px', fontSize: '16px' }}>
                Your current subscriptions are well-aligned with your watchlist and interests.
                All your active subscriptions have content you want to watch.
              </p>
              {optimization.currentSpending > 0 && (
                <div style={{ padding: '20px', background: '#f5f7ff', borderRadius: '8px', marginTop: '20px' }}>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Current Monthly Spending</div>
                  <div style={{ fontSize: '36px', fontWeight: '700', color: '#667eea' }}>
                    {formatCurrency(optimization.currentSpending)}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Old Schedule View - keep for compatibility */}
      {activeView === 'oldSchedule' && schedule && (
        <>
          {/* Schedule Summary */}
          <div className="card" style={{ marginBottom: '20px' }}>
            <h2 style={{ color: '#667eea', marginBottom: '20px', fontSize: '24px' }}>
              📊 12-Month Spending Overview
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
              <div style={{ padding: '20px', background: '#f5f7ff', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Current Month</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#667eea' }}>
                  {formatCurrency(schedule.summary.currentMonthTotal)}
                </div>
              </div>
              <div style={{ padding: '20px', background: '#f1f8f4', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Monthly Average</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#4caf50' }}>
                  {formatCurrency(schedule.summary.averageMonthly)}
                </div>
              </div>
              <div style={{ padding: '20px', background: '#fff8e1', borderRadius: '8px', textAlign: 'center' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Yearly Total</div>
                <div style={{ fontSize: '32px', fontWeight: '700', color: '#ff9800' }}>
                  {formatCurrency(schedule.summary.yearlyTotal)}
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Breakdown */}
          <div className="card">
            <h2 style={{ color: '#667eea', marginBottom: '20px', fontSize: '24px' }}>
              📅 Monthly Breakdown
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {schedule.schedule.map((month, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    background: index === 0 ? '#f5f7ff' : '#fafafa',
                    border: index === 0 ? '2px solid #667eea' : '1px solid #e0e0e0',
                    borderRadius: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#333', fontSize: '18px', fontWeight: '600' }}>
                      {index === 0 && '▶️ '}{month.month}
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                      {formatCurrency(month.totalCost)}
                    </div>
                  </div>
                  {month.subscriptions.length > 0 ? (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {month.subscriptions.map((sub, subIndex) => (
                        <span
                          key={subIndex}
                          style={{
                            display: 'inline-block',
                            padding: '6px 12px',
                            background: 'white',
                            border: '1px solid #e0e0e0',
                            borderRadius: '20px',
                            fontSize: '13px',
                            color: '#666'
                          }}
                        >
                          {sub.name} • {formatCurrency(sub.cost)}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p style={{ color: '#999', fontSize: '14px' }}>No active subscriptions</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Rotation Plan View */}
      {activeView === 'rotation' && optimization.recommendations.rotationPlan && (
        <>
          {/* Rotation Summary */}
          <div className="card" style={{ marginBottom: '20px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
            <h2 style={{ fontSize: '28px', marginBottom: '20px' }}>🔄 Smart Rotation Plan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Monthly Budget</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {formatCurrency(optimization.recommendations.rotationPlan.monthlyBudget)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Active at Once</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {optimization.recommendations.rotationPlan.simultaneousServices} / {optimization.recommendations.rotationPlan.totalSubscriptions}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>Yearly Savings</div>
                <div style={{ fontSize: '28px', fontWeight: '700' }}>
                  {formatCurrency(optimization.recommendations.rotationPlan.estimatedSavings)}
                </div>
              </div>
            </div>
          </div>

          {/* Rotation Explanation */}
          <div className="card" style={{ marginBottom: '20px', background: '#f5f7ff' }}>
            <h3 style={{ color: '#667eea', marginBottom: '15px', fontSize: '20px' }}>How It Works</h3>
            <p style={{ lineHeight: '1.8', color: '#555', marginBottom: '15px' }}>
              Instead of keeping all {optimization.recommendations.rotationPlan.totalSubscriptions} subscriptions active year-round,
              rotate between them to stay within your ${formatCurrency(optimization.recommendations.rotationPlan.monthlyBudget)} monthly budget.
              This strategy allows you to:
            </p>
            <ul style={{ marginLeft: '20px', lineHeight: '1.8', color: '#555' }}>
              <li>Access all your subscriptions throughout the year</li>
              <li>Save {formatCurrency(optimization.recommendations.rotationPlan.estimatedSavings)} annually</li>
              <li>Watch content from each platform when you actually use it</li>
              <li>Avoid paying for services you're not actively watching</li>
            </ul>
          </div>

          {/* 12-Month Rotation Schedule */}
          <div className="card">
            <h2 style={{ color: '#667eea', marginBottom: '20px', fontSize: '24px' }}>
              📅 12-Month Rotation Schedule
            </h2>
            <div style={{ display: 'grid', gap: '15px' }}>
              {optimization.recommendations.rotationPlan.months.map((month, index) => (
                <div
                  key={index}
                  style={{
                    padding: '20px',
                    background: index === 0 ? '#f5f7ff' : '#fafafa',
                    border: index === 0 ? '2px solid #667eea' : '1px solid #e0e0e0',
                    borderRadius: '8px',
                    position: 'relative'
                  }}
                >
                  {index === 0 && (
                    <div style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      background: '#667eea',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      START HERE
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                    <h3 style={{ color: '#333', fontSize: '18px', fontWeight: '600' }}>
                      {index === 0 && '▶️ '}Month {month.month}
                    </h3>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: '#667eea' }}>
                      {formatCurrency(month.totalCost)}
                    </div>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px', fontWeight: '600' }}>
                      Active Subscriptions:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {month.subscriptions.map((sub, subIndex) => (
                        <div
                          key={subIndex}
                          style={{
                            padding: '10px 14px',
                            background: 'white',
                            border: '2px solid #667eea',
                            borderRadius: '6px',
                            flex: '1 1 180px'
                          }}
                        >
                          <div style={{ fontSize: '15px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                            {sub.name}
                          </div>
                          <div style={{ fontSize: '13px', color: '#667eea' }}>
                            {formatCurrency(sub.cost)}/mo
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Available Content This Month */}
                  {month.availableContent && month.availableContent.length > 0 && (
                    <div style={{ marginBottom: '15px', padding: '12px', background: '#e8f5e9', borderRadius: '6px' }}>
                      <div style={{ fontSize: '13px', color: '#2e7d32', marginBottom: '8px', fontWeight: '600' }}>
                        ✅ Watch Now ({month.availableContent.length} items):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {month.availableContent.slice(0, 8).map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 8px',
                              background: 'white',
                              border: '1px solid #4caf50',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}
                          >
                            <span style={{ color: '#2e7d32' }}>
                              {item.title}
                            </span>
                            <button
                              onClick={() => addToWatchlist(item)}
                              style={{
                                padding: '2px 8px',
                                background: '#4caf50',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              + Track
                            </button>
                          </div>
                        ))}
                        {month.availableContent.length > 8 && (
                          <span style={{ fontSize: '12px', color: '#666', padding: '4px' }}>
                            +{month.availableContent.length - 8} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Content to Wait For */}
                  {month.waitingContent && month.waitingContent.length > 0 && (
                    <div style={{ marginBottom: '15px', padding: '12px', background: '#fff3e0', borderRadius: '6px' }}>
                      <div style={{ fontSize: '13px', color: '#e65100', marginBottom: '8px', fontWeight: '600' }}>
                        ⏳ Wait For Later ({month.waitingContent.length} items):
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {month.waitingContent.map((item, idx) => (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '4px 8px',
                              background: 'white',
                              border: '1px solid #ff9800',
                              borderRadius: '12px',
                              fontSize: '12px'
                            }}
                          >
                            <span style={{ color: '#e65100' }}>
                              {item.title} ({item.platform})
                            </span>
                            <button
                              onClick={() => addToWatchlist(item)}
                              style={{
                                padding: '2px 8px',
                                background: '#ff9800',
                                color: 'white',
                                border: 'none',
                                borderRadius: '8px',
                                fontSize: '11px',
                                cursor: 'pointer',
                                fontWeight: '600'
                              }}
                            >
                              + Add
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {index < optimization.recommendations.rotationPlan.months.length - 1 && (
                    <div style={{
                      marginTop: '10px',
                      padding: '8px',
                      background: '#e3f2fd',
                      borderRadius: '6px',
                      fontSize: '12px',
                      color: '#1565c0'
                    }}>
                      💡 Cancel at month end, activate next rotation
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Action Tips */}
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>📋 Implementation Tips</h3>
              <ul style={{ marginLeft: '20px', lineHeight: '2' }}>
                <li>Set calendar reminders for the 1st of each month to rotate subscriptions</li>
                <li>Most services allow you to cancel and resubscribe anytime</li>
                <li>Your watch history and preferences are saved even when you cancel</li>
                <li>Consider using a spreadsheet or app to track your rotation schedule</li>
                <li>Some platforms offer "pause" instead of cancel - even better!</li>
              </ul>
            </div>
          </div>
        </>
      )}

      {/* No Rotation Plan Available */}
      {activeView === 'rotation' && !optimization.recommendations.rotationPlan && (
        <div className="card">
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔄</div>
            <h2 style={{ color: '#667eea', marginBottom: '15px' }}>Rotation Plan Not Available</h2>
            <p style={{ color: '#666', marginBottom: '20px', fontSize: '16px' }}>
              You need at least 2 subscriptions to create a rotation plan. Add more subscriptions to get started!
            </p>
            <button
              onClick={() => navigate('/subscriptions')}
              className="btn btn-primary"
              style={{ fontSize: '16px', padding: '12px 30px' }}
            >
              Add Subscriptions
            </button>
          </div>
        </div>
      )}

      {/* Refresh Button */}
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          onClick={fetchOptimizationData}
          className="btn btn-primary"
          style={{ fontSize: '16px', padding: '12px 30px' }}
        >
          🔄 Refresh Analysis
        </button>
      </div>
    </div>
  );
};

export default Recommendations;
