import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <img src="/logo.svg" alt="WatchWise" style={{ width: '40px', height: '40px' }} />
        <div>
          <h1 style={{ margin: 0, fontSize: '24px' }}>WatchWise</h1>
          <p style={{ margin: 0, fontSize: '11px', color: '#667eea', fontStyle: 'italic' }}>Optimize Your Watchlist</p>
        </div>
      </div>
      <nav>
        <Link to="/subscriptions">Subscriptions</Link>
        <Link to="/shows">Shows</Link>
        <Link to="/watchlist">Watchlist</Link>
        <Link to="/recommendations">Optimizer</Link>
        <Link to="/interests">Interests</Link>
        <span style={{ marginLeft: '20px', color: '#667eea' }}>
          Welcome, {user.name}!
        </span>
        <button 
          onClick={onLogout} 
          className="btn btn-secondary"
          style={{ marginLeft: '20px' }}
        >
          Logout
        </button>
      </nav>
    </div>
  );
}

export default Navbar;
