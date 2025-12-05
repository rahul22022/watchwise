import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Subscriptions from './pages/Subscriptions';
import Interests from './pages/Interests';
import Shows from './pages/Shows';
import Watchlist from './pages/Watchlist';
import Recommendations from './pages/Recommendations';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for Google OAuth redirect with token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const name = urlParams.get('name');
    const email = urlParams.get('email');
    const id = urlParams.get('id');

    if (token && name && email && id) {
      // User logged in via Google OAuth
      localStorage.setItem('token', token);
      setUser({ _id: id, name, email });
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
      setLoading(false);
    } else {
      // Check if user is logged in normally
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        fetchUserData(storedToken);
      } else {
        setLoading(false);
      }
    }
  }, []);

  const fetchUserData = async (token) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      } else {
        localStorage.removeItem('token');
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/subscriptions" /> : <Login onLogin={handleLogin} />} 
          />
          <Route 
            path="/register" 
            element={user ? <Navigate to="/subscriptions" /> : <Register onLogin={handleLogin} />} 
          />
          <Route 
            path="/subscriptions" 
            element={user ? <Subscriptions /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/interests" 
            element={user ? <Interests /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/shows" 
            element={user ? <Shows /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/watchlist" 
            element={user ? <Watchlist /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/recommendations" 
            element={user ? <Recommendations /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/subscriptions" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
