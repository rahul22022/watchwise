import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Register({ onLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [googleOAuthAvailable, setGoogleOAuthAvailable] = useState(true);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const response = await axios.post('/api/auth/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      onLogin(response.data, response.data.token);
      navigate('/subscriptions');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
  };

  const handleGoogleSignup = async (e) => {
    e.preventDefault();
    try {
      // Check if Google OAuth is available
      const response = await axios.get('/api/auth/google', { 
        validateStatus: (status) => status < 500 || status === 503 
      });
      if (response.status === 503) {
        setGoogleOAuthAvailable(false);
        setError('Google sign-up is not configured yet. Please use email/password registration.');
        return;
      }
      // If available, redirect to Google OAuth
      window.location.href = '/api/auth/google';
    } catch (err) {
      setGoogleOAuthAvailable(false);
      setError('Google sign-up is not available. Please use email/password registration.');
    }
  };

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '500px', margin: '50px auto' }}>
        <h2 style={{ textAlign: 'center', color: '#667eea', marginBottom: '30px' }}>
          Create Your Account
        </h2>
        
        {error && <div className="error" style={{ marginBottom: '20px', textAlign: 'center' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Enter your password (min 6 characters)"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              placeholder="Confirm your password"
            />
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Register
          </button>
        </form>

        <div style={{ textAlign: 'center', margin: '20px 0', color: '#666' }}>
          - OR -
        </div>

        <button
          onClick={handleGoogleSignup}
          className="btn"
          type="button"
          disabled={!googleOAuthAvailable}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            background: googleOAuthAvailable ? 'white' : '#f5f5f5',
            color: googleOAuthAvailable ? '#333' : '#999',
            border: '2px solid #e0e0e0',
            textDecoration: 'none',
            cursor: googleOAuthAvailable ? 'pointer' : 'not-allowed'
          }}
        >
          <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
            <path fill="#4285F4" d="M24 9.5c3.9 0 6.9 1.4 9 2.6l6.6-6.6C35.5 2.1 30.1 0 24 0 14.6 0 6.7 5.3 2.9 13l7.7 6c1.8-5.4 6.8-9.5 13.4-9.5z"/>
            <path fill="#34A853" d="M46.1 24.5c0-1.6-.1-2.8-.4-4.1H24v7.8h12.4c-.5 2.8-2.2 5.2-4.6 6.8l7.2 5.6c4.2-3.9 6.7-9.6 6.7-16.1z"/>
            <path fill="#FBBC05" d="M10.6 28.5c-.6-1.8-.9-3.7-.9-5.7s.3-3.9.9-5.7l-7.7-6C1.1 15.2 0 19.5 0 24s1.1 8.8 2.9 12.2l7.7-6z"/>
            <path fill="#EA4335" d="M24 48c6.5 0 11.9-2.1 15.9-5.7l-7.2-5.6c-2.1 1.4-4.8 2.3-8.7 2.3-6.6 0-12.2-4.5-14.2-10.5l-7.7 6C6.7 42.7 14.6 48 24 48z"/>
          </svg>
          Sign up with Google {!googleOAuthAvailable && '(Not Configured)'}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#666' }}>
          Already have an account? <Link to="/login" style={{ color: '#667eea', fontWeight: '600' }}>Login here</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;
