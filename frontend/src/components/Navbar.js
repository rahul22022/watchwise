import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ user, onLogout }) {
  return (
    <div className="navbar">
      <h1>WatchWise</h1>
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
